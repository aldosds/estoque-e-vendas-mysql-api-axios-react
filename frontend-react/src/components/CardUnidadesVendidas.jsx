const CardUnidadesVendidas = ({ GerenciaisItens }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl shadow-sm border-l-4 border-blue-500">
      <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
        🛍️ Total de Unidades Vendidas
      </div>
      <div className="text-2xl font-bold text-slate-800 mt-1">
        {GerenciaisItens.itens} un
      </div>
    </div>
  );
};

export default CardUnidadesVendidas;
