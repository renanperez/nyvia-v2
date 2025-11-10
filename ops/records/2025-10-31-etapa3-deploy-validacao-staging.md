# HANDOFF — Etapa 3 (Deploy manual + validação de logs em STAGING)
📅 Data: 2025-10-31
👤 Responsável: Renan Perez
🌐 Ambiente: STAGING

## 🎯 Objetivo
Disparar deploy manual no Railway a partir da branch `staging` (commit 818b1c3) e realizar sanity checks de saúde e logs.

## ✅ Estado Atual
- [ ] Deploy manual iniciado via **Deploy Now** (source: `staging`)
- [ ] Domínio público gerado
- [ ] `GET /api/healthz` => 200 OK
- [ ] `GET /api/logs?limit=1` => 200 + JSON (envelope)

## 🔧 Próximos Passos
1) Railway → Service `nyvia` → **Deployments** → **Deploy Now**
2) Gerar domínio público: Settings → Networking → Generate Domain
3) Sanity HTTP:
   - `GET /api/healthz` (200)
   - `GET /api/logs?limit=1` (200 + JSON)
4) (Opcional) Filtros rápidos:
   - `GET /api/logs?limit=5&level=error`
   - `GET /api/logs?limit=5&since=2024-01-01T00:00:00Z`

## 🧩 Evidências
- Deployments: status **Succeeded**
- Logs do app: “Ready on port …”
- Capturas das respostas HTTP (healthz / logs)
- Links para PR/commit quando aplicável

## 🗂️ Referências
- Política: **Staging-first**, sem auto-deploy
- Endpoints: `/api/healthz`, `/api/logs`
- Scripts auxiliares (PowerShell/CLI) quando aplicável
