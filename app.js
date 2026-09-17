// Busca a lista de produtos atualizada direto do banco de dados (MySQL)
const API_URL = "http://localhost:3000/api/produtos";
let produtos = [];

// Carrega os dados do banco de dados (API) assim que abre a página
async function carregarProdutos() {
  try {
    const resposta = await fetch(API_URL);

    if (!resposta.ok) throw new Error("Erro ao buscar dados do servidor.");

    // Alimenta nossa variável global com o array de objetos vindo do MySQL
    produtos = await resposta.json();

    atualizarPainel();
  } catch (error) {
    console.error("Erro ao buscar dados do MySQL:", error);
    alert("Não foi possível carregar os produtos do banco de dados.");
  }
}

// Função de Renderização e Atualização da Interface
function atualizarPainel() {
  // Ele compara o preço de todos os itens e sempre escolhe o maior, não importa a ordem de cadastro
  const produtoMaisCaro = produtos.reduce((maior, atual) => {
    return atual.preco > (maior?.preco || 0) ? atual : maior;
  }, null);

  // .reduce() para somar acumulados dinamicamente
  const valorTotalPatrimonio = produtos.reduce(
    (acumulador, p) => acumulador + p.preco * p.estoque,
    0,
  );

  const cardPremium = document.getElementById("card-premium-conteudo");

  if (produtoMaisCaro) {
    cardPremium.innerText = `${produtoMaisCaro.nome} - R$ ${produtoMaisCaro.preco.toFixed(2)}`;
  } else {
    cardPremium.innerText = "Nenhum produto cadastrado";
  }

  // .filter() para isolar categorias
  const listaPerifericos = produtos.filter((p) => p.categoria === "Periferico");
  document.getElementById("card-filtro-conteudo").innerText =
    `${listaPerifericos.length} Produto(s)`;

  // Renderização da tabela com .map e Desestruturação
  const tbody = document.getElementById("linhas-produtos");
  tbody.innerHTML = produtos
    .map(
      ({ id, nome, categoria, preco, estoque }) => `
      <tr>
        <td>${id}</td>
        <td><strong>${nome}</strong></td>
        <td>${categoria}</td>
        <td>R$ ${preco.toFixed(2)}</td>
        <td>${estoque <= 0 ? `<span class="badge-esgotado">Esgotado</span>` : estoque}</td>
        <td>
          <button class="btn-vender" ${estoque <= 0 ? "disabled" : ""} onclick="venderProduto(${id})">
            ${estoque <= 0 ? "Acabou" : "Vender"}
          </button>
          <button class="btn-editar" onclick="prepararEdicao(${id})">Editar</button>
          <button class="btn-excluir" ${estoque > 0 ? "disabled" : ""} onclick="excluirProduto(${id})">
            ${estoque <= 0 ? "Excluir" : "Inativo"}
          </button>
        </td>
      </tr>
    `,
    )
    .join("");

  // Injeta a linha final do rodapé calculada pelo .reduce()
  tbody.innerHTML += `
      <tr class="total-row">
        <td colspan="3" style="text-align: right;">Patrimônio Total em Estoque:</td>
        <td colspan="3">R$ ${valorTotalPatrimonio.toFixed(2)}</td>
      </tr>
    `;
}

// OPERADOR REST (...) para Alteração Imutável
function venderProduto(idAlvo) {
  produtos = produtos.map((p) =>
    p.id === idAlvo ? { ...p, estoque: p.estoque - 1 } : p,
  );
  atualizarPainel();
}

// OPERAÇÃO: Preparar Edição (Usa .find() para achar o item e preencher o formulário)
function prepararEdicao(idAlvo) {
  const produto = produtos.find((p) => p.id === idAlvo);
  if (!produto) return;

  document.getElementById("produto-id").value = produto.id;
  document.getElementById("nome").value = produto.nome;
  document.getElementById("categoria").value = produto.categoria;
  document.getElementById("preco").value = produto.preco;
  document.getElementById("estoque").value = produto.estoque;

  document.getElementById("titulo-form").innerText = "Editar Produto";
  document.getElementById("btn-submit").innerText = "Salvar Alterações";
  document.getElementById("btn-cancelar").style.display = "inline-block";
}

function cancelarEdicao() {
  document.getElementById("form-produto").reset();
  document.getElementById("produto-id").value = "";
  document.getElementById("titulo-form").innerText = "Cadastrar Novo Produto";
  document.getElementById("btn-submit").innerText = "Adicionar Produto";
  document.getElementById("btn-cancelar").style.display = "none";
}

// Envio do formulário: Salvar Novo (POST) ou Atualizar Existente (PUT) no MySQL
document
  .getElementById("form-produto")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("produto-id").value;
    const nome = document.getElementById("nome").value.trim();
    const categoria = document.getElementById("categoria").value;
    const preco = parseFloat(document.getElementById("preco").value);
    const estoque = parseInt(document.getElementById("estoque").value);

    // Validação preventiva de nome duplicado na memória local atual do painel
    const duplicado = produtos.some(
      (p) => p.nome.toLowerCase() === nome.toLowerCase() && p.id !== Number(id),
    );

    if (duplicado) {
      alert("Esse nome de produto já existe!");
      return;
    }

    // Prepara o objeto com os dados para enviar ao Back-end (Sem o ID, que o banco gera sozinho no cadastro)
    const dadosProduto = { nome, categoria, preco, estoque };

    try {
      if (id) {
        // MODO EDIÇÃO: Atualiza um registro existente (Rota PUT)
        const resposta = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json", // Avisa o Node que estamos enviando um JSON
          },
        });

        if (!resposta.ok) throw new Error("Erro ao atualizar produto.");

        alert("Produto atualizado com sucesso!");

        cancelarEdicao(); // Limpa os campos e reseta o título do formulário
      } else {
        // MODO CADASTRO: Cria um novo registro (Rota POST)
        const resposta = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosProduto),
        });

        if (!resposta.ok) throw new Error("Erro ao cadastrar produto.");

        alert("Produto cadastrado com sucesso no MySQL!");
        document.getElementById("form-produto").reset();
      }

      // Solicita ao servidor a lista renovada de produtos para atualizar a tabela na tela
      carregarProdutos();
    } catch (error) {
      console.error("Erro na operação de salvamento:", error);
      alert("Falha na comunicação com o servidor. O registro não foi salvo.");
    }
  });

// OPERAÇÃO: Excluir Produto (Usa .filter() para remover da lista)
async function excluirProduto(idAlvo) {
  if (confirm("Tem certeza que deseja excluir este produto?")) {
    try {
      // Faz a chamada para a rota DELETE do servidor Node.js
      const resposta = await fetch(`${API_URL}/${idAlvo}`, {
        method: "DELETE",
      });

      if (!resposta.ok) {
        throw new Error("Não foi possível excluir o produto no servidor.");
      }

      // Após deletar no banco com sucesso, recarrega a lista atualizada
      alert("Produto excluído com sucesso do banco de dados!");
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert("Erro ao excluir o produto. Verifique se o servidor está rodando.");
    }
  }
}

carregarProdutos();
