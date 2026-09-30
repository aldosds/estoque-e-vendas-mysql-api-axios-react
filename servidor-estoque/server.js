// Carrega as variáveis de ambiente do arquivo .env
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mysql from "mysql2";
import cors from "cors";

// Ferramentas de segurança
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();

// Middlewares obrigatórios
app.use(cors());
app.use(express.json()); // Permite que o Node entenda dados enviados no formato JSON

// Chave secreta exclusiva para assinar criptograficamente os tokens JWT
const JWT_SECRET = "minha_chave_secreta_super_protegida_2026";

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

// ==========================================
// 🛡️ MIDDLEWARE DE AUTENTICAÇÃO (O GUARDA)
// ==========================================
function verificarToken(req, res, next) {
  // Captura o token enviado no cabeçalho (Header) da requisição Axios
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ erro: "Acesso negado. Token não fornecido!" });
  }

  try {
    // Valida se o token foi assinado pela nossa chave secreta e não foi adulterado
    const dadosDecodificados = jwt.verify(token, JWT_SECRET);
    req.usuarioLogado = dadosDecodificados; // Injeta os dados do usuário na requisição
    next(); // Permite que a requisição siga para a rota original
  } catch (erro) {
    return res.status(403).json({ erro: "Token inválido ou expirado!" });
  }
}

// ==========================================
// 🔑 ROTAS DE AUTENTICAÇÃO
// ==========================================

// Rota de Cadastro de Usuários (Criptografa a senha antes de salvar)
app.post("/api/auth/registrar", async (req, res) => {
  const { nome, email, senha, nivel_acesso } = req.body;

  try {
    // Gera o 'salt' e encripta a senha usando algoritmo hash seguro (Bcrypt)
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    const sql =
      "INSERT INTO usuarios (nome, email, senha, nivel_acesso) VALUES (?, ?, ?, ?)";
    db.query(sql, [nome, email, senhaCriptografada, nivel_acesso], (err) => {
      if (err) return res.status(400).json({ erro: "E-mail já cadastrado!" });
      res.json({ mensagem: "Usuário registrado com sucesso!" });
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Rota de Login (Gera o passaporte Token JWT se a senha bater)
app.post("/api/auth/login", (req, res) => {
  const { email, senha } = req.body;

  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    async (err, resultados) => {
      if (err) return res.status(500).json({ erro: err.message });
      if (resultados.length === 0)
        return res.status(400).json({ erro: "E-mail ou senha inválidos!" });

      const usuario = resultados[0];

      // Compara a senha digitada com o hash criptografado salvo no MySQL
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
      if (!senhaCorreta)
        return res.status(400).json({ erro: "E-mail ou senha inválidos!" });

      // Gera o Token JWT contendo ID e nível de acesso, com validade de 2 horas
      const token = jwt.sign(
        { id: usuario.id, nivel: usuario.nivel_acesso, nome: usuario.nome },
        JWT_SECRET,
        { expiresIn: "2h" },
      );

      // Devolve o token e os dados públicos para o Front-end
      res.json({ token, nome: usuario.nome, nivel: usuario.nivel_acesso });
    },
  );
});

// ==========================================
// 📦 ROTAS DE PRODUTOS (PROTEGIDAS)
// ==========================================
app.get("/api/produtos", verificarToken, (req, res) => {
  db.query("SELECT * FROM produtos", (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(result);
  });
});

app.post("/api/produtos", verificarToken, (req, res) => {
  // 🔒 Bloqueio de segurança no servidor: Se não for admin, impede o INSERT
  if (req.usuarioLogado.nivel !== "admin") {
    return res
      .status(403)
      .json({ erro: "Apenas administradores podem cadastrar produtos!" });
  }
  const { nome, categoria, preco, estoque } = req.body;
  const sql =
    "INSERT INTO produtos (nome, categoria, preco, estoque) VALUES (?, ?, ?, ?)";
  db.query(sql, [nome, categoria, preco, estoque], (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ id: result.insertId, nome, categoria, preco, estoque });
  });
});

app.put("/api/produtos/:id", verificarToken, (req, res) => {
  if (req.usuarioLogado.nivel !== "admin") {
    return res
      .status(403)
      .json({ erro: "Apenas administradores podem editar produtos!" });
  }
  const { id } = req.params;
  const { nome, categoria, preco, estoque } = req.body;
  const sql =
    "UPDATE produtos SET nome = ?, categoria = ?, preco = ?, estoque = ? WHERE id = ?";
  db.query(sql, [nome, categoria, preco, estoque, id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ mensagem: "Produto atualizado!" });
  });
});

app.delete("/api/produtos/:id", verificarToken, (req, res) => {
  if (req.usuarioLogado.nivel !== "admin") {
    return res
      .status(403)
      .json({ erro: "Apenas administradores podem excluir produtos!" });
  }
  const { id } = req.params;
  db.query("DELETE FROM produtos WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ mensagem: "Produto removido!" });
  });
});

// ==========================================
// 💰 ROTAS DE VENDAS (PROTEGIDAS)
// ==========================================
app.get("/api/vendas", verificarToken, (req, res) => {
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

app.post("/api/vendas", verificarToken, (req, res) => {
  const { produto_id, quantidade, preco_unitario } = req.body;
  const valor_total = quantidade * preco_unitario;

  db.query(
    "SELECT estoque FROM produtos WHERE id = ?",
    [produto_id],
    (err, rows) => {
      if (err) return res.status(500).json({ erro: err.message });
      if (rows.length === 0 || rows[0].estoque < quantidade) {
        return res.status(400).json({ erro: "Estoque insuficiente!" });
      }

      db.beginTransaction((tErr) => {
        if (tErr) return res.status(500).json({ erro: tErr.message });

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

app.delete("/api/vendas/:id", verificarToken, (req, res) => {
  // 🔒 Bloqueio: Apenas administradores podem cancelar/estornar vendas arquivadas
  if (req.usuarioLogado.nivel !== "admin") {
    return res
      .status(403)
      .json({ erro: "Apenas administradores podem estornar vendas!" });
  }
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

        db.query(
          "UPDATE produtos SET estoque = estoque + ? WHERE id = ?",
          [quantidade, produto_id],
          (eErr) => {
            if (eErr)
              return db.rollback(() =>
                res.status(500).json({ erro: eErr.message }),
              );

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
