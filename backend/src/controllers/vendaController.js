import db from "../config/database.js";

// Listar vendas trazendo o nome do produto através de um INNER JOIN
export const listarVendas = async (req, res) => {
  const sql = `
    SELECT v.*, p.nome AS produto_nome
    FROM vendas v
    INNER JOIN produtos p ON v.produto_id = p.id
    ORDER BY v.data_venda DESC
  `;

  try {
    const { rows } = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Registrar Venda (Dá baixa no estoque do produto e insere no histórico)
export const realizarVenda = async (req, res) => {
  const { produto_id, quantidade, preco_unitario } = req.body;
  const valor_total = quantidade * preco_unitario;

  // 1. Pega uma conexão exclusiva do Pool para isolar a transação
  const client = await db.connect();

  try {
    // 2. Inicia a transação no PostgreSQL
    await client.query("BEGIN");

    // 3. Verifica o estoque usando a mesma conexão exclusiva
    const { rows } = await client.query(
      "SELECT estoque FROM produtos WHERE id = $1",
      [produto_id],
    );

    if (rows.length === 0 || rows[0].estoque < quantidade) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Estoque insuficiente!" });
    }

    // 4. Insere a venda e já captura o ID gerado usando RETURNING
    const sqlVenda = `
      INSERT INTO vendas (produto_id, quantidade, preco_unitario, valor_total) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id
    `;
    const vendaResult = await client.query(sqlVenda, [
      produto_id,
      quantidade,
      preco_unitario,
      valor_total,
    ]);

    // 5. Atualiza o estoque do produto
    const sqlEstoque =
      "UPDATE produtos SET estoque = estoque - $1 WHERE id = $2";
    await client.query(sqlEstoque, [quantidade, produto_id]);

    // 6. Confirma e salva todas as operações definitivamente
    await client.query("COMMIT");

    res.status(201).json({
      id: vendaResult.rows[0].id,
      mensagem: "Venda realizada com sucesso!",
    });
  } catch (err) {
    // Se qualquer query falhar no meio do caminho, desfaz tudo automaticamente
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    // 7. OBRIGATÓRIO: Devolve a conexão para o Pool (evita travar o servidor)
    client.release();
  }
};

// Excluir Venda (Estorna os itens de volta para o estoque do produto)
export const estornarVenda = async (req, res) => {
  if (req.usuarioLogado.nivel !== "admin")
    return res
      .status(403)
      .json({ error: "Apenas administradores podem estornar vendas!" });

  const { id } = req.params;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      "SELECT produto_id, quantidade FROM vendas WHERE id = $1",
      [id],
    );
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Venda não encontrada!" });
    }

    const { produto_id, quantidade } = rows[0];

    // Devolve a quantidade ao estoque
    await client.query(
      "UPDATE produtos SET estoque = estoque + $1 WHERE id = $2",
      [quantidade, produto_id],
    );

    // Remove o registro da venda
    await client.query("DELETE FROM vendas WHERE id = $1", [id]);

    await client.query("COMMIT");
    res.json({ mensagem: "Venda cancelada e estoque estornado!" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
