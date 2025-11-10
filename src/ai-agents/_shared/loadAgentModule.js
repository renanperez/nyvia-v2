// src/ai-agents/_shared/loadAgentModule.js

// ------------------------------------------------------------------------
// Helpers centrais para seleção de implementação (mock|openai|auto)
// ------------------------------------------------------------------------

// Normaliza o modo de operação (mock|openai). Outros sinônimos também.
export function normalizeMode(raw) {
  const v = String(raw || "").toLowerCase();
  if (v === "openai" || v === "real" || v === "prod") return "openai";
  return "mock";
}

// Cache por modo (memorização de módulos já carregados)
// Agora cacheamos o OBJETO NORMALIZADO { run }.
const memo = { mock: null, openai: null };

// ------------------------------------------------------------------------
// LOG CENTRALIZADO
// ------------------------------------------------------------------------
function logAgentSelection(agentName, mode, source, reason = null) {
  const env = APP_ENV || "unknown";
  const msg =
    `[nyvia] agent=${agentName || "unknown"} env=${env} ` +
    `mode=${String(mode)} source=${source}` +
    (reason ? ` fallback_reason=${reason}` : "");
  console.log(msg);
}

// ------------------------------------------------------------------------
// Resolver universal para .run, default, default.run
// (mantemos por compatibilidade interna, mas o selectImpl já normaliza)
// ------------------------------------------------------------------------
function resolveRun(mod) {
  if (typeof mod?.run === "function") return mod.run;
  if (typeof mod?.default === "function") return mod.default;           // default é a própria função
  if (typeof mod?.default?.run === "function") return mod.default.run;  // default objeto com run
  throw new Error("Agent impl inválida: missing run(input, ctx)");
}

// ------------------------------------------------------------------------
// Seleciona implementação (mock|openai) — AGORA retorna SEMPRE { run }
// ------------------------------------------------------------------------
export async function selectImpl(loadMock, loadOpenAI, ctxMode) {
  const envMode = NYVIA_MOCK_MODE;
  const mode = normalizeMode(ctxMode || envMode);
  const cacheKey = mode;

  if (memo[cacheKey]) return memo[cacheKey]; // cache hit

  const pick = mode === "openai" ? loadOpenAI : loadMock;

  let mod;
  if (typeof pick === "function") {
    mod = await pick();          // loader via dynamic import()
  } else if (pick && typeof pick === "object") {
    mod = await pick;            // promise/módulo já resolvido
  } else {
    throw new TypeError(
      "selectImpl: loader deve ser função de import() ou um Promise/módulo",
    );
  }

  // 🔽 NORMALIZA para um objeto { run: Function } em todos os casos
  const candidate = mod?.default ?? mod;

  const runFn =
    // caso { run: f }
    (candidate && typeof candidate.run === "function" && candidate.run) ||
    // caso default export seja uma função
    (typeof candidate === "function" ? candidate : undefined) ||
    // caso named export run direto no módulo
    (typeof mod?.run === "function" ? mod.run : undefined);

  if (typeof runFn !== "function") {
    const keys =
      candidate && typeof candidate === "object"
        ? Object.keys(candidate).join(", ")
        : String(candidate);
    throw new TypeError(
      `selectImpl: função 'run' não encontrada na implementação. candidate keys=[${keys}]`
    );
  }

  const normalized = { run: runFn };
  memo[cacheKey] = normalized;
  return normalized;
}

// ------------------------------------------------------------------------
// Suporte ao modo "auto" (mixed)
// ------------------------------------------------------------------------
export function isAutoMode(raw) {
  const v = String(raw || "").toLowerCase();
  return v === "auto" || v === "mixed";
}

/**
 * Executa o agente considerando mock|openai|auto.
 * - ctxMode tem precedência; se ausente, cai para NYVIA_MOCK_MODE
 * - auto: tenta OpenAI (se houver OPENAI_API_KEY); em erro → fallback mock; sem chave → mock direto
 * Retorna { result, source, fallback? } sem alterar o shape do resultado do agente.
 */
export async function runWithMode(loadMock, loadOpenAI, ctxMode, input, ctx) {
  const envMode = NYVIA_MOCK_MODE;
  const modeRaw = ctxMode ?? envMode;
  const agentName = ctx?.agentName || ctx?.agent || ctx?.name || "unknown";

  // ----------------------------------------------------------------------
  // AUTO / MIXED
  // ----------------------------------------------------------------------
  if (isAutoMode(modeRaw)) {
    const hasKey = !!process.env.OPENAI_API_KEY;

    // AUTO com chave OPENAI → tenta openai, se falhar → mock
    if (hasKey) {
      try {
        const openaiMod = await selectImpl(loadMock, loadOpenAI, "openai");
        const result = await openaiMod.run(input, ctx);
        logAgentSelection(agentName, "auto", "openai");
        return { result, source: "openai" };
      } catch (err) {
        // falhou no openai → cai para mock
        const mockMod = await selectImpl(loadMock, loadOpenAI, "mock");
        const result = await mockMod.run(input, ctx);
        logAgentSelection(agentName, "auto", "mock", "openai_error");
        return {
          result,
          source: "mock",
          fallback: { reason: "openai_error", message: err?.message || String(err) },
        };
      }
    }

    // AUTO sem chave OPENAI → mock direto
    const mockMod = await selectImpl(loadMock, loadOpenAI, "mock");
    const result = await mockMod.run(input, ctx);
    logAgentSelection(agentName, "auto", "mock", "missing_openai_key");
    return { result, source: "mock", fallback: { reason: "missing_openai_key" } };
  }

  // ----------------------------------------------------------------------
  // FLUXO CLÁSSICO (mock | openai)
  // ----------------------------------------------------------------------
  const chosenMod = await selectImpl(loadMock, loadOpenAI, modeRaw);
  const source = normalizeMode(modeRaw); // "mock" ou "openai"
  const result = await chosenMod.run(input, ctx);
  logAgentSelection(agentName, source, source);
  return { result, source };
}

// ------------------------------------------------------------------------
// API simplificada: executa usando env/ctx
// ------------------------------------------------------------------------
export async function runAgent(loadMock, loadOpenAI, input, ctx) {
  const mode = ctx?.mode ?? NYVIA_MOCK_MODE;
  return runWithMode(loadMock, loadOpenAI, mode, input, ctx);
}

// ------------------------------------------------------------------------
// o que faz este arquivo
// - centraliza a lógica de seleção de implementação (mock|openai|auto)
// - normaliza a exportação para { run }

// Exemplo de uso (no índice do agente):
//
// import { runWithMode } from "../_shared/loadAgentModule.js";
// export async function run(input, ctx) {
//   const { result/*, source, fallback*/ } = await runWithMode(
//     () => import("./impl_mock.js"),
//     () => import("./impl_openai.js"),
//     ctx?.mode,
//     input,
//     ctx
//   );
//   return result;
// }
// ------------------------------------------------------------------------
