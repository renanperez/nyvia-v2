// Força runtime Node.js para compatibilidade com crypto e dynamic import
export const runtime = "nodejs";
// src/app/api/keywords/route.js
import { NextResponse } from "next/server";
import keywordAgent from "../../../ai-agents/keywordAgent/index.js";

export async function POST(req) {
  try {
    const body = await req.json();
    const { briefing, persona, objetivo } = body || {};
    // Validação de dados de entrada
    if (!briefing || !persona || !objetivo) {
      return NextResponse.json(
        { success: false, error: "Dados incompletos. Esperado briefing, persona, objetivo." },
        { status: 400 }
      );
    }

    const result = await keywordAgent.run({ briefing, persona, objetivo });
    const payload =
      result?.success !== undefined ? result : { success: true, data: result };

    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error("[API /keywords ERROR]", err);
    return NextResponse.json(
      { success: false, error: "Erro interno", detail: err.message },
      { status: 500 }
    );
  }
}

/**
 * Strict summary:
 * Handles POST requests for keyword generation.
 * - Expects JSON body with briefing, persona, objetivo (all required).
 * - Returns 400 if any field is missing.
 * - Calls keywordAgent with input, returns result as JSON (200).
 * - Logs debug info if enabled.
 * - Catches errors, logs, and returns 500 with error details.
 */

/**
 * API route handler for generating keywords.
 *
 * Expects a POST request with JSON body containing:
 * - briefing: string
 * - persona: string
 * - objetivo: string
 *
 * Returns:
 * - 200: JSON with generated keywords
 * - 400: JSON error if required fields are missing
 * - 500: JSON error for internal server issues
 */
