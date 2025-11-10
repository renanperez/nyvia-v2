// src/app/api/logs/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { findLogs, findLogsByTraceId } from "../../../server/db/logsRepository.js";

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

// Helpers de resposta (síncronos; não precisam de try)
function ok(payload) {      //  F3-07-B: Resposta OK
  return NextResponse.json(payload, { status: 200 });
}
function bad(detail, meta = {}) {   // F3-07-B: Requisição inválida
  return NextResponse.json(
    { success: false, error: "bad_request", detail, meta },
    { status: 400 }
  );
}
function boom(err) {    //  F3-07-B: Erro interno
  return NextResponse.json(
    {
      success: false,
      error: "internal_error",
      meta: { message: err?.message ?? String(err) }
    },
    { status: 500 }
  );
}
//-------------------
// GET /api/logs
//  Consulta logs com filtros opcionais
//  • Se traceId fornecido, usa findLogsByTraceId (com os outros filtros e limit) 

export async function GET(req) {
// Extrai query params    
  const { searchParams } = new URL(req.url);

  // 🔎 filtros     
  const traceId = searchParams.get("traceId") || undefined;
  const level = searchParams.get("level") || undefined;
  const stepStartsWith = searchParams.get("stepStartsWith") || undefined;

  // F3-07-A: appEnv é OPCIONAL (se não vier, não filtra)
  // única variável de ambiente vinda da query string (não do cabeçalho)
  // se fornecida, deve ser trim() e não vazia
  // se não fornecida, undefined (não filtra)
  const appEnvFilter = searchParams.get("appEnv")?.trim() || undefined;

  // F3-07-A: limit default 50; clamp 1..100
  const limitRaw = Number(searchParams.get("limit"));
  const limit = clamp(Number.isFinite(limitRaw) ? limitRaw : 50, 1, 100);

  // ✅ validações leves (fora do try)
  if (searchParams.has("limit") && !Number.isFinite(limitRaw)) {
    return bad("Parâmetro 'limit' deve ser numérico.", { received: searchParams.get("limit") });
  }

  // 🔧 trecho crítico (I/O com DB) — encapsulado no try
  try {
  const data = traceId
    ? await findLogsByTraceId(traceId, { appEnv: appEnvFilter, level, stepStartsWith, limit })
    : await findLogs({ appEnv: appEnvFilter, level, stepStartsWith, limit });

  return ok({
    success: true,
    count: data.length,
    data,
    meta: {
      query: { traceId, level, stepStartsWith, appEnv: appEnvFilter ?? null },
      limit,
      sort: { createdAt: -1 },
      ts: new Date().toISOString()
    }
  });
} catch (err) {
  return boom(err);
}
}  //-------------------

// src/server/db/logsRepository.js
//  Repositório de logs no MongoDB
//  • Funções para logs no MongoDB (insertLog, insertLogs, findLogs)
//    import { getDb } from "./mongoClient.js";
//    import { ObjectId } from "mongodb";
//  
//  • Cada log:
//    - _id: ObjectId (gerado automaticamente)
//    - traceId: string (ID da requisição/execução; pode ser null/undefined)
//    - appEnv: string (ambiente da aplicação, ex: "development", "production")
//    - level: string (nível do log, ex: "info", "error", "debug")
//    - step: string (etapa ou componente, ex: "auth", "db", "api")
//    - message: string (mensagem do log)
//    - meta: object (dados adicionais, pode ser null/undefined)
//    - createdAt: Date (data/hora do log, padrão: agora)
//
//  Índices:
//    - traceId + appEnv + createdAt (para consultas por traceId/appEnv ordenadas por createdAt)
//    - appEnv + createdAt (para consultas por appEnv ordenadas por createdAt)
//    - level + createdAt (para consultas por level ordenadas por createdAt)