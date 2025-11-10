// src/ai-agents/keywordAgent/impl_openai.js
import { callOpenAI } from "../../utils/openai/callOpenAI.js";

function makeLogger(traceId) {
  const t0 = Date.now(),
    logs = [];
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

export async function run(input = {}, ctx = {}) {
  const traceId = ctx.traceId || crypto.randomUUID();
  const { log, logs } = ctx.logger || makeLogger(traceId);

  const { briefing = "", persona = "", objetivo = "" } = input;
  log("keywords:start", { mode: "openai" });

  const prompt = `
Gere de 8 a 12 palavras-chave (uma por linha) relacionadas a:
Briefing: ${briefing}
Persona: ${persona}
Objetivo: ${objetivo}
Responda apenas a lista, uma por linha.
`.trim();

  let text = "";
  try {
    const res = await callOpenAI({ prompt });
    text = res?.text ?? res?.raw ?? "";
    log("keywords:openai:success");
  } catch (err) {
    log("keywords:openai:error", { error: String(err) }, "error");
    throw err;
  }

  const terms = String(text)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const matchTypes = ["exact", "phrase", "broad"];
  const keywords = terms
    .slice(0, 12)
    .map((term, i) => ({ term, matchType: matchTypes[i % 3] }));

  log("keywords:done", { total: keywords.length });

  return { keywords, meta: { source: "openai", traceId }, logs };
}

export default { run };

// src/ai-agents/keywordAgent/impl_openai.js
// Esta implementação do KeywordAgent utiliza a API da OpenAI para gerar palavras-chave relevantes.
// A implementação é facilmente extensível, permitindo a adição de novos formatos de palavras-chave ou a modificação dos existentes sem impactar todo o sistema.
// A abordagem modular também facilita a realização de testes e a manutenção do código.
// A implementação do KeywordAgent é um exemplo de como a orquestração de agentes pode ser realizada de forma eficiente e escalável.
