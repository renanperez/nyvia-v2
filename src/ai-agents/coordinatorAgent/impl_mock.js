// src/ai-agents/coordinatorAgent/impl_mock.js
import { randomUUID } from "node:crypto";

// Logger simples com carimbo de tempo
function makeLogger(traceId) {
  const t0 = Date.now();
  const logs = [];
  const log = (step, data = {}, level = "info") => {
    logs.push({
      traceId,
      step,
      level,
      data,
      timestamp: new Date().toISOString(),
      msFromStart: Date.now() - t0,
    });
  };
  return { log, logs };
}

/**
 * Contrato estável:
 * - Named export: run(input, ctx)
 * - Default export: { run }
 * Retorna um campaignPlan mockado, sem depender de outros agentes.
 */
export async function run(input = {}, ctx = {}) {
  const traceId = ctx.traceId || randomUUID();
  const { log, logs } = ctx.logger || makeLogger(traceId);

  const briefing = (input?.briefing ?? "Briefing exemplo").toString().trim();
  const persona  = (input?.persona  ?? "Persona exemplo").toString().trim();
  const objetivo = (input?.objetivo ?? "Objetivo exemplo").toString().trim();

  const provided = Array.isArray(input?.keywords) ? input.keywords : [];

  log("mock:start", {
    hasBriefing: !!briefing,
    hasPersona:  !!persona,
    hasObjetivo: !!objetivo,
  });

  // 1) Keywords (mock)
  log("keywords:start");
  const baseKeywords = provided.length
    ? provided
    : [
        "lançamento premium",
        "oferta oficial",
        "frete grátis",
        "compra segura",
        "garantia",
        "desconto exclusivo",
        "produto original",
        "parcelamento",
      ];
  const keywords = baseKeywords.slice(0, 8).map((term) => String(term));
  log("keywords:success", { count: keywords.length });

  // 2) Ad copies (mock)
  log("adcopy:start");
  const first = keywords[0] ?? "produto";
  const adCopies = [
    {
      channel: "Meta Ads",
      headline: `Novo ${first}`,
      primaryText: briefing,
      cta: "Saiba mais",
    },
    {
      channel: "Google Search",
      headline: `${first} | Oferta`,
      description: objetivo,
      path: "promo",
      cta: "Comprar",
    },
  ];
  log("adcopy:success", { count: adCopies.length });

  // 3) Orçamento, KPIs, notas de performance (mock)
  const performanceNotes = [
    "Start com aprendizado: 3–5 dias antes de otimizar lances.",
    "Meta Ads: pause criativos com CTR < 0,8%.",
    "Search: aplique negativas semanais para reduzir CPC.",
    "Aumente budget nos anúncios com CPA abaixo da meta.",
  ];

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

  const campaignPlan = {
    briefing,
    persona,
    objetivo,
    keywords,
    adCopies,
    performanceNotes,
    budget,
    kpis,
    etapas,
  };

  log("mock:done", { ok: true });

  return {
    meta: { source: "mock", traceId, mode: "mock" },
    campaignPlan,
    logs,
  };
}

export default { run };
// default export para compatibilidade com importações antigas usando import coordinatorAgent from '...';
// agora você pode usar tanto import { run } from '...' quanto import coordinatorAgent from '...' e chamar coordinatorAgent.run()
// Isso facilita a transição e mantém compatibilidade com código existente.
// Certifique-se de que seus agentes implementem e exportem a função run corretamente.
// src/ai-agents/coordinatorAgent/impl_mock.js  
// src/ai-agents/_shared/loadAgentModule.js
// src/ai-agents/coordinatorAgent/index.js
// src/ai-agents/coordinatorAgent/impl_mock.js
// src/ai-agents/coordinatorAgent/impl_openai.js
// "Loader deve ser função de import() ou um Promise/módulo"