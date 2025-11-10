// src/tests/testadCopyAgent.js

import { run } from "../ai-agents/adCopyAgent/index.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" }); // Garante que as variáveis de ambiente do arquivo .env.local sejam carregadas

// console.log('[DEBUG] OPENAI_API_KEY:', process.env.OPENAI_API_KEY);  // Verifica se a chave da API está definida corretamente
const raw = process.env.OPENAI_API_KEY || "";
const masked = raw ? `sk-…${raw.slice(-4)}` : "(ausente)";
console.log("[DEBUG] OPENAI_API_KEY:", masked);

const input = {
  briefing: "Lançamento de um novo energético com ingredientes naturais",
  persona: "Jovens adultos que praticam esportes e vida ativa",
  objetivo: "Criar uma descrição de anúncio persuasiva para Facebook Ads",
};

async function testarAdCopyAgent() {
  try {
    console.log("[NYVIA][TESTE] Executando adCopyAgent...");
    const resultado = await run(input);
    console.log("[NYVIA][RESULTADO]", JSON.stringify(resultado, null, 2));
  } catch (error) {
    console.error("[NYVIA][ERRO]", error.message);
  }
}

testarAdCopyAgent();
// Este script é um teste simples para o agente de cópia de anúncios
// Ele importa a função run do agente de cópia de anúncios e executa com um conjunto de dados
// O resultado é impresso no console para verificação
// Certifique-se de que o ambiente está configurado corretamente para executar este teste
// O resultado deve conter a descrição do anúncio gerada pelo agente com base nos dados fornecidos
// Se estiver usando mocks, verifique se o mock está configurado corretamente para retornar dados simulados
// Caso contrário, o agente deve chamar a API da OpenAI para gerar a descrição do anúncio
// Este teste é útil para validar se o agente de cópia de anúncios está funcionando corretamente
// e se está retornando resultados esperados com base nos dados de entrada fornecidos.
