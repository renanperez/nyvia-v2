// src/tests/testCoordinatorAgent.js

import { runCampaignFlow } from "../ai-agents/coordinatorAgent.js";
import dotenv from "dotenv";
dotenv.config();

const input = {
  briefing: "Divulgar aplicativo de saúde preventiva",
  persona: "Adultos entre 30 e 50 anos preocupados com bem-estar",
  objetivo: "Gerar leads qualificados para o app",
  plataforma: "Meta Ads",
  orcamento_diario: 100,
};

async function testarFluxoCompleto() {
  console.log("🚀 Iniciando teste do fluxo Swarm com 3 agentes...");
  try {
    const resultado = await runCampaignFlow(input);

    console.log(
      "\n✅ Resultado do Fluxo:\n",
      JSON.stringify(resultado, null, 2),
    );
  } catch (error) {
    console.error("❌ Erro no teste do fluxo:", error.message);
  }
}

testarFluxoCompleto();
// Este script testa o fluxo completo de geração de campanha usando o agente coordenador
// Ele importa a função runCampaignFlow do agente coordenador e executa com um conjunto de dados
// O resultado é impresso no console para verificação
// Certifique-se de que o ambiente está configurado corretamente para executar este teste
// O resultado deve conter as palavras-chave, cópia do anúncio, campanha e dashboard de performance
// Se estiver usando mocks, verifique se o mock está configurado corretamente para retornar dados simul
// Caso contrário, o agente deve chamar as APIs correspondentes para gerar os dados
// Este teste é útil para validar se o fluxo de campanha está funcionando corretamente
