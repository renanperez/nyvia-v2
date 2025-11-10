// Força runtime Node.js para compatibilidade com crypto e dynamic import
export const runtime = "nodejs";
import { NextResponse } from "next/server"; // Importa o NextResponse para manipular a resposta da API
import { promises as fs } from "fs"; // Importa o módulo de sistema de arquivos (fs) para ler e escrever arquivos
import { join } from "path"; // Importa funções de manipulação de arquivos e caminhos

export async function POST(req) {
  // 1️⃣ Extrai os campos do corpo da requisição
  const { name, email, description } = await req.json(); // Lê o corpo da requisição JSON e extrai os campos name, email e description
  // Se não houver name, será undefined, mas email e description são obrigatórios

  // 2️⃣ Validação básica
  if (!email || !description) {
    return NextResponse.json(
      // Retorna erro se email ou descrição estiverem ausentes
      { error: "E-mail e descrição são obrigatórios." },
      { status: 400 },
    );
  }

  // 3️⃣ Monta o objeto do lead
  const lead = {
    // Cria um objeto lead com os dados recebidos
    name: name || null,
    email,
    description,
    timestamp: new Date().toISOString(),
  };

  // 4️⃣ Lê o arquivo data.json (ou inicializa um array vazio)
  const filePath = join(process.cwd(), "data.json"); // Define o caminho do arquivo data.json na raiz do projeto
  let leads = [];
  try {
    const fileContents = await fs.readFile(filePath, "utf-8");
    leads = JSON.parse(fileContents);
  } catch {
    leads = [];
  }

  // 5️⃣ Adiciona o novo lead e grava de volta
  leads.push(lead); // Adiciona o novo lead ao array existente
  await fs.writeFile(filePath, JSON.stringify(leads, null, 2));

  // 6️⃣ Retorna resposta de sucesso com código 201
  return NextResponse.json({ ok: true, lead }, { status: 201 });
}

// Este endpoint salva um novo lead em um arquivo JSON.
// Ele espera um corpo de requisição com os campos "name", "email" e "description".
