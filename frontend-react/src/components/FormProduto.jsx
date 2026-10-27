import { useState, useEffect } from "react";

const FormProduto = ({ produtoEmEdicao, onSalvar, onCancelar }) => {
  // Estados locais para controlar as entradas de texto do formulário
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("Periferico");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");

  // 🚀 APRENDIZADO RECENTE: useEffect monitorando a variável 'produtoEmEdicao'
  // Sempre que o administrador clicar em 'Editar' na tabela, este Hook captura a mudança
  // e preenche os inputs automaticamente. Se for um novo cadastro, limpa os campos.
  useEffect(() => {
    if (produtoEmEdicao) {
      setNome(produtoEmEdicao.nome);
      setCategoria(produtoEmEdicao.categoria);
      setPreco(produtoEmEdicao.preco);
      setEstoque(produtoEmEdicao.estoque);
    } else {
      limparCampos();
    }
  }, [produtoEmEdicao]);

  function limparCampos() {
    setNome("");
    setCategoria("Periferico");
    setPreco("");
    setEstoque("");
  }

  function lidarComSubmissao(e) {
    e.preventDefault();

    // Estrutura o objeto com os dados limpos e validados
    const dadosProduto = {
      nome: nome.trim(),
      categoria,
      preco: parseFloat(preco),
      estoque: parseInt(estoque),
    };

    // Executa a função de salvamento herdada do componente Pai
    onSalvar(dadosProduto);
    limparCampos();
  }
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm  border border-slate-200 w-full transition duration-200">
      <h3 className="text-slate-800 font-bold text-lg mb-4">
        {produtoEmEdicao
          ? "📝 Editar Produto Existente"
          : "➕ Cadastrar Novo Produto"}
      </h3>

      <form
        onSubmit={lidarComSubmissao}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
      >
        {/* Campo: Nome do Produto */}
        <div className="flex flex-col gap-1 md:col-span-1">
          <label className="text-xs font-bold text-slate-500 uppercase">
            Nome do Produto
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Headset Gamer"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          />
        </div>

        {/* Campo: Categoria */}
        <div className="flex flex-col gap-1 md:col-span-1">
          <label className="text-xs font-bold text-slate-500 uppercase">
            Categoria
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="p-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="Periferico">Periferico</option>
            <option value="Video">Video</option>
          </select>
        </div>

        {/* Campo: Preço */}
        <div className="flex flex-col gap-1 md:col-span-1">
          <label className="text-xs font-bold text-slate-500 uppercase">
            Preço (R$)
          </label>
          <input
            type="number"
            required
            step="0.01"
            min="0"
            placeholder="0.00"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            className="p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          />
        </div>

        {/* Campo: Estoque Inicial */}
        <div className="flex flex-col gap-1 md:col-span-1">
          <label className="text-xs font-bold text-slate-500 uppercase">
            Estoque Inicial
          </label>
          <input
            type="number"
            required
            min="0"
            placeholder="0"
            value={estoque}
            onChange={(e) => setEstoque(e.target.value)}
            className="p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          />
        </div>

        {/* Botões de Ação */}
        <div className="md:col-span-4 flex justify-end gap-3 mt-2">
          {produtoEmEdicao && (
            <button
              type="button"
              onClick={onCancelar}
              className="bg-slate-500 hover:bg-slate-600 text-white font-bold text-sm px-5 py-3 rounded-lg shadow-sm transition cursor-pointer"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-lg shadow-sm transition cursor-pointer"
          >
            {produtoEmEdicao ? "Salvar Alterações" : "Adicionar Produto"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormProduto;
