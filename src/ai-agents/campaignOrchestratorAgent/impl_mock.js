// src/ai-agents/campaignOrchestratorAgent/impl_mock.js

// logger padrão
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

// helpers determinísticos para o mock
function seedFromText(text = "") {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h >>> 0;
}
function pick(arr, n = 1, seed = 1) {
  const out = [];
  let s = seed || 1;
  for (let i = 0; i < arr.length; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const r = s % 1000;
    if (r < 500 && out.length < n) out.push(arr[i]);
  }
  while (out.length < n && arr.length > 0)
    out.push(arr[out.length % arr.length]);
  return out.slice(0, n);
}

// stubs
function stubKeywordAgent({ briefing, persona, objetivo, providedKeywords }) {
  const seed = seedFromText(`${briefing}|${persona}|${objetivo}`);
  const themed = [
    briefing?.split(" ")[0]?.toLowerCase() || "produto",
    persona?.split(" ")[0]?.toLowerCase() || "publico",
    objetivo?.split(" ")[0]?.toLowerCase() || "objetivo",
  ].filter(Boolean);
  const generic = [
    "premium",
    "preço",
    "oferta",
    "desconto",
    "lançamento",
    "teste grátis",
  ];
  const raw = [
    ...themed.map((t) => `${t} premium`),
    ...themed.map((t) => `${t} preço`),
    ...pick(generic, 5, seed),
  ];
  const unique = Array.from(new Set([...(providedKeywords || []), ...raw]));
  const matchTypes = ["exact", "phrase", "broad"];
  const keywords = unique
    .slice(0, 12)
    .map((term, i) => ({ term, matchType: matchTypes[i % 3] }));
  return {
    keywords,
    notes: "Simulado pelo orchestrator/mock (não chamou keywordAgent real).",
  };
}
function stubAdCopyAgent({ briefing, persona, objetivo, keywords }) {
  const primary = keywords?.[0]?.term || "sua melhor escolha";
  const alt = keywords?.[1]?.term || "agora mesmo";
  return {
    adCopies: [
      {
        channel: "Meta Ads",
        headline: `Novo ${primary} para ${persona?.toLowerCase() || "você"}`,
        primaryText: `Chegou a hora: ${briefing || "aproveite nossa oferta"}. Pensado para ${persona || "seu perfil"}. Objetivo: ${objetivo || "resultados de verdade"}.`,
        description: `Descubra benefícios reais e comece ${alt} hoje.`,
        cta: "Saiba mais",
      },
      {
        channel: "Google Search",
        headline: `${primary} | Oferta oficial`,
        description: `${briefing || "Garanta condições especiais"} — ideal para ${persona || "seu perfil"}.`,
        path: "promo",
        cta: "Comprar",
      },
    ],
    notes: "Simulado pelo orchestrator/mock (não chamou adCopyAgent real).",
  };
}

// run (mock orquestrador)
export async function run(input = {}, ctx = {}) {
  const traceId = ctx.traceId || crypto.randomUUID();
  const { log, logs } = ctx.logger || makeLogger(traceId);

  const briefing = input?.briefing?.trim() || "Briefing de exemplo";
  const persona = input?.persona?.trim() || "Persona exemplo";
  const objetivo = input?.objetivo?.trim() || "Objetivo exemplo";
  const providedKeywords = Array.isArray(input?.keywords)
    ? input.keywords
    : undefined;

  log("START", { briefing, persona, objetivo });

  const kw = stubKeywordAgent({
    briefing,
    persona,
    objetivo,
    providedKeywords,
  });
  log("KEYWORDS_DONE", { total: kw.keywords.length });

  const ad = stubAdCopyAgent({
    briefing,
    persona,
    objetivo,
    keywords: kw.keywords,
  });
  log("ADCOPY_DONE", { total: ad.adCopies.length });

  const performanceNotes = [
    "Start com aprendizado: 3–5 dias antes de otimizar lances.",
    "Meta Ads: monitore CTR e frequência; pause criativos <0,8% CTR.",
    "Search: negative keywords semanais para reduzir CPC.",
    "Realocar verba para anúncios com CPA abaixo da meta.",
  ];
  log("PERFORMANCE_DONE", { notes: performanceNotes.length });

  const budget = {
    total: 1000,
    allocation: [
      { channel: "Meta Ads", percent: 60 },
      { channel: "Google Search", percent: 40 },
    ],
  };
  const kpis = ["CTR", "CPC", "CPA", "Leads", "Conversões"];
  const etapas = [
    {
      etapa: 1,
      descricao: "Gerar palavras-chave baseadas no briefing e persona",
      outputRef: "keywords",
    },
    {
      etapa: 2,
      descricao: "Criar variações de anúncios para Meta e Search",
      outputRef: "adCopies",
    },
    {
      etapa: 3,
      descricao: "Distribuir orçamento e definir KPIs de monitoramento",
    },
  ];

  log("END", { ok: true });

  const out = {
    status: "success",
    source: ctx.source || "mock",
    createdAt: new Date().toISOString(),
    campaignPlan: {
      briefing,
      persona,
      objetivo,
      keywords: kw.keywords,
      adCopies: ad.adCopies,
      adVariants: ad.adCopies, // alias
      performanceNotes,
      budget,
      kpis,
      etapas,
    },
    logs,
  };

  out.logs.push({
    step: "orchestrator:end",
    traceId,
    timestamp: new Date().toISOString(),
    msFromStart: logs.at(-1)?.msFromStart ?? 0,
  });
  return out;
}

export default { run };

// Esta implementação mock do CampaignOrchestratorAgent simula a orquestração de agentes de IA
// Ela é útil para desenvolvimento e testes, permitindo verificar a integração sem chamadas reais.
// O mock pode ser facilmente substituído por uma implementação real quando necessário.
// Isso facilita a transição entre ambientes de desenvolvimento e produção.
// A implementação mockada é útil para testes, permitindo que os desenvolvedores verifiquem
// se a lógica de orquestração está funcionando corretamente
// sem depender de chamadas reais à API da OpenAI.
