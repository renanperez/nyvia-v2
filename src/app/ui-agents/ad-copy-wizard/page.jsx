"use client";
// src/app/ui-agents/ad-copy-wizard/page.jsx
import { useState } from "react";
import api from "@/services/api";
import AgentForm from "@/components/AgentForm";
import "@/styles/tailwind.css";

export default function AdCopyWizardPage() {
  // This page allows users to generate ad copy for their products or services.
  // It uses the AgentForm component to submit product descriptions and receive generated ad copy.
  const [adCopy, setAdCopy] = useState(null);
  const [error, setError] = useState("");

  return (
    // Main component for the Ad Copy Wizard page
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Ad Copy Wizard</h1>
      {/* This component renders the main content of the page, including the title and the form for generating ad copy. */}
      <AgentForm
        agent="ad-copy-wizard"
        placeholder="Descreva seu produto ou serviço…"
        onSubmit={async (desc) => {
          try {
            const res = await api.post("/api/ad-copy", {
              product: desc,
              audience: "Público interessado no produto",
              tone: "Inspirador e motivador",
            });

            setAdCopy(res.data);
            return res;
          } catch (err) {
            console.error("Erro ao gerar ad copy:", err);
            setError("Falha ao gerar textos de anúncio");
          }
        }}
        onError={() => setError("Falha ao gerar textos de anúncio")}
      />

      {error && <p className="text-red-600 mt-4">{error}</p>}
      {/* This section displays any error messages that occur during the ad copy generation process. */}
      {adCopy && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-2">
            Textos de anúncio gerados:
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold">Títulos:</h3>
              <ul className="list-disc list-inside">
                {adCopy.headlines?.map((headline, i) => (
                  <li key={i}>{headline}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold">Descrições:</h3>
              <ul className="list-disc list-inside">
                {adCopy.descriptions?.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold">Resumo da estratégia:</h3>{" "}
              {/* This section provides a summary of the ad strategy. */}
              <p>{adCopy.summary}</p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
// This page allows users to generate ad copy for their products or services.
// It uses the AgentForm component to submit product descriptions and receive generated ad copy.
