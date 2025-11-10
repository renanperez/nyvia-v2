import { selectImpl } from "../_shared/loadAgentModule.js";

export async function run(input, ctx = {}) {
  const impl = await selectImpl(
    () => import("./impl_mock.js"),
    () => import("./impl_openai.js"),
    ctx.mode,
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
// src/ai-agents/performanceDashboardAgent/index.js
// Padrão Nyvia: selecionar impl via selectImpl- Seletor central de implementação (mock|openai), com suporte a ctx.mode e NYVIA_MOCK_MODE(mock|openai)
//  Isso permite a flexibilidade de alternar entre diferentes implementações com base no contexto da solicitação.
//  Além disso, o uso de um contexto permite rastrear e correlacionar solicitações de forma mais eficaz.
//  Isso facilita a identificação de problemas e a otimização do desempenho dos agentes.
