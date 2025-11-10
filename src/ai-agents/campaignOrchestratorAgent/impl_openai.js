// src/ai-agents/campaignOrchestratorAgent/impl_openai.js

import {
  toInternal,
  toPublic,
} from "../../contracts/mappers/campaignOrchestrator.mappers.js";
import { run as runCoordinator } from "../coordinatorAgent/index.js";

const APP_ENV = APP_ENV || "development";
const RAW_MODE = NYVIA_MOCK_MODE || "openai";
const DEFAULT_STAGE_TIMEOUT_MS = Number(
  process.env.NYVIA_STAGE_TIMEOUT_MS || 10_000,
);

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

async function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise(
    (_, reject) =>
      (timer = setTimeout(
        () => reject(new Error(`Timeout: ${label} (${ms}ms)`)),
        ms,
      )),
  );
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
function canFallbackPerStage() {
  return (
    (APP_ENV === "staging" || APP_ENV === "development") && RAW_MODE === "auto"
  );
}
async function runStage({ label, runOpenAI, runMock, timeoutMs, logger }) {
  const ms = timeoutMs ?? DEFAULT_STAGE_TIMEOUT_MS;
  logger.log(`${label}:start`, { mode: "openai", msTimeout: ms });
  try {
    const res = await withTimeout(runOpenAI(), ms, label);
    logger.log(`${label}:success`, { mode: "openai" });
    return { res, source: "openai", fellBack: false };
  } catch (err) {
    logger.log(`${label}:error`, {
      mode: "openai",
      error: err?.message || String(err),
    });
    if (APP_ENV === "production" || !canFallbackPerStage()) throw err;
    logger.log(`${label}:fallback:start`, { mode: "mock" });
    const res = await withTimeout(runMock(), ms, `${label}:mock`);
    logger.log(`${label}:fallback:success`, { mode: "mock" });
    return { res, source: "mock", fellBack: true };
  }
}

export async function run(input = {}, ctx = {}) {
  const traceId = ctx.traceId || crypto.randomUUID();
  const logger = ctx.logger || makeLogger(traceId);
  const stageTimeoutMs = ctx.stageTimeoutMs || DEFAULT_STAGE_TIMEOUT_MS;

  logger.log("campaign:start", { appEnv: APP_ENV, rawMode: RAW_MODE });

  const internalReq = toInternal(input);
  logger.log("campaign:toInternal", { ok: true });

  const {
    res: internalResult,
    source: stageSource,
    fellBack,
  } = await runStage({
    label: "coordinator",
    runOpenAI: () =>
      runCoordinator(internalReq, { ...ctx, logger, traceId, mode: "openai" }),
    runMock: () =>
      runCoordinator(internalReq, { ...ctx, logger, traceId, mode: "mock" }),
    timeoutMs: stageTimeoutMs,
    logger,
  });

  const publicOut = toPublic(internalResult);
  logger.log("campaign:toPublic", { ok: true });

  let source = "openai";
  if (fellBack && stageSource === "mock") source = "mixed";
  if (!fellBack && stageSource === "mock") source = "mock";

  logger.log("campaign:done", { source });

  return {
    status: "success",
    source,
    traceId,
    createdAt: new Date().toISOString(),
    campaignPlan: {
      ...(publicOut?.campaignPlan || publicOut),
      adVariants:
        publicOut?.campaignPlan?.adVariants ??
        publicOut?.campaignPlan?.adCopies ??
        [],
      performanceNotes: publicOut?.campaignPlan?.performanceNotes ?? [],
    },
    logs: logger.logs, // ✅ sempre logger.logs
  };
}

export default { run };

// Esta implementação do CampaignOrchestratorAgent utiliza a API da OpenAI para orquestrar múltiplos agentes de IA.
// O mock pode ser facilmente substituído por uma implementação real quando necessário.
// Isso facilita a transição entre ambientes de desenvolvimento e produção.
// A implementação mockada é útil para testes, permitindo que os desenvolvedores verifiquem
// se a lógica de orquestração está funcionando corretamente
// sem depender de chamadas reais à API da OpenAI.
