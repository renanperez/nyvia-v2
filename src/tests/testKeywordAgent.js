// src/test/testKeywordAgent.js

import { run } from "../ai-agents/keywordAgent.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" }); // Garante que as variáveis de ambiente do arquivo .env.local sejam carregadas

const input = {
  briefing: "Campanha de lançamento de suplemento natural",
  persona: "Homens entre 30 e 45 anos que praticam esportes",
  objetivo: "Gerar tráfego qualificado para o site",
};

async function testarKeywordAgent() {
  try {
    console.log("[NYVIA][TESTE] Iniciando execução do keywordAgent...");
    const resultado = await run(input);
    console.log("[NYVIA][RESULTADO]", JSON.stringify(resultado, null, 2));
  } catch (error) {
    console.error("[NYVIA][ERRO]", error.message);
  }
}

testarKeywordAgent();

// Este script é um teste simples para o agente de palavras-chave
// Ele importa a função run do agente de palavras-chave e executa com um conjunto de dados
// Este script testa o agente de palavras-chave com um briefing, persona e objetivo específicos
// O resultado é impresso no console para verificação
// Certifique-se de que o ambiente está configurado corretamente para executar este teste
// O resultado deve conter uma lista de palavras-chave geradas pelo agente com base nos dados fornecidos
// Se estiver usando mocks, verifique se o mock está configurado corretamente para retornar dados simulados
// Caso contrário, o agente deve chamar a API da OpenAI para gerar as palavras-chave
