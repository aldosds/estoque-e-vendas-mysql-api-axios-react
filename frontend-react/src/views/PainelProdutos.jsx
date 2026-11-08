import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import CardDestaque from "../components/CardDestaque";
import TabelaProdutos from "../components/TabelaProdutos";
import FormProduto from "../components/FormProduto";
import GraficoEstoque from "../components/GraficoEstoque";

const PainelProdutos = () => {
  const { usuario } = useContext(AuthContext);

  // Estados para gerenciar dados do MySQL e filtros
  const [produtos, setProdutos] = useState([]);
  const [termoBusca, setTermoBusca] = useState("");
  const [produtoParaEditar, setProdutoParaEditar] = useState("");

  const formularioRef = useRef(null);

  function prepararEdicaoComRolagem(produto) {
    setProdutoParaEditar(produto); // Ativa o formulário no modo edição

    // Faz a tela rolar de forma suave (smooth) até a div do formulário
    if (formularioRef.current) {
      formularioRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

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

  // ➕ OPERAÇÃO HÍBRIDA: Cadastrar (POST) ou Atualizar (PUT) no MySQL
  async function lidarComSalvarProduto(dadosObjeto) {
    // Validação preventiva local de nome duplicado (.some())
    const duplicado = produtos.some(
      (p) =>
        p.nome.toLowerCase() === dadosObjeto.nome.toLowerCase() &&
        p.id !== produtoParaEditar?.id,
    );

    if (duplicado) {
      alert("⚠️ Erro: Já existe um produto cadastrado com este nome!");
      return;
    }

    try {
      if (produtoParaEditar) {
        // MODO PUT (Edição)
        await api.put(`/produtos/${produtoParaEditar.id}`, dadosObjeto);
        alert("Produto atualizado com sucesso no MySQL!");
        setProdutoParaEditar(null); // Reseta modo edição
        carregarProdutos();
      } else {
        // MODO POST (Cadastro)
        await api.post("/produtos", dadosObjeto);
        alert("Novo produto adicionado com sucesso!");
        carregarProdutos();
      }
    } catch (error) {
      alert(error.response?.data?.error || "Falha ao salvar produto.");
    }
  }

  // 🗑️ OPERAÇÃO: Excluir Produto (DELETE) com transação segura no banco
  async function lidarComExcluirProduto(idAlvo) {
    if (
      confirm(
        "Tem certeza que deseja deletar este produto permanentemente do MySQL?",
      )
    ) {
      try {
        await api.delete(`/produtos/${idAlvo}`);
        alert("Produto removido com sucesso!");
        carregarProdutos();
      } catch (error) {
        alert(error.response?.data?.error || "Erro ao remover produto.");
      }
    }
  }

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
      <div className="max-w-6xl m-0 mx-auto flex flex-col gap-6">
        {/* 🔒 EXIBIÇÃO CONDICIONAL DO FORMULÁRIO: Apenas para Administradores */}
        {usuario?.nivel === "admin" && (
          <div ref={formularioRef} className="scroll-mt-6">
            <FormProduto
              produtoEmEdicao={produtoParaEditar}
              onSalvar={lidarComSalvarProduto}
              onCancelar={() => setProdutoParaEditar(null)}
            />
          </div>
        )}

        {/* Linha de Cards Dinâmicos */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <CardDestaque listaProdutos={produtos} />
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 w-full md:max-w-md">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              📊 Patrimônio Listado
            </div>
            <div className="text-lg font-bold text-slate-800 mt-1">
              R$ {patrimonioListado.toFixed(2)}
            </div>
          </div>
        </div>

        {/* 🚀 GRÁFICO INJETADO: Passando a lista filtrada reativamente */}
        <GraficoEstoque listaProdutos={produtosFiltrados} />

        {/* Input de Filtro / Busca */}
        <div className="w-full flex flex-col gap-2">
          <h3 className="text-slate-700 font-bold text-lg">Buscar Produtos</h3>
          <input
            type="text"
            placeholder="🔍 Digite para buscar e filtrar produtos em tempo real..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full p-4 border border-slate-200 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-700 font-medium"
          />
        </div>

        {/* Tabela de Dados */}
        <div className="flex flex-col gap-2">
          <h3 className="text-slate-700 font-bold text-lg">
            Registros Gerais de Estoque
          </h3>
          <TabelaProdutos
            listaProdutos={produtosFiltrados}
            onVender={lidarComVenda}
            usuarioNivel={usuario?.nivel}
            onPrepararEditar={prepararEdicaoComRolagem}
            onExcluir={lidarComExcluirProduto}
          />
        </div>
      </div>
    </div>
  );
};

export default PainelProdutos;
