import { MongoClient, ServerApiVersion } from "mongodb";

// COLE AQUI a URI copiada do Atlas:
const uri = "mongodb+srv://nyvia_app_stg:cluster_app_stg_pass@clusterstaging.xrh5ltp.mongodb.net/?retryWrites=true&w=majority&appName=clusterStaging";

// nome do banco
const dbName = "nyvia_staging";

if (!uri) {
  console.error("MONGODB_URI ausente");
  process.exit(1);
}

async function main() {
  try {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();
    console.log("✅ Conectou no Mongo Atlas (clusterStaging)");

    const db = client.db(dbName);
    const collections = await db.collections();
    console.log("Coleções:", collections.map((c) => c.collectionName));

    await client.close();
    console.log("✅ Conexão fechada com sucesso");
  } catch (err) {
    console.error("❌ Erro ao conectar:", err.name, "-", err.message);
  }
}

main();

// --- IGNORE ---