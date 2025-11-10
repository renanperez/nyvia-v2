
# 🪣 HANDOFF — Núcleo Operacional e DevOps da Plataforma Nyvia

## 1. Objetivo

Estabelecer um modelo estável e auditável de operação técnica, observabilidade e manutenção contínua da plataforma Nyvia (SaaS), garantindo:

* Rastreabilidade entre código, deploy e telemetria.
* Ciclo claro entre automação (CI/CD) e intervenção técnica (staging).
* Governança e perenidade da infraestrutura (sem resets destrutivos).

---

## 2. Estado Atual (03/11/2025)

* **Branch ativa:** `staging`.

* **Comandos locais padrão:**

  * `npm ci`
  * `npm run build`
  * `npm run start`

* **Projeto Railway (staging):** `nyvia-staging`

  * Serviço principal: `mindful-commitment`
  * Source repo: `renanperez/nyvia`
  * Branch: `staging`
  * Node: `20.19.5`
  * Build command: `npm run build`
  * Start command: `npm run start`
  * Restart policy: `on failure`
  * Status: deploy ativo (card verde “Active”).

* **Variáveis principais (staging / Railway):**

  * `APP_ENV=staging`
  * `NODE_ENV=production`
  * `MONGODB_URI=mongodb+srv://…clusterstaging…/?retryWrites=true&w=majority&appName=clusterStaging`
  * `NYVIA_DB_NAME=nyvia_staging`
  * `MONGODB_DB=nyvia_staging`
  * `NYVIA_MOCK_MODE=mock`

* **Arquivos de ambiente na raiz:**

  * `.env.local.off` → antigo `.env.local` (localhost:27017) **desativado**.
  * `.env.local.backup` → histórico (não usado).
  * `.env.staging` → deve espelhar o mesmo `MONGODB_URI` do Railway.
  * `.env.production` → reservado para futuro PROD.

> Observação de UI Railway: é necessário clicar **no centro do card** do serviço `mindful-commitment` para abrir painel com Build Logs / Deploy Logs / Settings.

---

## 3. Arquitetura Operacional — 3 Camadas

| Camada                                   | Finalidade                                     | Ferramentas                                   |
| :--------------------------------------- | :--------------------------------------------- | :-------------------------------------------- |
| **Código e Controle (CI/CD)**            | Versionamento, histórico, build e testes       | Git, GitHub, GitHub Actions                   |
| **Execução e Ambientes (Infra)**         | Deploy e execução de builds (staging/produção) | Railway (staging-first)                       |
| **Dados e Observabilidade (Telemetria)** | Registro de `logs`, `runs`, `requests`         | MongoDB Atlas (`nyvia_staging`, `nyvia_prod`) |

---

## 4. Pipeline Canônico

### 4.1. Desenvolvimento Local

Fluxo: editar código → commit → push para `origin/staging`.
Testes e (no futuro) lint rodando via GitHub Actions (CI leve).

Comandos básicos:

```bash
git add .
git commit -m "feat: descrição clara da mudança"
git push origin staging
```

Para rodar local na mesma lógica do Railway:

```bash
npm ci
npm run build
npm run start
```

---

### 4.2. Staging — Ambiente Técnico / Laboratório

* **Branch:** `staging`
* **Serviço Railway:** `mindful-commitment` (projeto `nyvia-staging`)
* **Build/Start:**

  ```bash
  npm run build
  npm run start
  ```
* **Logs:**

  * Railway (runtime, erros de execução)
  * MongoDB Atlas (`nyvia_staging` → coleções de `runs`, `logs`, `requests`)

**Uso principal do staging:**

* Validar correções e upgrades antes de produção.
* Testar novas integrações (agentes, APIs, etc.).
* Monitorar erros de agentes e fluxo da aplicação via telemetria.
* Observar estrutura e volume de `logs` e `runs`.

---

### 4.3. Produção — Ambiente Cliente (planejado)

* **Branch:** `main`
* **Deploy:** automático via GitHub Actions + Railway (serviço PROD separado).
* **Banco:** `nyvia_prod` em MongoDB Atlas, com envs espelhadas.

Pipeline previsto:

1. Merge de PR de `staging` → `main`.
2. Workflow de CI/CD executa `npm ci` + `npm run build` + testes.
3. Deploy em PROD (Railway) com comando `npm run start` / `next start -p $PORT` (conforme configuração).
4. Telemetria de produção gravada em `nyvia_prod` (coleções equivalentes às de `nyvia_staging`).

---

## 5. Telemetria e Observabilidade

| Fonte                            | O que registra                                  | Onde consultar                      | Finalidade                      |
| :------------------------------- | :---------------------------------------------- | :---------------------------------- | :------------------------------ |
| **GitHub Actions**               | Build, lint, testes (quando configurado)        | GitHub (aba Actions)                | Saúde do código / pipeline      |
| **Railway Logs**                 | Execução runtime, crashes, erros de app         | Dashboard Railway                   | Saúde operacional do serviço    |
| **MongoDB Atlas**                | `runs`, `logs`, `requests`                      | Compass / consultas / APIs internas | Telemetria de uso da plataforma |
| **Scripts PowerShell (ops/bin)** | Checks de `/healthz`, inspeção de `runs`/`logs` | Terminal (PowerShell)               | Diagnóstico rápido e repetível  |

---

## 6. Fallbacks e Manutenção

### 6.1. Rollback de versão

```bash
git revert <commit_id>
git push origin staging
```

O Railway (staging) fará novo deploy com base no estado atual da branch `staging` após o revert.

---

### 6.2. Debug de Staging

* **Railway:**

  * Abrir serviço `mindful-commitment`
  * Acessar **View Logs** para ver erros de runtime.

* **MongoDB Atlas (Compass):**

  * Conectar no `nyvia_staging`.
  * Filtrar coleções `logs` / `runs` por `traceId`, `step`, `createdAt` etc.

* **Scripts (a planejar/implementar em `ops/bin`):**

  * `test-health.ps1` → checagem de `/api/healthz`.
  * `get-latest-runs.ps1` → inspeção rápida de `runs` recentes.

---

### 6.3. Upgrade de funcionalidade

1. Desenvolver e validar funcionalidade em `staging` (local + Railway).
2. Confirmar `/api/healthz` ok e telemetria consistente em `nyvia_staging`.
3. Abrir PR de `staging` → `main`.
4. Após CI verde, fazer merge.
5. Deploy em PROD e monitorar telemetria antes/depois.

---

## 7. Governança Técnica

* **Branch técnica principal:** `staging` (laboratório e integração).
* **Branch de produção:** `main`.
* **Deploy:** manual/assistido em staging; automatizado em PROD (planejado).
* **Banco de dados:**

  * `nyvia_staging` para staging.
  * `nyvia_prod` para produção (planejado).
* **Retenção de logs:**

  * Política alvo: TTL ~90 dias para coleções de observabilidade (a definir/implementar).
  * Possível export periódico para arquivamento frio, se necessário.

---

## 8. Critérios de Sucesso Operacional

* ✅ Staging builda e roda sem erro no Railway (`mindful-commitment`).
* ✅ `/api/healthz` em staging responde `200` com `{"ok":true,"db":"up","appEnv":"staging"}`.
* ✅ Telemetria (`runs` / `logs`) é persistida corretamente no MongoDB Atlas (`nyvia_staging`).
* ✅ Workflow de CI (ex.: `.github/workflows/nyvia-tests.yml`) executa sem erro em `staging` e `main`.
* ✅ Fluxo `staging → main → PROD` é claro, documentado e testável.

---

## 9. Arquivos Recomendados para Versionamento

| Arquivo / Diretório                                    | Função                                                                 |
| :----------------------------------------------------- | :--------------------------------------------------------------------- |
| `ops/records/2025-11-03-nyvia-pipeline-operacional.md` | Documento-mãe deste handoff operacional.                               |
| `.github/workflows/nyvia-tests.yml`                    | CI leve (build, testes, validações) para `staging` e `main`.           |
| `ops/bin/test-health.ps1`                              | Script de checagem para `/api/healthz` (staging e, no futuro, prod).   |
| `ops/bin/get-latest-runs.ps1`                          | Script de inspeção rápida de `runs` recentes no MongoDB.               |
| `src/server/observability/`                            | Código da camada de observabilidade e telemetria (quando consolidada). |

---

## 10. Controle de Usuários — MongoDB Atlas (staging)

Ambiente: `nyvia_staging` (MongoDB Atlas).

| Usuário             | Papel MongoDB             | Função no pipeline                                             | Observações                                                                                                       |
| :------------------ | :------------------------ | :------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| `nyvia_app_stg`     | `readWrite@nyvia_staging` | Usuário técnico da aplicação (app / Railway / `.env.staging`). | Responsável por gravação de `runs` e `logs`.                                                                      |
| `nyvia_compass_stg` | `readWrite@nyvia_staging` | Usuário de acesso manual via Compass.                          | Mantido como `readWrite` por enquanto. Recomenda-se reduzir para `read` quando houver outras pessoas lendo dados. |

**Diretrizes:**

* Cada usuário deve ser usado apenas para sua finalidade (app vs análise).
* URIs com credenciais **não devem ser commitadas** no repositório.
* Em PROD, seguir padrão equivalente:

  * `nyvia_app_prod` → `readWrite@nyvia_prod`
  * `nyvia_compass_prod` → `read@nyvia_prod`

---

## 11. Visão Macro (Mermaid)

```mermaid
graph LR
A[Local Dev] -->|Commit & Push| B[GitHub - staging]
B -->|Deploy manual/assistido| C[Railway - Staging (mindful-commitment)]
C -->|Telemetry| D[MongoDB Atlas - nyvia_staging]
B -->|PR Merge| E[GitHub - main]
E -->|Deploy PROD (planejado)| F[Railway - Production]
F -->|Telemetry| G[MongoDB Atlas - nyvia_prod]
```

---

**Última atualização:** 2025-11-03
**Responsável:** Renan Perez – Coordenação Técnica Nyvia

---


