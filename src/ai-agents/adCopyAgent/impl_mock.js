// src/ai-agents/adCopyAgent/impl_mock.js
// Mock defensivo: não depende de mapper externo e não lança erro se faltar campo.

export default {
  async run(input = {}, ctx = {}) {
    const {
      briefing = "Gerar anúncio curto",
      product = "Produto",
      audience = "Público",
      persona = "Marca",
      locale = "pt-BR",
      tone = "direto",
      variantCount = 1,
    } = input || {};

    const headline = `🔥 ${product}: oferta imperdível`;
    const body =
      `Para ${audience}. ${briefing}. ` +
      `Experimente ${product} hoje — resultado rápido com ${persona}.`;
    const cta = "Saiba mais";

    // sempre retorna ao menos 1 variação
    const items = Array.from({ length: Math.max(1, Number(variantCount) || 1) }, (_, i) => ({
      id: `mock-${i + 1}`,
      headline,
      text: body,
      cta,
      tone,
    }));

    return {
      locale,
      variantCount: items.length,
      items,
      meta: { mock: true, agent: "adCopyAgent" },
    };
  },
};

// Nota: Esta é uma implementação mock e não deve ser usada em produção.
// Para testes, você pode simular diferentes cenários e verificar se o agente se comporta conforme o esperado.
// ------------------------------------------------------------------------
