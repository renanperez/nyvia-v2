// Força runtime Node.js: crypto.randomUUID e comportamento consistente
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { run as runOrchestrator } from "../../../ai-agents/campaignOrchestratorAgent/index.js";

// UUID nativo — sem dependência externa
const uuid = () => crypto.randomUUID();

export async function POST(req) {
  const traceId = uuid(); // trace por request
  try {
    const body = await req.json();
    const {
      briefing,
      persona,
      objetivo,
      keywords = [],
      canalPrioritario,
      lingua,
    } = body || {};

    if (!briefing || !persona || !objetivo) {
      return NextResponse.json(
        {
          status: "error",
          traceId,
          message: "Dados incompletos. Esperado briefing, persona, objetivo.",
        },
        { status: 400 },
      );
    }

    const result = await runOrchestrator(
      { briefing, persona, objetivo, keywords, canalPrioritario, lingua },
      { traceId },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[API /campaign-orchestrator ERROR]", err?.message, {
      traceId,
      stack: err?.stack,
    });
    const status = err?.response?.status || 500;
    return NextResponse.json(
      {
        status: "error",
        traceId,
        message: "Campaign orchestrator failed",
        detail: err?.message,
      },
      { status },
    );
  }
}

// Este endpoint orquestra a criação de campanhas publicitárias usando múltiplos agentes de IA.
// e permite a personalização do processo de criação de campanhas.
//  Através do uso de um contexto (ctx), é possível adaptar o comportamento dos agentes
//  de acordo com as necessidades específicas de cada campanha.
//  Isso inclui a personalização de parâmetros, a seleção de modelos de IA e a definição de
//  estratégias de interação com o usuário.
//  Além disso, o uso de um contexto permite rastrear e correlacionar solicitações de forma mais eficaz.
//  Isso facilita a identificação de problemas e a otimização do desempenho dos agentes.
