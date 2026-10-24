import { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const PainelProdutos = () => {
  const { usuario, logout } = useContext(AuthContext);

  // Estados para gerenciar dados do MySQL e filtros
  const [produtos, setProdutos] = useState([]);
  const [termoBusca, setTermoBusca] = useState("");

  // 🚀 Chamada inicial do Axios para puxar dados do banco de dados relacional
  async function carregarProdutos() {
    try {
      const resposta = await api.get("/produtos");
      setProdutos(resposta.data);
    } catch (error) {
      console.error("Erro ao sincronizar produtos com o MySQL: ", error);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  // 🔍 FILTRO DINÂMICO: .filter() + .includes() integrado aos inputs do Tailwind
  const produtosFiltrados = useMemo(() => {
    const termoClean = termoBusca.toLowerCase().trim();
    return produtos.filter((p) => p.nome.toLowerCase().includes(termoClean));
  }, [produtos, termoBusca]);

  // 📊 CALCULO GERENCIAL: .reduce() do patrimônio listado na tela
  const patrimonioListado = useMemo(() => {
    return produtosFiltrados.reduce(
      (acc, p) => acc + Number(p.preco) * p.estoque,
      0,
    );
  }, [produtosFiltrados]);

  // 💰 OPERAÇÃO DE VENDA RELACIONAL: POST para a tabela de vendas do MySQL
  async function lidarComVenda(idProduto) {
    const produtoAlvo = produtos.find((p) => p.id === idProduto);
    if (!produtoAlvo) return;

    try {
      await api.post("/vendas", {
        produto_id: idProduto,
        quantidade: 1,
        preco_unitario: produtoAlvo.preco,
      });
      // Sincroniza a tela puxando a lista renovada do MySQL após a baixa
      carregarProdutos();
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Falha ao processar movimentação financeira.",
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl margin-0 mx-auto flex flex-col gap-6">
        {/* Cabeçalho Superior */}
        <header
          className="bg-white p-4 rounded-xl shadow-sm border border-slate-200
flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full bg-slate-800 text-white flex
items-center justify-center font-bold text-lg"
            >
              {usuario?.nome?.charAt(0)}
            </div>
            <div>
              <p className="text-slate-500 text-xs">Acesso autenticado</p>
              <h2 className="text-slate-800 font-bold text-sm">
                Olá, {usuario?.nome}!
                <span
                  className={`ml-2 text-xs uppercase px-2 py-0.5 rounded-full
font-extrabold ${
                    usuario?.nivel === "admin"
                      ? "bg-amber-200 text-amber-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {usuario?.nivel}
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white
font-bold text-sm px-4 py-2 rounded-lg shadow-sm transition"
          >
            Encerrar Sessão 🚪
          </button>
        </header>
        <h1>PainelProdutos</h1>
      </div>
    </div>
  );
};

export default PainelProdutos;
