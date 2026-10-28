import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// 🚀 REGISTRO OBRIGATÓRIO: O Chart.js exige registrar os módulos que serão desenhados na tela
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const GraficoEstoque = ({ listaProdutos }) => {
  // Convertendo o array de objetos em arrays simples para o gráfico
  const nomes = listaProdutos.map((p) => p.nome);
  const estoques = listaProdutos.map((p) => p.estoque);
  const precos = listaProdutos.map((p) => p.preco);

  // Configuração dos conjuntos de dados (As Torres)
  const data = {
    labels: nomes, // Eixo X: Nome de cada produto
    datasets: [
      {
        label: "Quantidade em Estoque (Unidades)",
        data: estoques,
        backgroundColor: "rgba(16, 185, 129, 0.75)", // Verde Emerald Tailwind
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
        yAxisID: "y", // Vinculado ao eixo da esquerda
      },
      {
        label: "Preço Comercial (R$)",
        data: precos,
        backgroundColor: "rgba(59, 130, 246, 0.75)", // Azul Blue Tailwind
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
        yAxisID: "y1", // Vinculado ao eixo da direita
      },
    ],
  };

  // Configurações avançadas de comportamento e escalas responsivas
  const options = {
    responsive: true,
    maintainAspectRatio: false, // 🚀 Essencial: O gráfico preenche a div controlada pelo Tailwind
    plugins: {
      legend: {
        position: "top",
        labels: { font: { weight: "bold" }, color: "#475569" },
      },
    },

    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Quantidade (un)",
          color: "#10b981",
          font: { weight: "bold" },
        },
        grid: { color: "#f1f5f9" },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Preço (R$)",
          color: "#3b82f6",
          font: { weight: "bold" },
        },
        grid: { drawOnChartArea: false }, // Impede as linhas de cruzarem com o outro eixo
      },
    },
  };
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 w-full h-[350px] md:h-[400px]">
      <h3 className="text-slate-700 font-bold text-base mb-4 flex items-center gap-2">
        📊 Visão Geral do Estoque e Preços
      </h3>
      <div className="w-full h-[280px] md:h-[320px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default GraficoEstoque;
