// Ferramentas de segurança
import mysql from "mysql2";
import dotenv from "dotenv";

// Carrega as variáveis do arquivo .env
dotenv.config();

// Configuração da Conexão com o MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((error) => {
  if (error) console.error("❌ Erro ao conectar ao MySQL:", error.message);
  else console.log("🚀 Conectado com sucesso ao Banco de Dados MySQL!");
});

export default db;
