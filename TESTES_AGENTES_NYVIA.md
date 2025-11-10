# 🧪 Registro de Testes — Agentes Nyvia

Este documento serve para registrar os resultados dos testes manuais de cada agente Nyvia, em modo **mock** e **openai**.

## 📌 Instruções rápidas
1. **Abrir os arquivos `.http`** correspondentes a cada agente (localizados em `tests/` ou na raiz do projeto).
2. Executar os requests com o **Thunder Client** ou **REST Client** no VS Code.
3. Preencher a tabela abaixo com:
   - **Status HTTP** (ex.: `200 OK`, `500 Error`, etc.)
   - **Tempo de Resposta** (ex.: `320 ms`)
   - **Observações** (ex.: "resposta correta", "erro de chave", "timeout", etc.)
4. Validar que **todos os modos mock** funcionam antes de testar os modos **openai**.
5. Quando todos os testes estiverem **200 OK** → realizar o **commit** dessa etapa de padronização no Git.

---

## 📋 Tabela de Resultados

| Agente                     | Endpoint API                        | Modo Testado | Status HTTP | Tempo Resposta | Observações |
|----------------------------|--------------------------------------|--------------|-------------|----------------|-------------|
| **Keyword Agent**          | `/api/keywords`                      | mock         |   200       |   1.75 s       |             |
|                            | `/api/keywords`                      | openai       |     200     |      1.85 s    |             |
| **Ad Copy Agent**          | `/api/ad-copy`                       | mock         |    200      |    58 ms       |             |
|                            | `/api/ad-copy`                       | openai       |     200 ok  |    60 ms       |             |
| **Performance Dashboard**  | `/api/performance-dashboard`         | mock         |     400     |     181 ms     | "error": "Dados incompletos"         |
|                            | `/api/performance-dashboard`         | openai       |      400    |       58 ms    | "error": "Dados incompletos"       |
| **Coordinator Agent**      | `/api/campaign-orchestrator`         | mock         |    500      |      1.41 s    |             |
|                            | `/api/campaign-orchestrator`         | openai       |     500     |        67 ms   |             |
---

## 📂 Histórico de Testes

> Registre abaixo cada rodada de testes finalizada, para manter histórico no projeto.

- **Data:**  
  **Responsável:**  
  **Resumo:**  

---
