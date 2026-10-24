import { useMemo } from "react";

const CardDestaque = ({ listaProdutos }) => {
  // O useMemo evita recalcular o produto mais caro se o usuário apenas usar a busca
  const produtoMaisCaro = useMemo(() => {
    return listaProdutos.reduce((maior, atual) => {
      const precoAtual = Number(atual.preco);
      const precoMaior = maior ? Number(maior.preco) : 0;
      return precoAtual > precoMaior ? atual : maior;
    }, null);
  }, [listaProdutos]);

  return (
    <div>
      <div>⭐ Produto de Maior Valor</div>
      <div>
        {produtoMaisCaro
          ? `${produtoMaisCaro.nome} - R$ ${Number(produtoMaisCaro.preco).toFixed(2)}`
          : "Nenhum produto em estoque"}
      </div>
    </div>
  );
};

export default CardDestaque;
