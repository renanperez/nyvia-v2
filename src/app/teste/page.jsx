"use client";

import { useEffect, useState } from "react";
import { Hero } from "../../../frontend/components/Hero";
import { BenefitsSection } from "../../../frontend/components/BenefitsSection";
import { HowItWorksSection } from "../../../frontend/components/HowItWorksSection";
import { TestimonialsSection } from "../../../frontend/components/TestimonialsSection";
import { KeywordsAgentSection } from "../../../frontend/components/KeywordsAgentSection";
import { LeadForm } from "../../../frontend/components/LeadForm";

export default function TestePage() {
  const [leadCaptured, setLeadCaptured] = useState(false); // State to check if the lead has already been captured
  const [isClient, setIsClient] = useState(false); // State to check if we are on the client side (Client Component)
  useEffect(() => {
    // useEffect to check if the lead has already been captured and ensure the code runs on the client
    setIsClient(true); // ensures we are on the client
    const lead = localStorage.getItem("leadNyvia"); // Checks if the lead has already been captured in localStorage
    if (lead) {
      // If the lead has already been captured, update the state
      setLeadCaptured(true);
    }
  }, []);

  return (
    <>
      <Hero onClickScrollTo="lead-form" />{" "}
      {/* Button scrolls to the form (anchor) */}
      <BenefitsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      {/* Show the form if the lead has not been captured yet */}
      {!leadCaptured && <LeadForm />}
      {/* Show the agent if the lead has already been captured */}
      {isClient && leadCaptured && <KeywordsAgentSection />}
    </>
  );
}

// TestePage.jsx
// This is the main component of the test page, which combines several components
// to create a complete experience. It uses state to check if the lead has already been captured
// and renders the form or the keywords agent as needed.
// The page is styled with Tailwind CSS classes to ensure a modern and responsive layout.
// The Hero component displays the main section with the product title and description.
// Este é o componente principal da página de teste, que combina vários componentes
// para criar uma experiência completa. Ele utiliza o estado para verificar se o lead já foi capturado
// e renderiza o formulário ou o agente de palavras-chave conforme necessário.
// A página é estilizada com classes Tailwind CSS para garantir um layout moderno e responsivo.
// O componente Hero exibe a seção principal com o título e descrição do produto.
