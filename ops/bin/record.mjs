// ops/bin/record.mjs
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RECORDS_DIR = path.resolve(__dirname, "../records");

function sh(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "";
  }
}

function todayISO() {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset(); // minutes
  const local = new Date(d.getTime() - tzOffset * 60000);
  return local.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getBranch() {
  return sh("git rev-parse --abbrev-ref HEAD") || "unknown-branch";
}

function getShortHash() {
  return sh("git rev-parse --short HEAD") || "nohash";
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writeIfMissing(filepath, content) {
  if (fs.existsSync(filepath)) return false;
  fs.writeFileSync(filepath, content, "utf8");
  return true;
}

function headerTemplate({ title, date, env = "STAGING" }) {
  return `# ${title}
📅 Data: ${date}
👤 Responsável: Renan Perez
🌐 Ambiente: ${env}

`;
}

function sectionTemplate({ objetivo, estado, proximos, evidencias, refs }) {
  const sObjetivo = `## 🎯 Objetivo
${objetivo}

`;
  const sEstado = `## ✅ Estado Atual
${estado}

`;
  const sProximos = `## 🔧 Próximos Passos
${proximos}

`;
  const sEvidencias = `## 🧩 Evidências
${evidencias}

`;
  const sRefs = `## 🗂️ Referências
${refs}
`;
  return sObjetivo + sEstado + sProximos + sEvidencias + sRefs;
}

// -------- PRESETS PRONTOS (sem preencher nada) --------
function presetEtapa2RailwayStaging({ date }) {
  const title = "HANDOFF — Etapa 2 (Infraestrutura Railway – STAGING)";
  const objetivo = `Provisionar o ambiente nyvia-staging no Railway, isolado de produção e com deploy **manual** (sem automação).`;
  const estado = `- [x] Projeto Railway criado (nyvia-staging)
- [x] Environment staging ativo
- [x] Service \`nyvia\` conectado ao repo \`renanperez/nyvia\` (branch \`staging\`)
- [x] Auto Deploy / Build on Push / PR Deploys / Wait for CI: **OFF**
- [x] Builder: Railpack (Default) / Metal Build: OFF
- [x] Variáveis de ambiente configuradas (.env.staging)
- [x] Build: \`npm ci && npm run build\`
- [x] Start: \`npm run start\`
- [x] NODE_ENV = production **(padrão do Railway)**`;
  const proximos = `1) Railway → Service \`nyvia\` → **Deployments** → **Deploy Now** (Source: \`staging\`)
2) Após sucesso, **Settings → Networking → Generate Domain**
3) Validar:
   - \`GET /api/healthz\` => **200 OK**
   - \`GET /api/logs?limit=1\` => **200** com JSON (envelope \`count\`, \`items\`, \`nextCursor\`)`;
  const evidencias = `- Prints: Settings/Variables, Deployments (Succeeded), Logs (“Ready on port …”)
- Respostas HTTP dos endpoints (200)
- Commits/PRs relacionados`;
  const refs = `- Branch alvo: \`staging\`
- Política atual: **Staging-first**, sem auto-deploy
- Vars (staging): \`APP_ENV=staging\`, \`NYVIA_MOCK_MODE=mock\`, \`MONGODB_URI\`, \`NYVIA_DB_NAME=nyvia_staging\`, \`MONGODB_DB=nyvia_staging\`, \`NEXT_TELEMETRY_DISABLED=1\`
- Produção (futuro): \`APP_ENV=production\`, \`NYVIA_MOCK_MODE=openai\`, \`OPENAI_API_KEY=<real>\`, \`MONGODB_URI\`/DB de produção`;

  return (
    headerTemplate({ title, date, env: "STAGING" }) +
    sectionTemplate({ objetivo, estado, proximos, evidencias, refs })
  );
}

function presetEtapa3DeployValidacao({ date, branch, hash }) {
  const title = "HANDOFF — Etapa 3 (Deploy manual + validação de logs em STAGING)";
  const objetivo = `Disparar deploy manual no Railway a partir da branch \`${branch}\` (commit ${hash}) e realizar sanity checks de saúde e logs.`;
  const estado = `- [ ] Deploy manual iniciado via **Deploy Now** (source: \`${branch}\`)
- [ ] Domínio público gerado
- [ ] \`GET /api/healthz\` => 200 OK
- [ ] \`GET /api/logs?limit=1\` => 200 + JSON (envelope)`;
  const proximos = `1) Railway → Service \`nyvia\` → **Deployments** → **Deploy Now**
2) Gerar domínio público: Settings → Networking → Generate Domain
3) Sanity HTTP:
   - \`GET /api/healthz\` (200)
   - \`GET /api/logs?limit=1\` (200 + JSON)
4) (Opcional) Filtros rápidos:
   - \`GET /api/logs?limit=5&level=error\`
   - \`GET /api/logs?limit=5&since=2024-01-01T00:00:00Z\``;
  const evidencias = `- Deployments: status **Succeeded**
- Logs do app: “Ready on port …”
- Capturas das respostas HTTP (healthz / logs)
- Links para PR/commit quando aplicável`;
  const refs = `- Política: **Staging-first**, sem auto-deploy
- Endpoints: \`/api/healthz\`, \`/api/logs\`
- Scripts auxiliares (PowerShell/CLI) quando aplicável`;

  return (
    headerTemplate({ title, date, env: "STAGING" }) +
    sectionTemplate({ objetivo, estado, proximos, evidencias, refs })
  );
}

// Map de presets
const PRESETS = {
  "etapa2-railway-staging": presetEtapa2RailwayStaging,
  "etapa3-deploy-validacao-staging": presetEtapa3DeployValidacao,
};

function createRecordFromPreset(key) {
  const date = todayISO();
  const branch = getBranch();
  const hash = getShortHash();

  const fn = PRESETS[key];
  if (!fn) {
    console.error(`Preset não encontrado: ${key}`);
    process.exit(2);
  }
  const content = fn({ date, branch, hash });
  const slug = key.replace(/[^a-z0-9\-]/gi, "").toLowerCase();
  const filename = `${date}-${slug}.md`;
  const full = path.join(RECORDS_DIR, filename);

  ensureDir(RECORDS_DIR);
  const created = writeIfMissing(full, content);
  if (created) {
    console.log(`✅ Criado: ops/records/${filename}`);
  } else {
    console.log(`ℹ️ Já existia: ops/records/${filename}`);
  }
  return created;
}

function main() {
  const arg = process.argv[2];
  if (!arg || arg === "auto") {
    // Modo AUTO: cria o que estiver faltando (Etapa 2 e 3)
    const created2 = createRecordFromPreset("etapa2-railway-staging");
    const created3 = createRecordFromPreset("etapa3-deploy-validacao-staging");
    if (!created2 && !created3) {
      console.log("Nada a criar. Registros já existem.");
    }
    process.exit(0);
  }

  // Modo específico: npm run record <preset>
  if (PRESETS[arg]) {
    createRecordFromPreset(arg);
    process.exit(0);
  }

  console.error("Uso:");
  console.error("  node ops/bin/record.mjs            # AUTO (gera Etapa 2 e 3 se faltarem)");
  console.error("  node ops/bin/record.mjs auto       # idem");
  console.error("  node ops/bin/record.mjs etapa2-railway-staging");
  console.error("  node ops/bin/record.mjs etapa3-deploy-validacao-staging");
  process.exit(1);
}

main();
