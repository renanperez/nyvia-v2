# 🧠 Nyvia AI Agentic System

Nyvia is an evolving AI SaaS platform structured as a **modular, goal-oriented agentic system**. It leverages AI agents to automate complex marketing tasks such as keyword generation, ad copy creation, and performance reporting — with minimal human intervention.

---

## 📍 Project Status

| Component               | Status         | Notes                                     |
| ----------------------- | -------------- | ----------------------------------------- |
| Keyword Agent           | ✅ Done        | Generates relevant keywords for campaigns |
| Ad Copy Agent           | ✅ Done        | Creates ad content based on keywords      |
| Dashboard Agent         | ✅ Done        | Analyzes and returns campaign insights    |
| Coordinator Agent       | ✅ In Progress | Orchestrates multi-agent flows            |
| API Integration         | ✅ Live        | `/api/campaign-orchestrator`              |
| MCP Protocol Foundation | 🧭 Planned     | Future control layer (MCP-compatible)     |

---

## 🧱 Architecture Overview

### 1. Modular Agent Design

Each AI agent is implemented as a standalone module under `src/ai-agents/`. Current agents include:

- `keywordAgent.js` — Generates keyword lists based on product and audience.
- `adCopyAgent.js` — Produces ad copy variations for different platforms.
- `performanceDashboardAgent.js` — Extracts and reports key marketing metrics.

All agents expose a standard interface:

```js
export async function run(input) => output
```

---

### 2. Coordinator Agent (Level 4 Orchestration)

Located at:

```
src/ai-agents/coordinatorAgent.js
```

This agent:

- Accepts high-level campaign inputs
- Delegates work to the individual agents
- Collects and returns structured results
- Logs each step internally (future external observability planned)

---

### 3. Agentic System Behavior

Nyvia demonstrates **agentic AI principles**:

- 🔁 Agents collaborate to fulfill end-to-end campaign tasks
- 🧠 Coordinator defines the task flow (Goal → Plan → Act)
- ⚙️ System is modular, scalable, and ready for orchestration layer upgrade

---

## 🔭 Vision Ahead

Nyvia is on a straight path toward a fully **MCP-compatible** system architecture. The future design includes:

- ✅ Formal routing via MCP Client/Server agents
- 📚 Central policy + tool registry
- 🧠 Long-term memory store for agent recall
- 🔒 Permission control + usage logs

---

## 📁 Directory Structure (Relevant Parts)

```
src/
├── ai-agents/
│   ├── keywordAgent.js
│   ├── adCopyAgent.js
│   ├── performanceDashboardAgent.js
│   └── coordinatorAgent.js
├── app/api/
│   └── campaign-orchestrator/route.js
├── utils/openai/
│   └── callOpenAI.js
```

---

## 🤝 Contributing / Notes

This is a living README. As new agents or protocols are added, this document should be updated to reflect changes in architecture, API contracts, and system goals.

# Ignore old or backup markdown files

📌 Copy `.env.local.example` to `.env.local` and fill in your keys to run locally.
