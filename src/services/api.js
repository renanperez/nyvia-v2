import axios from "axios";
// 1️⃣ Importa o axios para fazer requisições HTTP.

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  // 2️⃣ Cria uma instância com baseURL padrão.
  // Você pode substituir o valor de baseURL pelo endereço da sua API.//
  // process.env.NEXT_PUBLIC_API_BASE_URL: permite configurar o endpoint no .env.local
  // Em produção, basta definir NEXT_PUBLIC_API_BASE_URL=/api ou https://api.nyvia.com e tudo funcionará.
});

export default api;
// Se estiver usando Next.js, o baseURL pode ser configurado para apontar para a rota da API
