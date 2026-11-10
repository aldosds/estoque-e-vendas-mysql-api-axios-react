import { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";

import api from "../services/api";

import CardFaturamentoAcumulado from "../components/CardFaturamentoAcumulado";
import CardUnidadesVendidas from "../components/CardUnidadesVendidas";
import GraficoVendas from "../components/GraficoVendas";
import TabelaVendas from "../components/TabelaVendas";

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
      {/* Gráfico de Pizza (Setores) em Tailwind */}
      <GraficoVendas vendasFiltradas={vendasFiltradas} />

      {/* Cards de Métricas Consolidadas via .reduce */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CardFaturamentoAcumulado GerenciaisFaturamento={metricasGerenciais} />
        <CardUnidadesVendidas GerenciaisItens={metricasGerenciais} />
      </div>

      {/* Input de Filtro por Digitação */}
      <input
        type="text"
        placeholder="🔍 Filtrar histórico por nome do produto..."
        value={termoBusca}
        onChange={(e) => setTermoBusca(e.target.value)}
        className="w-full p-4 border border-slate-200 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-700 font-medium"
      />

      {/* Tabela de Auditoria do MySQL */}
      <TabelaVendas
        vendasFiltradas={vendasFiltradas}
        usuario={usuario}
        carregarHistorico={carregarHistorico}
      />
    </div>
  );
};

export default HistoricoVendas;
