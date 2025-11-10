// Repositório de "runs" com índices e padronizações mínimas (F3-05)
// Função: persistir runs (sucesso/erro) e permitir consultas/telemetria rápidas.
// Motivo: precisamos indexar por createdAt/status/traceId para observabilidade na Fase 3.
// Justificativa: índices => consultas rápidas; campos derivados => compatível com seu schema atual e com os critérios da F3-05.

import { getDb } from "./client.js";
import { APP_ENV, NODE_ENV } from "../../config/env.js"; // ✅ novo import centralizado

const COLL = "runs";

// cria índices uma única vez por processo
let _indexesOk = false;
async function ensureIndexes(db) {
  if (_indexesOk) return;
  const coll = db.collection(COLL);
  await Promise.all([
    // timeline
    coll.createIndex({ createdAt: -1 }, { name: "createdAt_desc" }),
    // busca por traceId em dois lugares (compat/backfill)
    coll.createIndex({ traceId: 1 }, { name: "traceId_root_asc" }),
    coll.createIndex({ "output.meta.traceId": 1 }, { name: "output.meta.traceId_asc" }),
    // filtros de estado
    coll.createIndex({ status: 1 }, { name: "status_asc" }),
  ]);
  _indexesOk = true;
}

/**
 * Salva um run no banco (compatível com o seu formato atual).
 * Aceita campos como: runId, traceId, agent, stage, status, durationMs, env, mode, inputSummary, outputSummary, error
 * e deriva alguns padronizados da F3-05:
 *  - createdAt (carimbo do servidor)
 *  - duration_ms (alias de durationMs)
 *  - output.meta.traceId (se vier traceId solto)
 */
export async function saveRun(run) {
  const db = await getDb();
  await ensureIndexes(db);
  const coll = db.collection(COLL);

  // Padronizações mínimas sem quebrar seu contrato
  const duration_ms = run.duration_ms ?? run.durationMs ?? null;

  // Se vier traceId solto, refletimos em output.meta.traceId para facilitar consultas futuras
  let output = run.output;
  if (run.traceId && !(run.output?.meta?.traceId)) {
    output = {
      ...(run.output || {}),
      meta: { ...(run.output?.meta || {}), traceId: run.traceId },
    };
  }

    const doc = {
    ...run,
    appEnv: APP_ENV,        // 👈 ambiente lógico da aplicação (staging, production, etc.)
    nodeEnv: NODE_ENV,      // 👈 informação do runtime Node (production no Railway)
    ...(duration_ms != null ? { duration_ms } : {}),
    ...(output ? { output } : {}),
    createdAt: new Date(),
  };


  const res = await coll.insertOne(doc);
  return { insertedId: res.insertedId };
}

// (Opcional) helper com nome “F3-05 style”, mantendo compat
export const insertRun = saveRun;
 // * Aceita um array de runs (mesma estrutura do saveRun).
