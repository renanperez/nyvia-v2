// Força runtime Node.js para compatibilidade com crypto e dynamic import
export const runtime = "nodejs";
// src/app/api/performance-dashboard/route.js
import { NextResponse } from "next/server";
import dashboardAgent from "../../../ai-agents/performanceDashboardAgent/index.js";

export async function POST(req) {
  try {
    const body = await req.json();
    const { campaign_id, kpis_desejados = [] } = body || {};
    // Validação de dados de entrada
    if (!campaign_id) {
      return NextResponse.json(
        { success: false, error: "Dados incompletos. Esperado campaign_id." },
        { status: 400 }
      );
    }

    const result = await dashboardAgent.run({ campaign_id, kpis_desejados }); // Executa o agente de desempenho e obtém os resultados
    const payload =
      result?.success !== undefined ? result : { success: true, data: result }; // Normaliza o resultado e garante que tenha um formato consistente

    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error("[API /performance-dashboard ERROR]", err);
    return NextResponse.json(
      { success: false, error: "Erro interno", detail: err.message },
      { status: 500 }
    );
  }
}

/**
 * API Route: /api/performance-dashboard
 * Handles POST requests to generate performance dashboard data using AI agent.
 *
 * Expects JSON body with:
 * - briefing: string
 * - persona: string
 * - objetivo: string
 *
 * Returns:
 * - 200: JSON result from AI agent
 * - 400: Error if required fields are missing
 * - 500: Internal server error
 */
