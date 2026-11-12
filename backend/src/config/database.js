// Ferramentas de segurança
import pg from "pg";
import dotenv from "dotenv";

// Carrega as variáveis do arquivo .env
dotenv.config();

// Extraímos a classe Pool do pacote 'pg' (padrão recomendado para ES Modules)
const { Pool } = pg;

// Configuração da Conexão com o PostgreSQL
const db = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // Obrigatório para bancos na nuvem (Neon/Render)
      }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
      },
);

// Teste rápido de conexão ao iniciar o servidor
db.connect((err, client, release) => {
  if (err) {
    console.error("❌ Erro ao conectar no PostgreSQL:", err.message);
    return;
  }
  console.log("🐘 PostgreSQL conectado com sucesso via Pool!");
  release(); // Devolve a conexão de teste para o Pool imediatamente
});

export default db;
