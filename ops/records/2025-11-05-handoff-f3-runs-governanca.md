# 🧾 Handoff — Fase 3: Ciclo “runs + governança (appEnv)”

**Data:** 05/11/2025  
**Ambiente:** Railway → Projeto `nyvia-staging` → Serviço `nyvia-staging`  
**Cluster MongoDB:** `clusterStaging` (Atlas)  
**Database:** `nyvia_staging`  
**Coleções:** `logs`, `runs`

---

## 1️⃣ Contexto e Escopo do Ciclo

**Objetivo original:**  
Garantir que o ambiente STAGING (`nyvia-staging` no Railway) reflita corretamente o valor lógico `appEnv:"staging"` em todos os níveis de telemetria — health check, logs e runs — utilizando a governança existente no arquivo `src/config/env.js`.

**Escopo técnico:**
- `/api/healthz` — exibir `appEnv` e `nodeEnv` corretos.
- `logs` — registrar `appEnv` conforme ambiente lógico, não técnico.
- `runs` — refletir o mesmo `appEnv` dos logs, para coerência e rastreabilidade.
- Manter coerência com o módulo `src/config/env.js`.

---

## 2️⃣ Estado confirmado antes do ciclo

| Item | Status | Evidência / Observação |
|------|---------|------------------------|
| `/api/healthz` | ✅ Funcional | `{"ok":true,"db":"up","appEnv":"production","nodeEnv":"production"}` |
| Banco de dados (`nyvia_staging`) | ✅ Conectado | Atlas confirmando `db:"up"` |
| `logs` | ✅ Gravando | `traceId` consistente, `step` e `level` corretos, `appEnv:"production"` |
| `runs` | ✅ Gravando | 45 documentos; execuções recentes em 29/10 e 05/11, `mockMode:"mock"`, `appEnv:"production"` |
| `src/config/env.js` | ✅ Existente | Governança correta de `NODE_ENV`, `APP_ENV`, e `NYVIA_MOCK_MODE` |
| Governança de `APP_ENV` | ⚙️ Pendente | Valor `"production"` refletido por padrão do Railway |

---

## 3️⃣ Diagnóstico técnico consolidado

### 🔸 O que está funcionando
- O pipeline completo (`healthz`, `logs`, `runs`) está operacional e conectado ao Atlas.
- As coleções recebem dados consistentes e em conformidade com o schema da Fase 3.
- O módulo `src/config/env.js` já possui toda a lógica necessária para governança.

### 🔸 O que não foi implementado
- O valor `"appEnv":"staging"` **ainda não é refletido** porque:
  - o código em `/api/healthz`, `logsRepository` e `runsRepository` **não consome o APP_ENV do módulo `env.js`**;
  - esses pontos usam `NODE_ENV` ou valor fixo `"production"`, o que força o comportamento padrão do Railway.

### 🔸 Justificativa
O ciclo foi dedicado à análise e mapeamento dos pontos de dependência do `appEnv`, sem implementação direta, para evitar risco de duplicar lógica de configuração.  
O aprendizado principal foi identificar **onde e como o código define o ambiente lógico**, garantindo que futuras alterações sejam seguras e centralizadas.

---

## 4️⃣ Arquivo base de governança de ambiente

Arquivo confirmado e **válido**:  
`src/config/env.js`

```js
const NODE_ENV = NODE_ENV || "development";
const APP_ENV =
  APP_ENV ||
  (NODE_ENV === "development" ? "development" : "production");

const NYVIA_MOCK_MODE_RAW = (
  NYVIA_MOCK_MODE || (APP_ENV === "development" ? "mock" : "openai")
).toLowerCase();

function decideMockMode() {
  let mode = NYVIA_MOCK_MODE_RAW;
  if (mode === "auto") {
    mode = process.env.OPENAI_API_KEY ? "openai" : "mock";
  }
  if (mode === "openai" && !process.env.OPENAI_API_KEY) {
    console.warn(
      "[nyvia][env] OPENAI_API_KEY ausente; fallback automático para mock.",
    );
    mode = "mock";
  }
  return mode;
}

const NYVIA_MOCK_MODE = decideMockMode();

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
