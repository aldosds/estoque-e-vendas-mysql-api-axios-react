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
    <div>
      <h3>
        {produtoEmEdicao
          ? "📝 Editar Produto Existente"
          : "➕ Cadastrar Novo Produto"}
      </h3>

      <form onSubmit={lidarComSubmissao}>
        {/* Campo: Nome do Produto */}
        <div>
          <label>Nome do Produto</label>
          <input
            type="text"
            required
            placeholder="Ex: Headset Gamer"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        {/* Campo: Categoria */}
        <div>
          <label>Categoria</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="Periferico">Periferico</option>
            <option value="Video">Video</option>
          </select>
        </div>

        {/* Campo: Preço */}
        <div>
          <label>Preço (R$)</label>
          <input
            type="number"
            required
            step="0.01"
            min="0"
            placeholder="0.00"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
          />
        </div>

        {/* Campo: Estoque Inicial */}
        <div>
          <label>Estoque Inicial</label>
          <input
            type="number"
            required
            min="0"
            placeholder="0"
            value={estoque}
            onChange={(e) => setEstoque(e.target.value)}
          />
        </div>

        {/* Botões de Ação */}
        <div>
          {produtoEmEdicao && (
            <button type="button" onClick={onCancelar}>
              Cancelar
            </button>
          )}
          <button type="submit">
            {produtoEmEdicao ? "Salvar Alterações" : "Adicionar Produto"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormProduto;
