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
    <div className="bg-gradient-to-r from-amber-50 to-yellow-100 p-5 rounded-xl shadow-sm border-l-4 border-amber-500 w-full md:max-w-md">
      <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
        ⭐ Produto de Maior Valor
      </div>
      <div className="text-lg font-bold text-slate-800 mt-1 truncate">
        {produtoMaisCaro
          ? `${produtoMaisCaro.nome} - R$ ${Number(produtoMaisCaro.preco).toFixed(2)}`
          : "Nenhum produto em estoque"}
      </div>
    </div>
  );
};

export default CardDestaque;
