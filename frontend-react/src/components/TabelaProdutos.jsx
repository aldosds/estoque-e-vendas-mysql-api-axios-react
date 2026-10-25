const TabelaProdutos = ({ listaProdutos, onVender, usuarioNivel }) => {
  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
      <table className="w-full border-collapse text-left text-sm text-slate-600 min-width-[600px]">
        <thead>
          <tr className="bg-slate-800 text-slate-200 text-xs uppercase font-semibold">
            <th className="p-4">ID</th>
            <th className="p-4">Nome do Produto</th>
            <th className="p-4">Categoria</th>
            <th className="p-4">Preço Un.</th>
            <th className="p-4">Estoque</th>
            <th className="p-4">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {listaProdutos.map(({ id, nome, categoria, preco, estoque }) => {
            const temEstoque = estoque > 0;
            return (
              <tr
                key={id}
                className="hover:bg-slate-200 transition duration-150"
              >
                <td className="p-4 font-mono text-xs text-slate-400 ">#{id}</td>
                <td className="p-4 font-semibold text-slate-800">{nome}</td>
                <td className="p-4 text-slate-500">{categoria}</td>
                <td className="p-4 text-slate-700">
                  R$ {Number(preco).toFixed(2)}
                </td>
                <td className="p-4">
                  {temEstoque ? (
                    <span className="font-semibold text-slate-800">
                      {estoque} un
                    </span>
                  ) : (
                    <span className="bg-red-200 text-red-700 px-2 py-1 rounded text-xs font-bold ">
                      Esgotado
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onVender(id)}
                      disabled={!temEstoque}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Vender (-1)
                    </button>
                    {usuarioNivel === "admin" && (
                      <>
                        <button className="bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition cursor-pointer">
                          Editar
                        </button>
                        <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition cursor-pointer">
                          Excluir
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TabelaProdutos;
