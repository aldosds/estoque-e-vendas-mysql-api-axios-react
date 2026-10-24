const TabelaProdutos = ({ listaProdutos, onVender, usuarioNivel }) => {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome do Produto</th>
            <th>Categoria</th>
            <th>Preço Un.</th>
            <th>Estoque</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {listaProdutos.map(({ id, nome, categoria, preco, estoque }) => {
            const temEstoque = estoque > 0;
            return (
              <tr>
                <td>#{id}</td>
                <td>{nome}</td>
                <td>{categoria}</td>
                <td>R$ {Number(preco).toFixed(2)}</td>
                <td>
                  {temEstoque ? <span>{estoque}</span> : <span>Esgotado</span>}
                </td>
                <td>
                  <div>
                    <button onClick={() => onVender(id)} disabled={!temEstoque}>
                      Vender (-1)
                    </button>
                    {usuarioNivel === "admin" && (
                      <>
                        <button>Editar</button>
                        <button>Excluir</button>
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
