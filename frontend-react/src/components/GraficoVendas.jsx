import { useMemo } from "react";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// 🚀 REGISTRO OBRIGATÓRIO: Ativa os arcos de pizza e legendas no Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const GraficoVendas = ({ vendasFiltradas }) => {
  // 🍕 MÁGICA DO .REDUCE AVANÇADO: Agrupa o faturamento por nome do produto para o Gráfico
  const dadosGraficoPizza = useMemo(() => {
    const agrupado = vendasFiltradas.reduce((acc, v) => {
      acc[v.produto_nome] = (acc[v.produto_nome] || 0) + Number(v.valor_total);
      return acc;
    }, {});

    // Extrai cirurgicamente as chaves (legendas) e valores (fatias) para o Chart.js
    return {
      labels: Object.keys(agrupado),
      datasets: [
        {
          laberl: "Faturamento Total (R$)",
          data: Object.values(agrupado),
          backgroundColor: [
            "rgba(16, 185, 129, 0.7)", // Verde Emerald
            "rgba(59, 130, 246, 0.7)", // Azul Blue
            "rgba(245, 158, 11, 0.7)", // Amarelo Amber
            "rgba(139, 92, 246, 0.7)", // Roxo Violet
            "rgba(239, 68, 68, 0.7)", // Vermelho Red
          ],
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    };
  }, [vendasFiltradas]);

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 w-full h-[350px] md:h-[400px] flex flex-col items-center">
      <h3 className="text-slate-700 font-bold text-base mb-2 w-full">
        🍰 Proporção de Faturamento por Produto
      </h3>
      <div className="w-full h-[280px] md:h-[320px] flex justify-center">
        {vendasFiltradas.length > 0 ? (
          <Pie
            data={dadosGraficoPizza}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        ) : (
          <p>Nenhuma venda registrada para gerar o gráfico.</p>
        )}
      </div>
    </div>
  );
};

export default GraficoVendas;
