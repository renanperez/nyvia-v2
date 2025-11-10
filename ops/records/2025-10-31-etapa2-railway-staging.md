# HANDOFF — Etapa 2 (Infraestrutura Railway – STAGING)
📅 Data: 2025-10-31
👤 Responsável: Renan Perez
🌐 Ambiente: STAGING

## 🎯 Objetivo
Provisionar o ambiente nyvia-staging no Railway, isolado de produção e com deploy **manual** (sem automação).

## ✅ Estado Atual
- [x] Projeto Railway criado (nyvia-staging)
- [x] Environment staging ativo
- [x] Service `nyvia` conectado ao repo `renanperez/nyvia` (branch `staging`)
- [x] Auto Deploy / Build on Push / PR Deploys / Wait for CI: **OFF**
- [x] Builder: Railpack (Default) / Metal Build: OFF
- [x] Variáveis de ambiente configuradas (.env.staging)
- [x] Build: `npm ci && npm run build`
- [x] Start: `npm run start`
- [x] NODE_ENV = production **(padrão do Railway)**

## 🔧 Próximos Passos
1) Railway → Service `nyvia` → **Deployments** → **Deploy Now** (Source: `staging`)
2) Após sucesso, **Settings → Networking → Generate Domain**
3) Validar:
   - `GET /api/healthz` => **200 OK**
   - `GET /api/logs?limit=1` => **200** com JSON (envelope `count`, `items`, `nextCursor`)

## 🧩 Evidências
- Prints: Settings/Variables, Deployments (Succeeded), Logs (“Ready on port …”)
- Respostas HTTP dos endpoints (200)
- Commits/PRs relacionados

## 🗂️ Referências
- Branch alvo: `staging`
- Política atual: **Staging-first**, sem auto-deploy
- Vars (staging): `APP_ENV=staging`, `NYVIA_MOCK_MODE=mock`, `MONGODB_URI`, `NYVIA_DB_NAME=nyvia_staging`, `MONGODB_DB=nyvia_staging`, `NEXT_TELEMETRY_DISABLED=1`
- Produção (futuro): `APP_ENV=production`, `NYVIA_MOCK_MODE=openai`, `OPENAI_API_KEY=<real>`, `MONGODB_URI`/DB de produção
