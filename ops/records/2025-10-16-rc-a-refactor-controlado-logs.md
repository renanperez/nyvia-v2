# HANDOFF — RC-a (Refactor Controlado) de Logs
📅 Data: 2025-10-16
👤 Responsável: Renan Perez
🌐 Ambiente: STAGING

## 🎯 Objetivo
Separar signals vs content, governança no saveRun e sanitize sem vazar briefing/persona/conteúdo bruto.

## ✅ Estado Atual
- [ ] summarizeRequest não vaza texto
- [ ] saveRun com governança
- [ ] signals: { hasBriefing, keywordsCount, personaKind, inputSizeBytes }

## 🔧 Próximos Passos
1) Implementar em feature branch (staging-first)
2) Testar em STAGING
3) PR sem quebrar contratos

## 🧩 Evidências
- Checklist/DoD
- Diffs planejados

## 🗂️ Referências
- Regras de logs/sinais
- Coleções: runs, logs
