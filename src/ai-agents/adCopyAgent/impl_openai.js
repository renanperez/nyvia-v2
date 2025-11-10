// src/ai-agents/adCopyAgent/impl_openai.js
import { callOpenAI } from "../../utils/openai/callOpenAI.js";
import { randomUUID } from "crypto";

// ------------------------------------------------------------------------
// Helpers locais para parse seguro
// - stripFences: remove ```json / ``` e espaços extras
// - safeParse: tenta JSON.parse; se falhar, tenta extrair o 1º bloco {...};
//              se ainda assim falhar, retorna objeto com texto cru.
// ------------------------------------------------------------------------
function stripFences(s = "") {
  return String(s).replace(/```json|```/g, "").trim();
}
function safeParse(maybe) {
  if (maybe == null) return {};
  if (typeof maybe !== "string") return maybe;
  const s = stripFences(maybe);
  try {
    return JSON.parse(s);
  } catch {
    const m = s.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {}
    }
    return { text: s };
  }
}

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

export async function run(input, ctx = {}) {
  const traceId = ctx.requestId || ctx.traceId || randomUUID();
  const { log, logs } = ctx.logger || makeLogger(traceId);

  const {
    briefing = "",
    persona = "",
    objetivo = "",
    keywords = [],
    canalPrioritario = [],
  } = input;

  log("adcopy:start", { mode: "openai" });

  const kwLine =
    Array.isArray(keywords) && keywords.length
      ? `Palavras-chave (contexto): ${keywords
          .map((k) => (typeof k === "string" ? k : k?.term))
          .filter(Boolean)
          .join(", ")}`
      : "";

  const prompt = `
Você é um redator publicitário sênior.
Gere uma headline e uma descrição curtas e persuasivas para um anúncio.

Briefing: ${briefing}
Persona (público-alvo): ${persona}
Objetivo: ${objetivo}
${kwLine}

Responda APENAS em JSON válido no formato:
{"headline": "...", "descricao": "..."}
`.trim();

  let response;
  try {
    response = await callOpenAI({ prompt });
    log("adcopy:openai:success");
  } catch (err) {
    log("adcopy:openai:error", { error: String(err) }, "error");
    throw err;
  }

  // callOpenAI pode retornar { raw, text } se não for JSON puro
  const raw = response?.raw ?? response?.text ?? "";
  let parsed = {};
  try {
    parsed = safeParse(raw);
  } catch {
    const m = String(raw).match(/\{[\s\S]*\}/);
    if (m) {
      try {
        parsed = safeParse(m[0]);
      } catch {}
    }
    const parsed = safeParse(raw);
  }

  const headline = parsed?.headline || "Headline não disponível";
  const descricao = parsed?.descricao || "Descrição não disponível";

  const adCopies = [
    {
      channel:
        Array.isArray(canalPrioritario) && canalPrioritario[0]
          ? canalPrioritario[0]
          : "Generic",
      headline,
      description: descricao,
      cta: "Saiba mais",
    },
  ];

  log("adcopy:done", { total: adCopies.length });

  return { adCopies, meta: { source: "openai", traceId }, logs };
}

export default { run };

// Esta implementação de agente de cópia de anúncio utiliza a API da OpenAI para gerar textos publicitários.
// A implementação é facilmente extensível, permitindo a adição de novos formatos de anúncios ou a modificação dos existentes sem impactar todo o sistema.
// A abordagem modular também facilita a realização de testes e a manutenção do código.
// A implementação do agente de cópia de anúncio é um exemplo de como a orquestração de agentes pode ser realizada de forma eficiente e escalável.
// ------------------------------------------------------------------------