const CardFaturamentoAcumulado = ({ GerenciaisFaturamento }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-5 rounded-xl shadow-sm border-l-4 border-emerald-500">
      <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
        📈 Faturamento Acumulado
      </div>
      <div className="text-2xl font-bold text-slate-800 mt-1">
        R$ {GerenciaisFaturamento.faturamento.toFixed(2)}
      </div>
    </div>
  );
};

export default CardFaturamentoAcumulado;
