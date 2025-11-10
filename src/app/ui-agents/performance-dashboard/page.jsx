"use client";

import { useState } from "react";
import api from "@/services/api";
import AgentForm from "@/components/AgentForm";
import "@/styles/tailwind.css";

export default function PerformanceDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Performance Dashboard</h1>

      <AgentForm
        agent="performance-dashboard"
        placeholder="Cole suas métricas (ex: CTR: 2%, CPC: R$0,50, ROI: 250%)…"
        onSubmit={async (metrics) => {
          try {
            const res = await api.post("/api/performance-dashboard", {
              metrics,
              period: "Últimos 30 dias",
            });

            setDashboard(res.data);
            return res;
          } catch (err) {
            console.error("Erro ao gerar dashboard:", err);
            setError("Falha ao gerar dashboard");
          }
        }}
        onError={() => setError("Falha ao gerar dashboard")}
      />

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {dashboard && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Insights do Dashboard:</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold">Insights:</h3>
              <ul className="list-disc list-inside">
                {dashboard.insights?.map((insight, i) => (
                  <li key={i}>{insight}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold">Recomendações:</h3>
              <ul className="list-disc list-inside">
                {dashboard.recommendations?.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold">Resumo do Desempenho:</h3>
              <p>{dashboard.summary}</p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
// This page provides a user interface for the Performance Dashboard agent.
// It allows users to input campaign metrics and receive a summarized dashboard with insights and recommendations.
// The agent processes the input and returns structured data for display.
// The page uses a form component to handle user input and display results.
// It also handles errors gracefully, providing feedback to the user if something goes wrong.
// The layout is styled using Tailwind CSS for a clean and responsive design.
// The page is designed to be user-friendly, guiding users through the process of generating a performance dashboard based on their campaign metrics.
// The agent is expected to analyze the provided metrics and generate actionable insights and recommendations for campaign performance
