// src/ai-agents/coordinatorAgent/index.js
import { randomUUID } from "node:crypto";
import { selectImpl } from "../_shared/loadAgentModule.js";

/**
 * Contrato estável do agente:
 * - Named export: run(input, ctx)
 * - Default export: { run }
 * - selectImpl retorna um objeto que tem .run (normalizado)
 */
export async function run(input, ctx = {}) {
  const impl = await selectImpl(
    () => import("./impl_mock.js"),
    () => import("./impl_openai.js"),
    ctx.mode // "mock" | "openai" | "auto"
  );

  const ensuredCtx = {
    ...ctx,
    traceId: ctx.traceId || randomUUID(),
  };

  // Cada impl_* deve exportar default { run }
  // e selectImpl já deve normalizar para algo com .run
  return impl.run(input, ensuredCtx);
}

export default { run };
// default export para compatibilidade com importações antigas usando import coordinatorAgent from '...';
// agora você pode usar tanto import { run } from '...' quanto import coordinatorAgent from '...' e chamar coordinatorAgent.run()
// Isso facilita a transição e mantém compatibilidade com código existente.
// Certifique-se de que seus agentes implementem e exportem a função run corretamente.  