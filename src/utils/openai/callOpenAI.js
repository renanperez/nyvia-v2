/**
 * 🔧 Função central de chamada à OpenAI para todos os agentes do projeto.
 * Usa fetch() nativo (compatível com Next.js), e retorna JSON ou texto puro (.raw)
 */
export async function callOpenAI({
  prompt,
  model = "gpt-4",
  temperature = 0.7,
  max_tokens = 1000,
}) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, //  Define sua API key via .env.local
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        //  Envia o corpo da requisição
        model,
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente especializado em marketing persuasivo.",
          },
          { role: "user", content: prompt },
        ],
        temperature,
        max_tokens,
      }),
    });

    if (!response.ok) {
      // Verifica se a resposta foi bem-sucedida
      const errorData = await response.json();
      throw new Error(errorData.error.message || "Erro ao chamar OpenAI");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // ✅ Parse seguro: remove fences ```json/``` e faz fallback em texto
    const cleaned = String(content || "").replace(/```json|```/g, "").trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      // compatível com quem lê .raw ou .text
      return { raw: cleaned, text: cleaned };
    }

  } catch (error) {
    //  Captura erros de rede ou de API
    console.error("[callOpenAI ERROR]", error);
    return { error: error.message || "Erro desconhecido ao chamar OpenAI" };
  }
}
// // Exemplo de uso:
// callOpenAI({
//   prompt: 'Qual é a capital da França?',
//   model: 'gpt-4',
//   temperature: 0.7,
//   max_tokens: 1000,
// });
// // Retorna: { raw: 'A capital da França é Paris.' }
// // Ou se a resposta for JSON: { "answer": "Paris" }
// // Se ocorrer um erro, retorna: { error: 'Mensagem de erro' }
// // Se a resposta não for JSON válido, retorna: { raw: 'Resposta em texto puro' }
