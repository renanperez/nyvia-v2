// src/ai-agents/adCopyAgent/index.js
import { runWithMode } from "../_shared/loadAgentModule.js";
import { randomUUID } from "node:crypto";

const AGENT_NAME = "adCopyAgent";

// Normaliza o payload para { adCopies: [...] } (e preserva meta quando fizer sentido)
function normalizeResultPayload(r) {
  if (r == null) return { adCopies: [], meta: { empty: true, agent: AGENT_NAME } };

  // string única -> vira 1 item
  if (typeof r === "string") {
    const s = r.trim().replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    return { adCopies: [s], meta: { raw_text: s.slice(0, 2000), agent: AGENT_NAME } };
  }

  // array direto -> já é a lista de ad copies
  if (Array.isArray(r)) return { adCopies: r, meta: { agent: AGENT_NAME } };

  // objeto com campos comuns
  if (Array.isArray(r?.adCopies)) return { adCopies: r.adCopies, meta: r.meta ?? { agent: AGENT_NAME } };
  if (Array.isArray(r?.items))    return { adCopies: r.items,    meta: r.meta ?? { agent: AGENT_NAME } };

  // fallback: tenta achar algo imprimível
  return { adCopies: [JSON.stringify(r).slice(0, 2000)], meta: { agent: AGENT_NAME, fallback: true } };
}

/**
 * Executa o agente de Ad Copy.
 * - Seleção de impl (mock|openai|auto) delegada ao runWithMode.
 * - ctx.mode (se vier) tem precedência sobre NYVIA_MOCK_MODE.
 * - traceId é garantido para debug/observabilidade.
 */
export async function run(input, ctx = {}) {
  const ensuredCtx = {
    ...ctx,
    traceId: ctx.traceId || randomUUID(),
    agentName: ctx.agentName || AGENT_NAME,
  };

  const { result /* , source, fallback */ } = await runWithMode(
    () => import("./impl_mock.js"),
    () => import("./impl_openai.js"),
    ensuredCtx.mode,
    input,
    ensuredCtx
  );

  // sempre normalize para { adCopies: [...] }
  return normalizeResultPayload(result);
}

// Compatível com import default
export default { run };
// default export para compatibilidade com importações antigas usando import adCopyAgent from '...';
// agora você pode usar tanto import { run } from '...' quanto import adCopyAgent from '...' e chamar adCopyAgent.run()
// Isso facilita a transição e mantém compatibilidade com código existente.
// Certifique-se de que seus agentes implementem e exportem a função run corretamente.
// src/ai-agents/adCopyAgent/index.js