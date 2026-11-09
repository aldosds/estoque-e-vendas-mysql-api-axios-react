import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// 🚀 REGISTRO OBRIGATÓRIO: Ativa os arcos de pizza e legendas no Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const GraficoVendas = ({ vendasFiltradas }) => {
  return (
    <div>
      <h3>🍰 Proporção de Faturamento por Produto</h3>
      <div>
        {vendasFiltradas.length > 0 ? (
          "Deu certo"
        ) : (
          <p>Nenhuma venda registrada para gerar o gráfico.</p>
        )}
      </div>
    </div>
  );
};

export default GraficoVendas;
