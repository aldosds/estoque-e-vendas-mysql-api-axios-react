import db from "../config/database.js";

// 🔍 LISTAR PRODUTOS
export const listarProdutos = async (req, res) => {
  try {
    // O driver 'pg' devolve um objeto completo; os registros ficam dentro de '.rows'
    const { rows } = await db.query("SELECT * FROM produtos ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➕ CADASTRAR PRODUTO (Usando $1, $2... e RETURNING *)
export const cadastrarProduto = async (req, res) => {
  if (req.usuarioLogado.nivel !== "admin") {
    return res
      .status(403)
      .json({ error: "Apenas administradores podem cadastrar produtos!" });
  }

  const { nome, categoria, preco, estoque } = req.body;
  const sql = `
    INSERT INTO produtos (nome, categoria, preco, estoque) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *
  `;

  try {
    const { rows } = await db.query(sql, [nome, categoria, preco, estoque]);
    // rows[0] já contém o objeto completo com o ID gerado pelo SERIAL do Postgres!
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📝 EDITAR PRODUTO
export const editarProduto = async (req, res) => {
  if (req.usuarioLogado.nivel !== "admin") {
    return res
      .status(403)
      .json({ error: "Apenas administradores podem editar produtos!" });
  }

  const { id } = req.params;
  const { nome, categoria, preco, estoque } = req.body;
  const sql = `
    UPDATE produtos 
    SET nome = $1, categoria = $2, preco = $3, estoque = $4 
    WHERE id = $5 
    RETURNING *
  `;

  try {
    const { rows } = await db.query(sql, [nome, categoria, preco, estoque, id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Produto não encontrado!" });
    }
    res.json({ mensagem: "Produto atualizado!", produto: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🗑️ EXCLUIR PRODUTO
export const excluirProduto = async (req, res) => {
  if (req.usuarioLogado.nivel !== "admin") {
    return res
      .status(403)
      .json({ error: "Apenas administradores podem excluir produtos!" });
  }

  const { id } = req.params;

  try {
    const { rowCount } = await db.query("DELETE FROM produtos WHERE id = $1", [
      id,
    ]);
    if (rowCount === 0) {
      return res.status(404).json({ error: "Produto não encontrado!" });
    }
    res.json({ mensagem: "Produto removido com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
