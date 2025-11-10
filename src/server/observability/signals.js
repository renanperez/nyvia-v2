// src/server/observability/signals.js
export function summarizeRequest(input = {}) {
  // Nunca retorna texto bruto de briefing/persona/objetivo
  const { briefing, persona, keywords } = input;

  const hasBriefing =
    typeof briefing === 'string'
      ? briefing.trim().length > 0
      : Boolean(briefing);

  const keywordsCount = Array.isArray(keywords) ? keywords.length : 0;

  const personaKind =
    persona && typeof persona === 'object'
      ? (persona.kind || 'unknown')
      : (typeof persona === 'string' ? 'string' : typeof persona);

  const inputSizeBytes = Buffer.byteLength(
    JSON.stringify({
      // medimos tamanho do input todo, mas não retornamos o conteúdo
      ...input,
      // reforço defensivo: remove campos potencialmente sensíveis
      briefing: undefined,
      objective: undefined,
      persona: undefined,
    }),
    'utf8'
  );

  return { hasBriefing, keywordsCount, personaKind, inputSizeBytes };
}
