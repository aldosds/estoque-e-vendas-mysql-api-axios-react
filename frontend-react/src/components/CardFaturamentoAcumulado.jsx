const CardFaturamentoAcumulado = ({ GerenciaisFaturamento }) => {
  return (
    <div>
      <div>📈 Faturamento Acumulado</div>
      <div>R$ {GerenciaisFaturamento.faturamento.toFixed(2)}</div>
    </div>
  );
};

export default CardFaturamentoAcumulado;
