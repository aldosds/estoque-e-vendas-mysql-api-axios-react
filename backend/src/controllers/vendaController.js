import db from "../config/database.js";

// Listar vendas trazendo o nome do produto através de um INNER JOIN
export const listarVendas = (req, res) => {
  const sql = `
        SELECT v.*, p.nome AS produto_nome
        FROM vendas v
        INNER JOIN produtos p ON v.produto_id = p.id
        ORDER BY v.data_venda DESC
    `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// Registrar Venda (Dá baixa no estoque do produto e insere no histórico)
export const realizarVenda = (req, res) => {
  const { produto_id, quantidade, preco_unitario } = req.body;
  const valor_total = quantidade * preco_unitario;

  // Verifica estoque primeiro
  db.query(
    "SELECT estoque FROM produtos WHERE id = ?",
    [produto_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (rows.length === 0 || rows[0].estoque < quantidade) {
        return res.status(400).json({ error: "Estoque insuficiente!" });
      }

      // Inicia transação para garantir consistência
      db.beginTransaction((tErr) => {
        if (tErr) return res.status(500).json({ error: tErr.message });

        // Insere o registro da venda
        const sqlVenda =
          "INSERT INTO vendas (produto_id, quantidade, preco_unitario, valor_total) VALUES (?, ?, ?, ?)";
        db.query(
          sqlVenda,
          [produto_id, quantidade, preco_unitario, valor_total],
          (vErr, vResult) => {
            if (vErr)
              return db.rollback(() =>
                res.status(500).json({ error: vErr.message }),
              );

            // Atualiza o estoque do produto decrementando a quantidade
            const sqlEstoque =
              "UPDATE produtos SET estoque = estoque - ? WHERE id = ?";
            db.query(sqlEstoque, [quantidade, produto_id], (eErr) => {
              if (eErr)
                return db.rollback(() =>
                  res.status(500).json({ error: eErr.message }),
                );

              db.commit((cErr) => {
                if (cErr)
                  return db.rollback(() =>
                    res.status(500).json({ error: cErr.message }),
                  );
                res.json({
                  id: vResult.insertId,
                  mensagem: "Venda realizada com sucesso!",
                });
              });
            });
          },
        );
      });
    },
  );
};

// Excluir Venda (Estorna os itens de volta para o estoque do produto)
export const estornarVenda = (req, res) => {
  if (req.usuarioLogado.nivel !== "admin")
    return res
      .status(403)
      .json({ error: "Apenas administradores podem estornar vendas!" });
  const { id } = req.params;

  db.query(
    "SELECT produto_id, quantidade FROM vendas WHERE id = ?",
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (rows.length === 0)
        return res.status(404).json({ error: "Venda não encontrada" });

      const { produto_id, quantidade } = rows[0];

      db.beginTransaction((tErr) => {
        if (tErr) return res.status(500).json({ error: tErr.message });

        // Devolve a quantidade ao estoque do produto
        db.query(
          "UPDATE produtos SET estoque = estoque + ? WHERE id = ?",
          [quantidade, produto_id],
          (eErr) => {
            if (eErr)
              return db.rollback(() =>
                res.status(500).json({ error: eErr.message }),
              );

            // Deleta a venda
            db.query("DELETE FROM vendas WHERE id = ?", [id], (dErr) => {
              if (dErr)
                return db.rollback(() =>
                  res.status(500).json({ error: dErr.message }),
                );

              db.commit((cErr) => {
                if (cErr)
                  return db.rollback(() =>
                    res.status(500).json({ error: cErr.message }),
                  );

                res.json({ mensagem: "Venda cancelada e estoque estornado!" });
              });
            });
          },
        );
      });
    },
  );
};
