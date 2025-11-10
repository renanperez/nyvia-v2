# Handoff — Organograma DevOps Nyvia
**Data:** 2025-11-06  
**Ambiente:** STAGING  
**Responsável:** Renan Perez  
**Arquivo:** ops/records/2025-11-06-handoff-organograma-devops-nyvia.md

---

## 🎯 Objetivo
Consolidar a visão funcional do ciclo DevOps da Nyvia, com separação clara entre:
- Controle proprietário (núcleo lógico e governança)
- Automação gradual (evolução previsível)
- Serviços delegados (infra gerenciada)

Este registro formaliza a estrutura atual, o fluxo hierárquico e as funções de cada componente.

---

## 🔍 Estado Atual

- **Controle proprietário**: implementado parcialmente (governança, observabilidade e registros operacionais ativos).  
- **Automação gradual**: scripts PowerShell e sanity checks funcionais; CI/CD e alertas previstos.  
- **Serviços delegados**: Railway e MongoDB Atlas configurados e operando; logs externos ativos.  

Próximo passo: evoluir automação gradual, mantendo controle de governança centralizado no código (env.js, logsRepository, runsRepository).

---

## 🧭 Organograma Funcional

### 1️⃣ Controle Proprietário
- **GOV** — Governança de ambiente (APP_ENV, NODE_ENV, env.js)
- **OPS** — Rotinas e sanity checks (PowerShell, Handoffs)
- **OBS** — Observabilidade (logs, runs, signals)
- **DOMAIN** — Núcleo lógico de negócio (agentes, orquestração)
- **DOC** — Documentação e registros (`ops/records`, inventários)

### 2️⃣ Automação Gradual
- **PIPELINE** — Integração contínua (GitHub Actions)
- **CLI** — Interface interna para comandos (`nyvia check`, `nyvia logs`)
- **ALERTS** — Dashboards e alertas baseados em logs/runs

### 3️⃣ Serviços Delegados
- **Railway (PaaS)** — Runtime, build, SSL e deploy
- **MongoDB Atlas** — Banco gerenciado (logs, runs)
- **DNS / SMTP** — Domínios e comunicação
- **Logs de vendors** — Observabilidade básica (Railway / Atlas)

---

## 🔄 Fluxo Hierárquico Simplificado


Automação Gradual
↓
Controle Proprietário
↓
Serviços Delegados

