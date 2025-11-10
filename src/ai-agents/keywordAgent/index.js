// src/ai-agents/keywordAgent/index.js
import { selectImpl } from "../_shared/loadAgentModule.js";
import { randomUUID } from "node:crypto";

// mantém compatibilidade com seu selectImpl(mode)
const getImpl = (mode) =>
  selectImpl(
    () => import("./impl_mock.js"),
    () => import("./impl_openai.js"),
    mode
  );

// Named export + default export
export async function run(input = {}, ctx = {}) {
  // Agora selectImpl já devolve { run }
  const { run: implRun } = await getImpl(ctx?.mode);

  if (typeof implRun !== "function") {
    throw new Error("keywordAgent: implementação sem run()");
  }

  // injeta traceId se faltar (usa node:crypto)
  const ensuredCtx = {
    ...ctx,
    traceId: ctx?.traceId || randomUUID(),
  };

  return implRun(input, ensuredCtx);
}

export default { run };
// default export para compatibilidade com importações antigas usando import keywordAgent from '...';
// agora você pode usar tanto import { run } from '...' quanto import keywordAgent from '...' e chamar keywordAgent.run()
// Isso facilita a transição e mantém compatibilidade com código existente.     
// Certifique-se de que seus agentes implementem e exportem a função run corretamente.
// src/ai-agents/keywordAgent/index.js  
// src/ai-agents/_shared/loadAgentModule.js
// src/ai-agents/keywordAgent/impl_mock.js
// src/ai-agents/keywordAgent/impl_openai.js
// src/ai-agents/coordinatorAgent/index.js
// src/ai-agents/coordinatorAgent/impl_mock.js
// src/ai-agents/coordinatorAgent/impl_openai.js