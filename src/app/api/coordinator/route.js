// src/app/api/coordinator/route.js
export const runtime = "nodejs"; // usa Node, não Edge (precisa de node:crypto e acesso ao MongoDB)

import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { saveRun } from "../../../server/db/runsRepository.js";
import { insertLog } from "../../../server/db/logsRepository.js"; // envelope logs
import { summarizeRequest } from "../../../server/observability/signals.js";
import { APP_ENV, NYVIA_MOCK_MODE } from "../../../config/env.js";

// Nota: o coordinatorAgent é importado dinamicamente dentro do handler POST
// Isso evita que a API falhe no carregamento se o módulo do agente tiver problemas
// (ex.: dependência faltando, erro de sintaxe, etc)
// Assim, erros de importação são capturados e logados apropriadamente
export async function POST(req) {
  // ⏱ início da medição da requisição (mantemos startedAt porque você usa no saveRun)
  const startedAt = Date.now();

  // ID preliminar para garantir log de start no stdout e na GUI do vendor antes de ler o body
  const requestId = randomUUID();
  console.log(`[coordinator][start] traceId=${requestId} route=/api/coordinator`);

  const appEnv = APP_ENV; // captura o APP_ENV atual
  let traceIdScoped = requestId; // mantém o mesmo ID no catch por padrão (caso o body quebre)

  try {
    // ⚠️ Import dinâmico dentro do try:
    // se o módulo do agente quebrar no carregamento, cai no catch abaixo
    const { run: runCoordinator } = await import(
      "../../../ai-agents/coordinatorAgent/index.js"
    );

    const body = await req.json();
    const { briefing, persona, objetivo, keywords = [] } = body || {};

    // ID definitivo: prioriza o que vier do cliente (body.meta.traceId)
    const traceId = body?.meta?.traceId || requestId;
    if (traceId !== requestId) {
      console.log(`[coordinator][traceId-remap] from=${requestId} to=${traceId}`);
    }
    traceIdScoped = traceId; // guarda para uso no catch

    // ✅ sinais (sem payload)
    const sinais = summarizeRequest(body);

    // 🔖 start (logs → apenas sinais)
    try {
      const _id = await insertLog({
        traceId,
        step: "coordinator:start",
        level: "info",
        data: sinais, // apenas sinais
        appEnv,
      });
      console.log("[insertLog ok] coordinator:start", String(_id));
    } catch (e) {
      console.error("[insertLog start]", e?.message || e);
    }

    // validação mínima
    if (!briefing || !persona || !objetivo) {
      const payload = {
        success: false,
        error: "Dados incompletos. Esperado briefing, persona, objetivo.",
        meta: { traceId, requestId }, // garante mesmo traceId na resposta de erro
      };
      try {
        const _id = await insertLog({
          traceId,
          step: "coordinator:error",
          level: "error",
          data: { message: "validation_error" },
          appEnv,
        });
        console.log("[insertLog ok] coordinator:error", String(_id));
      } catch (e) {
        console.error("[insertLog error]", e?.message || e);
      }

      // best-effort: grava erro de validação (runs com governança)
      try {
        const inputForRun =
          appEnv === "development" ? { briefing, persona, objetivo, keywords } : sinais;
        await saveRun({
          requestId,
          endpoint: "/api/coordinator",
          appEnv,
          mockMode: NYVIA_MOCK_MODE,
          duration_ms: Date.now() - startedAt,
          status: "error",
          input: inputForRun,
          output: payload,
          createdAt: new Date(),
        });
      } catch (e) {
        console.error("[runsRepository.saveRun validation]", e?.message || e);
      }

      return NextResponse.json(payload, { status: 400 });
    }

    // ✅ chama coordinator.run com input e ctx explícitos
    const input = { briefing, persona, objetivo, keywords };
    const ctx = { requestId, traceId, mode: NYVIA_MOCK_MODE }; // propaga traceId e o mockMode já resolvido

    const result = await runCoordinator(input, ctx);

    // mantém seu contrato atual (envelopa só se vier “cru”)
    const payload =
      result?.success !== undefined ? result : { success: true, data: result };

    // 🔗 Unifica o trace também no payload de sucesso
    if (payload?.data) {
      payload.data.meta = { ...(payload.data.meta || {}), traceId, requestId };
    } else {
      payload.meta = { ...(payload.meta || {}), traceId, requestId };
    }

    // === EA-01 shim (dev-only) ===
    const ea01On = String(process.env.NYVIA_EA01_MODE || "off").toLowerCase() === "on";
    const isDev = appEnv === "development";

    if (ea01On && isDev && payload?.data) {
      const text = extractAdText(payload.data);
      const { scores, rationale } = quickHeuristicEval(text, body?.persona, body?.keywords);

      // adiciona ao meta (mantendo o que já existe)
      payload.data.meta = {
        ...(payload.data.meta || {}),
        guardrailsApplied: true,
        attempts: 1,
        scores,
        rationale,
      };

      // log leve para auditoria (não bloqueia)
      try {
        const _id = await insertLog({
          traceId,
          step: "ea01:quality",
          level: "info",
          data: { scores, rationale, sample: String(text || "").slice(0, 160) },
          appEnv,
        });
        console.log("[insertLog ok] ea01:quality", String(_id));
      } catch (e) {
        console.error("[insertLog ea01]", e?.message || e);
      }
    }

    // Heurísticas simples p/ cumprir o DoD sem LLM/DB (escopo local/dev)
    function extractAdText(data) {
      return (
        data?.adCopy?.text ||
        data?.adCopy ||
        data?.campaignPlan?.adCopy ||
        data?.campaignPlan?.copy ||
        data?.text ||
        ""
      );
    }

    function quickHeuristicEval(text = "", persona = "", keywords = []) {
      const hay = String(text).toLowerCase();

      // 3 critérios do EA-01
      const ctas = ["compre", "saiba mais", "assine", "teste", "aproveite", "garanta", "experimente"];
      const banned = ["garantido", "100%", "milagroso", "sem riscos", "resultados garantidos"];
      const personaTokens = String(persona).toLowerCase().split(/\W+/).filter(Boolean);

      const ctaHit = ctas.some((c) => hay.includes(c)) ? 1 : 0.4; // CTA claro
      const personaHit = personaTokens.length && personaTokens.some((t) => hay.includes(t)) ? 1 : 0.5; // tom/linguagem
      const claimsClean = banned.some((b) => hay.includes(b)) ? 0 : 1; // sem promessas proibidas

      const scores = {
        cta_clarity: Number(ctaHit.toFixed(2)),
        persona_fit: Number(personaHit.toFixed(2)),
        prohibited_claims: Number(claimsClean.toFixed(2)),
      };
      const rationale = `CTA:${scores.cta_clarity} | Persona:${scores.persona_fit} | Claims:${scores.prohibited_claims}`;
      return { scores, rationale };
    }
    // === /EA-01 shim ===

    // 🔒 Hook neutro de versão/extensões (não altera comportamento em erro)
    // Se houver `data`, adiciona `meta.schemaVersion` e `meta.extensions`.
    const data = payload?.data || null;
    const dataWithSchema = data
      ? {
          ...data,
          meta: { ...(data?.meta || {}), schemaVersion: "1.0", extensions: {} }, // extensões futuras aqui
        }
      : null;
    const finalPayload = dataWithSchema ? { ...payload, data: dataWithSchema } : payload; // reenvia sem data se não tinha

    // marca done (não bloqueia)
    try {
      const _id = await insertLog({ traceId, step: "coordinator:done", level: "info", appEnv });
      console.log("[insertLog ok] coordinator:done", String(_id));
    } catch (e) {
      console.error("[insertLog done]", e?.message || e);
    }

    // log de conclusão no stdout (aparece no Render)
    console.log(
      `[coordinator][done] traceId=${traceId} status=200 durationMs=${Date.now() - startedAt}`
    );

    // best-effort: grava sucesso (runs com governança)
    try {
      const inputForRun = appEnv === "development" ? input : sinais;
      await saveRun({
        requestId,
        endpoint: "/api/coordinator",
        appEnv,
        mockMode: NYVIA_MOCK_MODE,
        status: finalPayload?.success === false ? "error" : "ok",
        input: inputForRun,
        output: finalPayload,
        createdAt: new Date(),
      });
    } catch (e) {
      console.error("[runsRepository.saveRun success]", e?.message || e);
    }

    return NextResponse.json(finalPayload, { status: 200 });
  } catch (err) {
    // Em staging, exponha stack para diagnóstico rápido; em prod fica curto e genérico
    const detail = err?.stack || err?.message || String(err);
    const status = err?.response?.status || 500;

    try {
      const _id = await insertLog({
        traceId: traceIdScoped || requestId, // preserva correlação se já tínhamos lido o body
        step: "coordinator:error",
        level: "error",
        data: { message: String(detail).slice(0, 2000) },
        appEnv,
      });
      console.log("[insertLog ok] coordinator:error", String(_id));
    } catch (e) {
      console.error("[insertLog error]", e?.message || e);
    }

    // resposta de erro genérica (com meta alinhada)
    const payload = {
      success: false,
      error: "Coordinator failed",
      detail,
      meta: { traceId: traceIdScoped || requestId, requestId },
    };

    // log de erro no stdout com correlação (aparece no Render)
    console.error(`[coordinator][error] traceId=${traceIdScoped || requestId} ${detail}`);
    console.error("[/api/coordinator ERROR]", detail);

    // best-effort: grava erro
    try {
      await saveRun({
        requestId,
        endpoint: "/api/coordinator",
        appEnv,
        mockMode: NYVIA_MOCK_MODE,
        duration_ms: Date.now() - startedAt,
        status: "error",
        input: undefined, // nunca salva body em erro genérico
        output: payload,
        createdAt: new Date(),
      });
    } catch (e) {
      console.error("[runsRepository.saveRun error]", e?.message || e);
    }

    return NextResponse.json(payload, { status });
  }
}

// Nota sobre saveRun: é uma função assíncrona que grava detalhes da execução no MongoDB
// Ela tenta gravar tanto sucessos quanto falhas, mas falhas na gravação não bloqueiam a resposta da API
// Isso é "best-effort logging" para auditoria e análise posterior
// Você pode ajustar o que é salvo conforme suas necessidades (input, output, status, timestamps, etc)
// Certifique-se de que o MongoDB está acessível e que a coleção está configurada corretamente
// para evitar erros de conexão ou gravação.
// Veja src/server/db/runsRepository.js para detalhes da implementação de saveRun.
// -----------------------
// Use este endpoint para iniciar o agente coordenador.
// Envie um POST para /api/coordinator com JSON contendo briefing, persona, objetivo e keywords.
// Exemplo de corpo:
//{
//  "briefing": "Precisamos criar uma campanha de marketing para um novo produto.",
//  "persona": "Profissionais de marketing",
//  "objetivo": "Aumentar a conscientização sobre o produto",
//  "keywords": ["marketing", "produto", "campanha"]
//}
// A resposta conterá a estrutura gerada pelo agente coordenador.
// O campo meta na resposta inclui traceId e requestId para rastreamento.
// Certifique-se de definir a variável de ambiente NYVIA_MOCK_MODE para "on", "off" ou "auto" conforme necessário.
// O endpoint suporta logging detalhado e gravação de runs para auditoria.
// Em caso de erros, mensagens detalhadas são fornecidas em ambientes de staging para facilitar o diagnóstico.
// Em produção, mensagens de erro são mais genéricas para segurança.
// O endpoint também inclui um "shim" de avaliação heurística simples (EA-01) que pode ser ativado em desenvolvimento
// definindo NYVIA_EA01_MODE como "on". Isso adiciona scores e rationale ao meta na resposta para ajudar na validação rápida.
// -----------------------