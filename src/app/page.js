"use client";

import Link from "next/link";
// Importa o CSS global (caso não esteja apenas no layout)
import "@/app/globals.css";

export default function HomePage() {
  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Bem-vindo(a) à Nyvia</h1>
      <h2 className="text-xl mb-6">Escolha seu agente de IA:</h2>
      <ul className="space-y-3">
        <li>
          <Link
            href="/ui-agents/keyword-scout"
            className="text-blue-600 hover:underline"
          >
            Keyword Scout
          </Link>
        </li>
        <li>
          <Link
            href="/ui-agents/ad-copy-wizard"
            className="text-blue-600 hover:underline"
          >
            Ad Copy Wizard
          </Link>
        </li>
        <li>
          <Link
            href="/ui-agents/performance-dashboard"
            className="text-blue-600 hover:underline"
          >
            Performance Dashboard
          </Link>
        </li>
      </ul>
    </main>
  );
}

//     )}
//       {/* Link para o Dashboard */}
//       <div className="mt-6">
//         <Link href="/agentes/performance-dashboard">
//           <a className="text-blue-600 hover:underline">Ir para o Dashboard</a>
//         </Link>
