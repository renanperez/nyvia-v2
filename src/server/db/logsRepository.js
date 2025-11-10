// src/server/db/logsRepository.js

import { getDb } from "./client.js"; // mantém seu padrão
import { APP_ENV } from "../../config/env.js"; // importa APP_ENV para uso nos logs

const COLL = "logs";
let _indexesOk = false;

// Teto defensivo para dados anexados ao log
const MAX_DATA_BYTES = 16_000; // ~16 KB
//  Evita armazenar blobs grandes ou não serializáveis
//  Retorna { _truncated: true, approxBytes } se exceder
function clampData(data) {
  try {
    // Se já for string, mede direto; se objeto, serializa
    const s = typeof data === "string" ? data : JSON.stringify(data);
    if (s.length > MAX_DATA_BYTES) {
      return { _truncated: true, approxBytes: s.length };
    }
    return data;
  } catch {
    return { _truncated: true, reason: "non-serializable" };
  }
}

// 🔒  Escape seguro p/ montar RegExp com entrada do usuário (evita regex injection e erros)
function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


/** Cria os índices uma única vez por processo. (idempotente e tolerante a erro) */
async function ensureIndexes(db) {
  if (_indexesOk) return;
  const coll = db.collection(COLL);
  // Cria índice para busca por traceId, appEnv e createdAt (mais recente primeiro)
  try {
    await coll.createIndexes([
      { key: { traceId: 1, createdAt: -1 }, name: "traceId_createdAt" },
      { key: { traceId: 1, appEnv: 1, createdAt: -1 }, name: "traceId_appEnv_createdAt" },
    ]);
  } catch (e) {
    console.warn("[logsRepository.ensureIndexes] createIndexes failed:", e?.message || e);
  }

  _indexesOk = true;
}

/**
 * Insere UMA linha de log.
 * Assinatura compatível com coordinator e /api/logs:
 *   insertLog({ traceId, step, level="info", data?, appEnv?, message?, timestamp? })
 * Lança apenas em erro de parâmetros ou de DB (a rota chamadora deve capturar).
 * @returns {import("mongodb").ObjectId} insertedId
 */
export async function insertLog({
  traceId,
  step,
  level = "info",
  data = null,
  appEnv,
  message,
  timestamp,
} = {}) {
  if (!traceId) throw new Error("insertLog: 'traceId' é obrigatório.");
  if (!step) throw new Error("insertLog: 'step' é obrigatório.");

  const db = await getDb();
  await ensureIndexes(db);

  const env = String(appEnv || APP_ENV).trim();   // usa appEnv fornecido ou o global

  const doc = {
    traceId: String(traceId),        // UUID ou string qualquer que identifique a execução
    step: String(step),              // ex.: "start", "fetching", "parsing", "error", "done"
    level: String(level),            // "info" | "warn" | "error"
    appEnv: env,                      // "production" | "staging" | "development" | etc
    ...(message ? { message: String(message) } : {}),
    ...(data !== null ? { data: clampData(data) } : {}),
    createdAt: timestamp ? new Date(timestamp) : new Date(), // aceita timestamp externo ou usa agora
  };

  const { insertedId } = await db.collection(COLL).insertOne(doc);
  return insertedId;
}

/**
 * (Opcional) Insere várias linhas em lote.
 * Útil quando acumula eventos e quer persistir de uma vez.
 * Lança em falha para o chamador decidir (ex.: rota tratar e seguir).  
 * @param {Array} items Array de objetos com os mesmos campos de insertLog()
 * @returns {Object} { insertedIds } do MongoDB (índices dos itens no array original)
 */
export async function insertLogs(items = []) {
  if (!Array.isArray(items) || items.length === 0) return { insertedCount: 0 };

  const db = await getDb();
  await ensureIndexes(db);
  const now = new Date();

  const docs = items.map((it = {}) => {
    const env = String(it.appEnv || APP_ENV).trim();

    return {
    traceId: String(it.traceId),
    step: String(it.step),
    level: String(it.level ?? "info"),
    appEnv: env,
    ...(it.message ? { message: String(it.message) } : {}),
    ...(it.data !== undefined ? { data: clampData(it.data) } : {}),
    createdAt: it.createdAt
    ? new Date(it.createdAt) 
    : (it.timestamp 
      ? new Date(it.timestamp) 
      : now),
    };
  });


  try {
    const res = await db.collection(COLL).insertMany(docs);
    return { insertedIds: res.insertedIds };
  } catch (e) {
    console.error("[logsRepository.insertLogs] insertMany failed:", e?.message || e);
    throw e;
  }
}  //-------------------

/*
 * Consulta logs (mais recentes primeiro).
 * Filtros suportados:
 *  - traceId (igualdade)
 *  - appEnv (igualdade)
 *  - level (igualdade)
 *  - stepStartsWith (prefixo via regex)
 *  - limit (1..500)
 */
export async function findLogs({
  traceId,
  appEnv,
  level,
  stepStartsWith,
  limit = 50,
} = {}) {
  const db = await getDb();
  await ensureIndexes(db);

  // F3-07-A: default 50; clamp 1..100
  const n = Number(limit);
  const parsed = Number.isFinite(n) ? n : 50;
  const safeLimit = Math.min(Math.max(parsed, 1), 100);

  const q = {};     // query builder  
  if (traceId) q.traceId = String(traceId); // exato, não case insensitive
  if (appEnv) q.appEnv = String(appEnv).trim();  // exato, não case insensitive
  if (level) q.level = String(level); // exato, não case insensitive
  if (stepStartsWith) q.step = { $regex: `^${escapeRegex(stepStartsWith)}` }; // prefixo seguro

  return db
    .collection(COLL)
    .find(q)
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .toArray();
}

/**
 * Consulta logs por traceId (wrapper para findLogs)
 * Retorna array vazio se traceId não fornecido (sem lançar)
 * Delegar para findLogs (mantendo os mesmos filtros e limit) findLogsByTraceId(traceId, opts?)
 */
export async function findLogsByTraceId(
  traceId,
  { appEnv, level, stepStartsWith, limit = 50 } = {}
) {
  if (!traceId) return [];
  return findLogs({ traceId, appEnv, level, stepStartsWith, limit });
}


// -- Fim do logsRepository.js --
//  • Funções para logs no MongoDB (insertLog, insertLogs, findLogs)
//  • Índices para consultas por traceId/appEnv ordenadas por createdAt
//  • clampData para evitar payloads grandes/não serializáveis
//  • Pronto para uso pelo coordinator e pelo endpoint /api/logs
//  • Lança erros de parâmetros ou DB para o chamador tratar
//  • Uso assíncrono, await insertLog({ ... })
//  • Veja exemplos de uso em src/app/api/coordinator/route.js e src/app/api/logs/route.js