// Carrega as variáveis de ambiente do arquivo .env
require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

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
  const querySQL = "SELECT * FROM produtos";

  db.query(querySQL, (erro, resultados) => {
    if (erro) return res.status(500).json({ erro: erro.message });
    res.json(resultados); // Retorna o array de objetos para o Front-end
  });
});

// ROTA 2: Cadastrar um novo produto (Recebe os dados do formulário)
app.post("/api/produtos", (req, res) => {
  // Usamos Desestruturação de Objeto para capturar os dados enviados pelo HTML
  const { nome, categoria, preco, estoque } = req.body;

  // O ponto de interrogação (?) evita ataques de injeção SQL, tornando o código seguro
  const querySQL =
    "INSERT INTO produtos (nome, categoria, preco, estoque) VALUES (?, ?, ?, ?)";

  db.query(querySQL, [nome, categoria, preco, estoque], (erro, resultado) => {
    if (erro) return res.status(500).json({ erro: erro.message });
    res.json({ id: resultado.insertId, nome, categoria, preco, estoque });
  });
});

// ROTA 3: Editar um produto existente (Recebe o ID pela URL e os dados no corpo)
app.put("/api/produtos/:id", (req, res) => {
  const { id } = req.params; // Captura o ID enviado na URL (ex: /api/produtos/2)
  const { nome, categoria, preco, estoque } = req.body;

  const querySQL =
    "UPDATE produtos SET nome = ?, categoria = ?, preco = ?, estoque = ? WHERE id = ?";

  db.query(querySQL, [nome, categoria, preco, estoque, id], (erro) => {
    if (erro) return res.status(500).json({ erro: erro.message });
    res.json({ mensagem: "Produto atualizado com sucesso!" });
  });
});

// ROTA 4: Excluir um produto
app.delete("/api/produtos/:id", (req, res) => {
  const { id } = req.params;
  const querySQL = "DELETE FROM produtos WHERE id = ?";

  db.query(querySQL, [id], (erro) => {
    if (erro) return res.status(500).json({ erro: erro.message });
    res.json({ mensagem: "Produto excluído do MySQL!" });
  });
});

// Inicializa o servidor na porta 3000
app.listen(3000, () => {
  console.log("🖥️ Servidor rodando em http://localhost:3000");
});
