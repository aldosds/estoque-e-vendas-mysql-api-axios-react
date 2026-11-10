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
    <div className="flex flex-col gap-2">
      <h3 className="text-slate-700 font-bold text-lg">
        Histórico de Movimentações
      </h3>
      <div className="w-full overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
        <table className="w-full border-collapse text-left text-sm text-slate-600 min-width-[600px]">
          <thead>
            <tr className="bg-emerald-800 text-emerald-50 text-xs uppercase font-semibold">
              <th className="p-4">ID Venda</th>
              <th className="p-4">Produto</th>
              <th className="p-4">Qtd</th>
              <th className="p-4">Preço Unitário</th>
              <th className="p-4">Data / Hora</th>
              {usuario?.nivel === "admin" && (
                <th className="p-4 text-center">Ações</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vendasFiltradas.map(
              ({
                id,
                produto_nome,
                quantidade,
                preco_unitario,
                data_venda,
              }) => (
                <tr
                  key={id}
                  className="hover:bg-slate-200 transition duration-150"
                >
                  <td className="p-4 font-mono text-xs text-slate-400">
                    #{id}
                  </td>
                  <td className="p-4 font-semibold text-slate-800">
                    {produto_nome}
                  </td>
                  <td className="p-4 text-slate-600 font-medium">
                    {quantidade} un
                  </td>
                  <td className="p-4 font-semibold text-slate-700">
                    R$ {Number(preco_unitario).toFixed(2)}
                  </td>
                  <td className="p-4 text-xs text-slate-700">
                    {new Date(data_venda).toLocaleString("pt-BR")}
                  </td>

                  {/* 🔒 Proteção visual: apenas Admins visualizam o botão de Estorno */}
                  {usuario?.nivel === "admin" && (
                    <td className="p-4 text-center">
                      <button
                        onClick={() => lidarComEstorno(id)}
                        className="bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        Estornar Venda
                      </button>
                    </td>
                  )}
                </tr>
              ),
            )}
            {vendasFiltradas.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="p-8 text-center font-medium text-slate-400"
                >
                  Nenhum registro encontrado no histórico.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TabelaVendas;
