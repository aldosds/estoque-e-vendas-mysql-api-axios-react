// Carrega as variáveis de ambiente do arquivo .env
import dotenv from "dotenv";
dotenv.config();

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

// ==========================================
// ROTAS DE VENDAS
// ==========================================

// Listar vendas trazendo o nome do produto através de um INNER JOIN
app.get("/api/vendas", (req, res) => {
  const sql = `
    SELECT v.*, p.nome AS produto_nome 
    FROM vendas v 
    INNER JOIN produtos p ON v.produto_id = p.id
    ORDER BY v.data_venda DESC
  `;
  db.query(sql, (err, resultados) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(resultados);
  });
});

// Registrar Venda (Dá baixa no estoque do produto e insere no histórico)
app.post("/api/vendas", (req, res) => {
  const { produto_id, quantidade, preco_unitario } = req.body;
  const valor_total = quantidade * preco_unitario;

  // Verifica estoque primeiro
  db.query(
    "SELECT estoque FROM produtos WHERE id = ?",
    [produto_id],
    (err, rows) => {
      if (err) return res.status(500).json({ erro: err.message });
      if (rows.length === 0 || rows[0].estoque < quantidade) {
        return res.status(400).json({ erro: "Estoque insuficiente!" });
      }

      // Inicia transação para garantir consistência
      db.beginTransaction((tErr) => {
        if (tErr) return res.status(500).json({ erro: tErr.message });

        // 1. Insere o registro da venda
        const sqlVenda =
          "INSERT INTO vendas (produto_id, quantidade, preco_unitario, valor_total) VALUES (?, ?, ?, ?)";
        db.query(
          sqlVenda,
          [produto_id, quantidade, preco_unitario, valor_total],
          (vErr, vResult) => {
            if (vErr)
              return db.rollback(() =>
                res.status(500).json({ erro: vErr.message }),
              );

            // 2. Atualiza o estoque do produto decrementando a quantidade
            const sqlEstoque =
              "UPDATE produtos SET estoque = estoque - ? WHERE id = ?";
            db.query(sqlEstoque, [quantidade, produto_id], (eErr) => {
              if (eErr)
                return db.rollback(() =>
                  res.status(500).json({ erro: eErr.message }),
                );

              db.commit((cErr) => {
                if (cErr)
                  return db.rollback(() =>
                    res.status(500).json({ erro: cErr.message }),
                  );
                res.json({
                  id: vResult.insertId,
                  mensagem: "Venda registrada!",
                });
              });
            });
          },
        );
      });
    },
  );
});

// Excluir Venda (Estorna os itens de volta para o estoque do produto)
app.delete("/api/vendas/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT produto_id, quantidade FROM vendas WHERE id = ?",
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ erro: err.message });
      if (rows.length === 0)
        return res.status(404).json({ erro: "Venda não encontrada!" });

      const { produto_id, quantidade } = rows[0];

      db.beginTransaction((tErr) => {
        if (tErr) return res.status(500).json({ erro: tErr.message });

        // 1. Devolve a quantidade ao estoque do produto
        db.query(
          "UPDATE produtos SET estoque = estoque + ? WHERE id = ?",
          [quantidade, produto_id],
          (eErr) => {
            if (eErr)
              return db.rollback(() =>
                res.status(500).json({ erro: eErr.message }),
              );

            // 2. Deleta a venda
            db.query("DELETE FROM vendas WHERE id = ?", [id], (dErr) => {
              if (dErr)
                return db.rollback(() =>
                  res.status(500).json({ erro: dErr.message }),
                );

              db.commit((cErr) => {
                if (cErr)
                  return db.rollback(() =>
                    res.status(500).json({ erro: cErr.message }),
                  );
                res.json({ mensagem: "Venda cancelada e estoque estornado!" });
              });
            });
          },
        );
      });
    },
  );
});

// Inicializa o servidor na porta 3000
app.listen(3000, () => {
  console.log("🖥️ Servidor rodando em http://localhost:3000");
});
