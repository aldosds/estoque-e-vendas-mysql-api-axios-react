const CardUnidadesVendidas = ({ GerenciaisItens }) => {
  return (
    <div>
      <div>🛍️ Total de Unidades Vendidas</div>
      <div>{GerenciaisItens.itens} un</div>
    </div>
  );
};

export default CardUnidadesVendidas;
