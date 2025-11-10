// src/ai-agents/keywordAgent/impl_mock.js

export async function run(input) {
  // Função mock para simular a geração de palavras-chave
  const { briefing, persona, objetivo } = input; // Extrai os dados do input recebido

  return {
    // Retorna um objeto simulando a resposta do agente de palavras-chave
    // Aqui você pode simular a lógica de geração de palavras-chave
    // ou simplesmente retornar um conjunto fixo de palavras-chave para testes
    keywords: [
      "palavra-chave simulada 1",
      "palavra-chave simulada 2",
      "palavra-chave simulada 3",
    ],
    origem: "mock",
    info: `Mock para: ${briefing} | ${persona} | ${objetivo}`,
  };
}
