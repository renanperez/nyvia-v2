# HANDOFF — Observabilidade de Logs (Produção – contrato /api/logs)
📅 Data: 2025-10-17
👤 Responsável: Renan Perez
🌐 Ambiente: STAGING

## 🎯 Objetivo
Definir contrato canônico de /api/logs (envelope count/items/nextCursor) e parâmetros de filtro (traceId, requestId, step, level, since/until, limit, cursor).

## ✅ Estado Atual
- [x] Envelope padronizado
- [x] Parâmetros sugeridos
- [x] Paginação forward-only

## 🔧 Próximos Passos
1) Garantir compatibilidade do endpoint em STAGING
2) Preparar scripts PowerShell/CLI

## 🧩 Evidências
- Trecho de handoff com contrato e filtros

## 🗂️ Referências
- Endpoint: /api/logs
- Padrões: count, items[], nextCursor
