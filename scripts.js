// URL da API fictícia que você criará no Node.js
const API_URL = "http://localhost:3000/api/produtos";
let produtos = [];

// Carrega os dados do banco de dados (API) assim que abre a página
async function carregarProdutos() {
  try {
    if (produtos.length === 0 && !window.inicializado) {
      produtos = [
        {
          id: 1,
          nome: "Teclado Mecânico",
          preco: 150,
          categoria: "Periferico",
          estoque: 3,
        },
        {
          id: 2,
          nome: "Mouse Gamer",
          preco: 80,
          categoria: "Periferico",
          estoque: 5,
        },
      ];
      window.inicializado = true;
    }
    atualizarPainel();
  } catch (error) {
    console.error("Erro ao buscar dados do MySQL:", error);
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
  console.log(valorTotalPatrimonio);

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

atualizarPainel();
carregarProdutos();
