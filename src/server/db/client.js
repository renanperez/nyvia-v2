// Conexão única e reutilizável com o MongoDB (Next.js + Node, ESM)
import { MongoClient, ServerApiVersion } from "mongodb";
// Requer a variável de ambiente MONGODB_URI
const uri = process.env.MONGODB_URI;    // ex: "mongodb+srv://user:password@cluster.mongodb.net/mydatabase"
const dbName = process.env.NYVIA_DB_NAME || "nyvia_staging";    // nome do banco de dados padrão se não definido          
if (!uri) throw new Error("MONGODB_URI ausente");

// Cache global para evitar múltiplas conexões em hot-reload/imports (Next.js) reutilização da conexão em produção
// Em ambiente de desenvolvimento, usamos a variável global para evitar múltiplas conexões
let cached = globalThis._nyviaMongo;
if (!cached) cached = (globalThis._nyviaMongo = { client: null, db: null, promise: null });
// Conecta ao MongoDB Atlas (singleton)
export async function getDb() {
  if (cached.db) return cached.db;

  if (!cached.promise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,                // free tier friendly
      serverSelectionTimeoutMS: 5000, // falha rápida se acesso ao Atlas estiver bloqueado
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    cached.promise = client.connect().then((c) => {
      cached.client = c;
      cached.db = c.db(dbName);
      return cached.db;
    });
  }

  return cached.promise;
}
// Uso:
// import { getDb } from './db/client'; -> em qualquer lugar do código
// (async () => {
    //   const db = await getDb();
    //   // use db...
    // })(); -- Exemplo de uso assíncrono
// Exemplos de operações com a coleção 'users': 
    // const db = await getDb();
    // const users = await db.collection('users').find().toArray();
    // const user = await db.collection('users').findOne({ email: 'user@example.com' }); 
// exemplos de inserção, atualização e exclusão:    
    // const result = await db.collection('users').insertOne({ name: 'New User', email: 'newuser@example.com' });
    // const result = await db.collection('users').updateOne({ email: 'user@example.com' }, { $set: { name: 'Updated User' } });
    // const result = await db.collection('users').deleteOne({ email: 'user@example.com' });
// Certifique-se de tratar erros e fechar a conexão conforme necessário em seu aplicativo real.
