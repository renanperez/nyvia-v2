"use client";

import { useState } from "react";
import "@/styles/tailwind.css"; // importa estilos globais (Tailwind)

// Props do AgentForm:
// - agent: identificador (string) que aparece no botão e nos logs.
// - placeholder: texto guia dentro do input.
// - onSubmit: função async que faz a chamada (recebe input).
// - onSuccess: callback executado em caso de sucesso, recebe res.data.
// - onError: callback em caso de falha, recebe o erro.
// - resetOnSuccess: limpa o campo de input após sucesso.
export default function AgentForm({
  agent,
  placeholder,
  onSubmit,
  onSuccess,
  onError,
  resetOnSuccess = true,
}) {
  // 1️⃣ Estado do valor do input de texto  // — controla o valor do campo de entrada
  // — usado para capturar o que o usuário digita
  const [input, setInput] = useState("");

  // 2️⃣ Estado de loading para desabilitar botão e mostrar feedback  // spinner
  const [loading, setLoading] = useState(false);

  // 3️⃣ Estado de mensagem de erro local (input vazio ou falha de rede) // mensagem de validação
  const [error, setError] = useState("");

  // 4️⃣ Função disparada ao submeter o formulário  // — recebe o evento de submit
  // e executa a lógica de validação, chamada assíncrona e tratamento de erros
  const handle = async (e) => {
    e.preventDefault(); // evita reload da página
    setError(""); // limpa erro anterior

    // 4.1) Validação simples do input — não permite string vazia
    if (!input.trim()) {
      setError("Campo obrigatório.");
      return;
    }

    setLoading(true); // acende o spinner do botão

    try {
      // 4.2) Chama a função onSubmit recebida por props com o input do usuário
      // Ela deve ser uma função async que retorna uma resposta com res.data
      // Exemplo: onSubmit(input) pode ser uma chamada API como api.post('/endpoint', { data: input })
      const res = await onSubmit(input);

      // 4.3) Limpa o input em caso de sucesso (se desejar)
      resetOnSuccess && setInput("");

      // 4.4) Propaga dados para o callback de sucesso
      onSuccess?.(res.data);
    } catch (err) {
      // 4.5) Define mensagem local de erro e propaga para onError
      setError(err.message || "Erro inesperado.");
      onError?.(err);
    } finally {
      setLoading(false); // apaga o spinner
    }
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      {/* Campo de texto controlado */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="w-full border px-2 py-1"
      />
      {/* Mensagem de validação ou falha */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Botão de envio */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Processando…" : `Executar ${agent}`}
      </button>
    </form>
  );
}
