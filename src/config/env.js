// src/config/env.js

// Ambiente técnico do Node (informativo, logs/healthz).
// No Railway, normalmente vem como "production".
const NODE_ENV = process.env.NODE_ENV || "production";

// Ambiente lógico da aplicação.
// Se APP_ENV vier de fora (.env.local, .env.staging, Railway etc.), ele é usado.
// Se NÃO vier, assumimos "staging" como padrão (fase atual do projeto).
const APP_ENV = process.env.APP_ENV || "staging";

// Valor bruto do modo mock (pode ser 'mock', 'openai' ou 'auto').
const NYVIA_MOCK_MODE_RAW = (
  process.env.NYVIA_MOCK_MODE ||
  (APP_ENV === "development" ? "mock" : "openai")
).toLowerCase();

function decideMockMode() {
  // resolve para 'mock' ou 'openai' (não retorna 'auto')
  let mode = NYVIA_MOCK_MODE_RAW;

  if (mode === "auto") {
    mode = process.env.OPENAI_API_KEY ? "openai" : "mock";
  }

  if (mode === "openai" && !process.env.OPENAI_API_KEY) {
    console.warn(
      "[nyvia][env] OPENAI_API_KEY ausente; fallback automático para mock."
    );
    mode = "mock";
  }

  return mode;
}

const NYVIA_MOCK_MODE = decideMockMode();

// Base de API usada pelos agentes / frontend para falar com a Nyvia.
const NYVIA_API_BASE =
  process.env.NYVIA_API_BASE ||
  (APP_ENV === "production"
    ? "https://api.seu-dominio.com"
    : APP_ENV === "staging"
    ? "https://staging.seu-dominio.com/api"
    : "http://localhost:3000/api");

export {
  NODE_ENV,
  APP_ENV,
  NYVIA_MOCK_MODE,
  NYVIA_MOCK_MODE_RAW,
  NYVIA_API_BASE,
};
