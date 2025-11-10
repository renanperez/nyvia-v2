import { selectImpl } from "../_shared/loadAgentModule.js";

export async function run(input, ctx = {}) {
  // selectImpl decide entre impl_mock e impl_openai com base em ctx.mode ou NYVIA_MOCK_MODE
  const impl = await selectImpl(
    () => import("./impl_mock.js"), // Carrega a implementação mock
    () => import("./impl_openai.js"), // Carrega a implementação OpenAI
    ctx.mode, // modo de operação atual ou modo de operação do ambiente (NYVIA_MOCK_MODE)
  );

  // ✅ Injeta traceId se faltar (guard-raíl)
  //  Se o traceId não estiver presente no contexto, gera um novo UUID
  const ensuredCtx = {
    ...ctx,
    traceId: ctx.traceId || crypto.randomUUID(),
  };

  return impl.run(input, ensuredCtx);
}

export default { run };

// src/ai-agents/campaignOrchestratorAgent/index.js
// Padrão Nyvia: selecionar impl via selectImpl- Seletor central de implementação (mock|openai), com suporte a ctx.mode e NYVIA_MOCK_MODE(mock|openai)
//  Isso permite a flexibilidade de alternar entre diferentes implementações com base no contexto da solicitação.
//  Além disso, o uso de um contexto permite rastrear e correlacionar solicitações de forma mais eficaz.
//  Isso facilita a identificação de problemas e a otimização do desempenho dos agentes.
