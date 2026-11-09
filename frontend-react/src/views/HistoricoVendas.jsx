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

  return (
    <div>
      {/* Cards de Métricas Consolidadas via .reduce */}
      <div>
        <CardFaturamentoAcumulado GerenciaisFaturamento={0} />
        <CardUnidadesVendidas GerenciaisItens={0} />
      </div>
    </div>
  );
};

export default HistoricoVendas;
