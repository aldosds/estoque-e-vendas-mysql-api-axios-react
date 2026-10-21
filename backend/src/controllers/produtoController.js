import db from "../config/database.js";

// Listar todos os produtos (Acessada pelo HTML ao carregar a página)
export const listarProdutos = (req, res) => {
  db.query("SELECT * FROM produtos", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// Cadastrar um novo produto (Recebe os dados do formulário)
export const cadastrarProduto = (req, res) => {
  // Bloqueio de segurança no servidor: Se não for admin, impede o INSERT
  if (req.usuarioLogado.nivel !== "admin")
    return res
      .status(403)
      .json({ error: "Apenas administradores podem cadastrar produtos!" });
  const { nome, categoria, preco, estoque } = req.body;
  const sql =
    "INSERT INTO produtos (nome, categoria, preco, estoque) VALUES (?, ?, ?, ?)";
  db.query(sql, [nome, categoria, preco, estoque], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, nome, categoria, preco, estoque });
  });
};

// Editar um produto existente (Recebe o ID pela URL e os dados no corpo)
export const editarProduto = (req, res) => {
  if (req.usuarioLogado.nivel !== "admin")
    return res
      .status(403)
      .json({ error: "Apenas administradores podem editar produtos!" });
  const { id } = req.params;
  const { nome, categoria, preco, estoque } = req.body;
  const sql =
    "UPDATE produtos SET nome = ?, categoria = ?, preco = ?, estoque = ? WHERE id = ?";
  db.query(sql, [nome, categoria, preco, estoque, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensagem: "Produto atualizado!" });
  });
};

// Excluir um produto
export const excluirProduto = (req, res) => {
  if (req.usuarioLogado.nivel !== "admin")
    return res
      .status(403)
      .json({ error: "Apenas administradores podem excluir produtos!" });
  const { id } = req.params;
  db.query("DELETE FROM produtos where id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensagem: "Produto removido!" });
  });
};
