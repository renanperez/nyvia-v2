export function toInternal(input /* CampaignOrchestratorInputV1 */) {
  return {
    briefing: input.briefing,
    persona: input.persona,
    objetivo: input.objetivo,
    keywords: Array.isArray(input.keywords) ? input.keywords : [],
  }; // CoordinationRequestV1
}

export function toPublic(output /* CoordinationResultV1 */, source = "mock") {
  return {
    status: "success",
    source,
    campaignPlan: {
      briefing: output.briefing,
      persona: output.persona,
      objetivo: output.objetivo,
      keywords: output.keywords || [],
      adCopies: output.adCopies || [],
      budget: output.budget || { total: 0, allocation: [] },
      kpis: output.kpis || [],
      etapas: output.etapas || [],
    },
  }; // CampaignOrchestratorOutputV1
}
//* Hoje é identidade. Amanhã, se os contratos divergirem, você altera só aqui.
// Mesmo sendo identidade hoje, o mapper é o ponto de desacoplamento para evoluções.
// Quando os contratos divergirem, você muda só aqui e mantém o core intacto.
// Se precisar de transformação, faça aqui mesmo. exemplo:
//  output.keywords.map(keyword => ({ ...keyword, term: keyword.term.toUpperCase() }));
//  output.adCopies.map(ad => ({ ...ad, headline: ad.headline.toUpperCase() }));
//  output.budget.allocation.map(item => ({ ...item, channel: item.channel.toUpperCase() }));
//  output.kpis.map(kpi => kpi.toUpperCase());
//  output.etapas.map(etapa => ({ ...etapa, descricao: etapa.descricao.toUpperCase() }));
