import { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";

import api from "../services/api";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import CardFaturamentoAcumulado from "../components/CardFaturamentoAcumulado";
import CardUnidadesVendidas from "../components/CardUnidadesVendidas";

// 🚀 REGISTRO OBRIGATÓRIO: Ativa os arcos de pizza e legendas no Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const HistoricoVendas = () => {
  const { usuario } = useContext(AuthContext);

  // Estados locais para auditoria
  const [vendas, setVendas] = useState([]);
  const [termoBusca, setTermoBusca] = useState("");

  // Busca o histórico de transações relativas do MySQL (Com INNER JOIN do Back)
  async function carregarHistorico() {
    try {
      const resposta = await api.get("/vendas");
      setVendas(resposta.data);
    } catch (error) {
      console.error("Erro ao carregar histórico de vendas:", error);
    }
  }

  useEffect(() => {
    carregarHistorico();
  }, []);

  // 🔍 FILTRO: Filtra o histórico de vendas pelo nome do produto digitado
  const vendasFiltradas = useMemo(() => {
    const termoClean = termoBusca.toLowerCase().trim();
    return vendas.filter((v) =>
      v.produto_nome.toLowerCase().includes(termoClean),
    );
  }, [termoBusca, vendas]);

  // 📊 MÁGICA DO .REDUCE: Soma faturamento total e itens acumulados da lista visível
  const metricasGerenciais = useMemo(() => {
    return vendasFiltradas.reduce(
      (acc, v) => {
        acc.faturamento += Number(v.valor_total);
        acc.itens += v.quantidade;
        return acc;
      },
      { faturamento: 0, itens: 0 },
    );
  }, [vendasFiltradas]);

  return (
    <div className="flex flex-col gap-6">
      {/* Cards de Métricas Consolidadas via .reduce */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CardFaturamentoAcumulado GerenciaisFaturamento={metricasGerenciais} />
        <CardUnidadesVendidas GerenciaisItens={metricasGerenciais} />
      </div>
    </div>
  );
};

export default HistoricoVendas;
