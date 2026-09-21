// Carrega as variáveis de ambiente do arquivo .env
require("dotenv").config();

import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();

// Middlewares obrigatórios
app.use(cors());
app.use(express.json()); // Permite que o Node entenda dados enviados no formato JSON

// 1. Configuração da Conexão com o MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((erro) => {
  if (erro) {
    console.error("❌ Erro ao conectar ao MySQL:", erro);
    return;
  }
  console.log("🚀 Conectado com sucesso ao Banco de Dados MySQL!");
});

// =============================================================
// ROTAS DE COMUNICAÇÃO (API)
// =============================================================

// ROTA 1: Listar todos os produtos (Acessada pelo HTML ao carregar a página)
app.get("/api/produtos", (req, res) => {
  db.query("SELECT * FROM produtos", (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(result);
  });
});

// ROTA 2: Cadastrar um novo produto (Recebe os dados do formulário)
app.post("/api/produtos", (req, res) => {
  const { nome, categoria, preco, estoque } = req.body;
  const sql =
    "INSERT INTO produtos (nome, categoria, preco, estoque) VALUES (?, ?, ?, ?)";
  db.query(sql, [nome, categoria, preco, estoque], (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ id: result.insertId, nome, categoria, preco, estoque });
  });
});

// ROTA 3: Editar um produto existente (Recebe o ID pela URL e os dados no corpo)
app.put("/api/produtos/:id", (req, res) => {
  const { id } = req.params;
  const { nome, categoria, preco, estoque } = req.body;
  const sql =
    "UPDATE produtos SET nome = ?, categoria = ?, preco = ?, estoque = ? WHERE id = ?";
  db.query(sql, [nome, categoria, preco, estoque, id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ mensagem: "Produto atualizado!" });
  });
});

// ROTA 4: Excluir um produto
app.delete("/api/produtos/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM produtos WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ mensagem: "Produto removido!" });
  });
});

// Inicializa o servidor na porta 3000
app.listen(3000, () => {
  console.log("🖥️ Servidor rodando em http://localhost:3000");
});
