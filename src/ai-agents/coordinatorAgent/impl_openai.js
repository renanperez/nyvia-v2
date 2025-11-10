// src/ai-agents/coordinatorAgent/impl_openai.js
import { randomUUID } from "node:crypto";

// -----------------------------
// Logger simples (opcional)
// -----------------------------
function makeLogger(traceId) {
  const t0 = Date.now(), logs = [];
  const log = (step, data = {}, level = "info") =>
    logs.push({
      traceId,
      step,
      level,
      data,
      timestamp: new Date().toISOString(),
      msFromStart: Date.now() - t0,
    });
  return { log, logs };
}

// -----------------------------
// Resolve uma função run a partir de vários formatos de export
// -----------------------------
function resolveRun(mod, label) {
  if (mod && typeof mod.run === "function") return mod.run;                // named export run
  if (mod && typeof mod.default === "function") return mod.default;        // default export é função
  if (mod && mod.default && typeof mod.default.run === "function") return mod.default.run; // default { run }
  throw new TypeError(`${label}: função run não encontrada (default/run)`);
}

export async function run(input = {}, ctx = {}) {
  const traceId = ctx.traceId || randomUUID();
  const mode = ctx.mode ?? NYVIA_MOCK_MODE;
  const { log, logs } = ctx.logger || makeLogger(traceId);

  const briefing = input?.briefing?.trim() || "";
  const persona  = input?.persona?.trim()  || "";
  const objetivo = input?.objetivo?.trim() || "";
  const canalPrioritario = Array.isArray(input?.canalPrioritario) ? input.canalPrioritario : [];

  log("coordinator:start", { mode: "openai", canalPrioritario });

  // 🔽 Import dinâmico dentro do handler (capturável por try/catch de quem chama a função)
  const kwMod = await import("../keywordAgent/index.js");
  const adMod = await import("../adCopyAgent/index.js");

  const runKeywordAgent = resolveRun(kwMod, "keywordAgent");
  const runAdCopyAgent  = resolveRun(adMod, "adCopyAgent");

  const childCtx = { ...ctx, traceId, mode: "openai" };

  // 1) Keywords: usa as keywords recebidas ou gera novas
  let keywords = Array.isArray(input?.keywords) ? input.keywords : [];
  if (!keywords.length) {
    const kwOut = await runKeywordAgent(
      { briefing, persona, objetivo, canalPrioritario },
      childCtx
    );
    
    // aceita formatos comuns: {data:{keywords}}, {keywords}, ou array direto
    keywords = kwOut?.data?.keywords ?? kwOut?.keywords ?? kwOut ?? [];
    if (!Array.isArray(keywords)) keywords = [];
  }
  log("coordinator:keywords:done", { total: keywords.length });

  // 2) Ad copies usando keywords finais
  const adOut = await runAdCopyAgent(
    { briefing, persona, objetivo, keywords, canalPrioritario },
    childCtx
  );
  // aceita {data:…} ou objeto direto
  const adCopies = adOut?.data?.adCopies ?? adOut?.adCopies ?? adOut ?? [];
  log("coordinator:adcopy:done", { total: Array.isArray(adCopies) ? adCopies.length : 0 });

  // 3) Notas de performance (placeholder)
  const performanceNotes = [
    "Monitore CTR nos 3 primeiros dias; troque criativos <0,8% CTR.",
    "Aplique negativas semanais em Search para reduzir CPC.",
  ];
  log("coordinator:performance:done", { notes: performanceNotes.length });

  // 4) Orçamento e KPIs (default se não vier no input)
  const budget = input?.budget ?? {
    total: 1000,
    allocation: [
      { channel: "Meta Ads",      percent: 60 },
      { channel: "Google Search", percent: 40 },
    ],
  };
  const kpis = input?.kpis ?? ["CTR", "CPC", "CPA", "Leads", "Conversões"];
  const etapas = [
    { etapa: 1, descricao: "Gerar palavras-chave",        outputRef: "keywords" },
    { etapa: 2, descricao: "Criar variações de anúncios", outputRef: "adCopies" },
    { etapa: 3, descricao: "Definir orçamento e KPIs" },
  ];

  log("coordinator:end", { ok: true });

  // Mantém o mesmo shape que você já tinha
  return {
    meta: { source: "openai", traceId, mode: "openai" },
    campaignPlan: {
      briefing,
      persona,
      objetivo,
      keywords,
      adCopies,
      performanceNotes,
      budget,
      kpis,
      etapas,
    },
    logs,
  };
}

export default { run };
// src/ai-agents/coordinatorAgent/impl_openai.js
// Padrão Nyvia: implementar run para o agente openai
// export async function run(input, ctx) { ... }
// default export para compatibilidade com importações antigas usando import coordinatorAgent from '...';
// agora você pode usar tanto import { run } from '...' quanto import coordinatorAgent from '...' e chamar coordinatorAgent.run()
// Isso facilita a transição e mantém compatibilidade com código existente.
// Certifique-se de que seus agentes implementem e exportem a função run corretamente.
  // src/ai-agents/_shared/loadAgentModule.js
  // src/ai-agents/coordinatorAgent/index.js
  // src/ai-agents/coordinatorAgent/impl_mock.js  
  // src/ai-agents/coordinatorAgent/impl_openai.js   "Loader deve ser função de import() ou um Promise/módulo"
  // src/app/api/coordinator/route.js
  // src/app/api/healthz/route.js   

