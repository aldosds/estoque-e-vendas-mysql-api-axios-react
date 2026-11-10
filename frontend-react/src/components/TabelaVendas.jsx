import api from "../services/api";

const TabelaVendas = ({ vendasFiltradas, usuario, carregarHistorico }) => {
  // 🗑️ OPERAÇÃO: Cancelar venda e acionar o estorno de estoque automático no Node
  async function lidarComEstorno(idVenda) {
    if (
      confirm(
        "Deseja realmente cancelar esta venda? O saldo correspondente será devolvido ao estoque!",
      )
    ) {
      try {
        await api.delete(`/vendas/${idVenda}`);
        alert("Venda cancelada e mercadoria estornada com sucesso!");
        carregarHistorico(); // Atualiza a tabela após o estorno
      } catch (error) {
        alert(error.response?.data?.error || "Erro ao estornar transação.");
      }
    }
  }

  return (
    <div>
      <h3>Histórico de Movimentações</h3>
      <div>
        <table>
          <thead>
            <tr>
              <th>ID Venda</th>
              <th>Produto</th>
              <th>Qtd</th>
              <th>Preço Unitário</th>
              <th>Data / Hora</th>
              {usuario?.nivel === "admin" && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {vendasFiltradas.map(
              ({
                id,
                produto_nome,
                quantidade,
                preco_unitario,
                data_venda,
              }) => (
                <tr key={id}>
                  <td>{id}</td>
                  <td>{produto_nome}</td>
                  <td>{quantidade} un</td>
                  <td>R$ {Number(preco_unitario).toFixed(2)}</td>
                  <td>{new Date(data_venda).toLocaleString("pt-BR")}</td>

                  {/* 🔒 Proteção visual: apenas Admins visualizam o botão de Estorno */}
                  {usuario?.nivel === "admin" && (
                    <td>
                      <button onClick={() => lidarComEstorno(id)}>
                        Estornar Venda
                      </button>
                    </td>
                  )}
                </tr>
              ),
            )}
            {vendasFiltradas.length === 0 && (
              <tr>
                <td colSpan="6">Nenhum registro encontrado no histórico.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TabelaVendas;
