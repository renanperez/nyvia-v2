export async function run(input) {
  // Mock básico: retorna algo exemplo
  return {
    metrics: {
      clicks: 123,
      impressions: 456,
      conversions: 7,
    },
    debug: "Mock performance data",
  };
}

// Este mock é usado para simular o comportamento do agente de performance dashboard
// durante o desenvolvimento ou testes, sem depender de uma implementação real.
// O mock retorna dados de performance fictícios, como cliques, impressões e conversões
// para simular a resposta esperada do agente real.
// O objetivo é permitir que os desenvolvedores testem a integração com o agente
// de performance dashboard sem precisar de uma implementação completa ou conexão com serviços externos.
// O mock pode ser substituído por uma implementação real quando necessário,
// permitindo uma transição suave entre desenvolvimento e produção.
