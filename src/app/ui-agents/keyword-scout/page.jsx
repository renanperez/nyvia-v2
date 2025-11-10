// src\app\agentes\keyword-scout\page.jsx
"use client";
// Importa os hooks do React
import { useState } from "react";
import api from "@/services/api";
import AgentForm from "@/components/AgentForm";
import "@/styles/tailwind.css";

export default function KeywordScoutPage() {
  //  Componente principal da página Keyword Scout, que gerencia o estado e a interação com o agente de palavras-chave
  const [keywords, setKeywords] = useState([]); // Estado para armazenar as palavras-chave geradas pelo agente
  const [leadError, setLeadError] = useState(""); // Estado para armazenar erros ao salvar o lead
  const [email, setEmail] = useState(""); // Estado para armazenar o e-mail do lead
  const [leadName, setLeadName] = useState(""); // Estado para armazenar o nome do lead
  const [loading, setLoading] = useState(false); // Estado para controlar o loading

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Keyword Scout</h1>

      {/* Campo de Nome (opcional) */}
      <div className="mb-4">
        <label htmlFor="lead-name" className="block mb-1">
          Nome (opcional)
        </label>
        <input
          id="lead-name"
          type="text"
          value={leadName}
          onChange={(e) => setLeadName(e.target.value)}
          className="w-full border px-2 py-1"
          placeholder="Seu nome ou empresa…"
        />
      </div>

      {/* Campo de E-mail */}
      {/* Campo de E-mail obrigatório para capturar o lead */}
      <div className="mb-4">
        <label htmlFor="lead-email" className="block mb-1">
          E-mail
        </label>
        <input
          id="lead-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-2 py-1"
          placeholder="seu@email.com"
        />
      </div>

      {/* Verifica se o e-mail foi preenchido antes de permitir o envio */}
      {/* Formulário com integração ao keywordAgent que permite ao usuário interagir com o agente de palavras-chave */}
      <AgentForm
        agent="keyword-scout"
        placeholder="Descreva seu nicho…"
        onSubmit={async (desc) => {
          setLoading(true); // começa loading global
          // 🧠 Envia para a nova rota que aciona o agente inteligente
          const res = await api.post("/api/keywords", {
            business: desc,
            audience: "Pequenos lojistas online",
            tone: "Informal e amigável",
          });

          // ✅ Atualiza o estado com as novas palavras-chave do agente
          setKeywords(res.data.keywords);

          // 💾 Tenta salvar o lead com o nome e email
          try {
            await api.post("/api/save-lead", {
              name: leadName,
              email,
              description: desc,
            });
          } catch {
            setLeadError("Falha ao salvar lead"); // Define erro se falhar ao salvar o lead
          } finally {
            setLoading(false); // termina loading global
          }

          return res; // permite que AgentForm trate sucesso
        }}
        onError={() => setLeadError("Falha ao gerar keywords")}
      />

      {leadError && <p className="text-red-600 mt-4">{leadError}</p>}

      {loading && (
        <p className="text-gray-500 mt-4">Gerando palavras-chave, aguarde...</p>
      )}

      {/* Exibe lista de keywords geradas (renderização estruturada)*/}
      {keywords.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Keywords geradas:</h2>
          <ul className="space-y-4">
            {keywords.map((kw, i) => (
              <li key={i} className="border rounded p-2">
                <p>
                  <strong>Termo:</strong> {kw.term}
                </p>
                <p>
                  <strong>Razão:</strong> {kw.reason}
                </p>
                <p>
                  <strong>Intenção:</strong> {kw.intent}
                </p>
                <p>
                  <strong>Tipo:</strong> {kw.type}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
