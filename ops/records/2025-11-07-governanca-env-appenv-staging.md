# Governança de ambiente — APP_ENV centralizado (STAGING)

- Data: 2025-11-07
- Ambiente: STAGING (Railway)
- Responsável: Renan + GPT

## O que foi implementado

1. Ajuste em `src/config/env.js`:
   - `APP_ENV` agora vem de `process.env.APP_ENV`, com fallback `"staging"`.
   - `NODE_ENV` vem de `process.env.NODE_ENV`, com fallback `"production"`.
   - `NYVIA_MOCK_MODE` e `NYVIA_MOCK_MODE_RAW` definidos a partir de `APP_ENV` + `NYVIA_MOCK_MODE` + `OPENAI_API_KEY`.
   - `NYVIA_API_BASE` definido conforme `APP_ENV` (production / staging / local).

2. Refatoração global:
   - Removidas referências diretas a `process.env.APP_ENV`, `process.env.NODE_ENV` e `process.env.NYVIA_MOCK_MODE` fora de `env.js`.
   - Demais módulos passam a importar:
     - `APP_ENV`, `NODE_ENV`, `NYVIA_MOCK_MODE` a partir de `src/config/env.js`.

## Evidência em STAGING

Chamada:

```powershell
iwr "https://nyvia-staging-staging.up.railway.app/api/healthz" | Select-Object -ExpandProperty Content

RESPOSTA: 

{"ok":true,"db":"up","appEnv":"staging","nodeEnv":"production"}
