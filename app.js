// Configuração da URL base da API do servidor Node.js
const API_URL = "http://localhost:3000/api/produtos";

// Variável global que armazenará os produtos vindos do MySQL
let produtos = [];

// Guarda a instância do gráfico para podermos destruí-lo/recriá-lo ao atualizar dados
let meuGrafico = null;

// Carrega os dados do banco de dados (API) assim que abre a página
async function carregarProdutos() {
  try {
    const resposta = await fetch(API_URL);

    if (!resposta.ok) throw new Error("Erro ao buscar dados do servidor.");

    // Alimenta nossa variável global com o array de objetos (JSON) vindo do MySQL
    produtos = await resposta.json();

    // Atualiza toda a interface visual
    atualizarPainel();
  } catch (error) {
    console.error("Erro ao buscar dados do MySQL:", error);
    alert("Não foi possível carregar os produtos do banco de dados.");
  }
}

// Função de Renderização e Atualização da Interface (MÉTODOS DE ARRAY: REDUCE e MAP + DESESTRUTURAÇÃO)
function atualizarPainel(listaParaExibir = produtos) {
  // .reduce() para encontrar o produto mais caro dinamicamente
  // Ele compara o preço de todos os itens e sempre escolhe o maior, não importa a ordem de cadastro
  const produtoMaisCaro = produtos.reduce((maior, atual) => {
    // Convertemos os preços vindos do banco para números reais
    const precoAtual = Number(atual.preco);
    const precoMaior = maior ? Number(maior.preco) : 0;

    // Fazemos a comparação numérica correta
    return precoAtual > precoMaior ? atual : maior;
  }, null);

  // .reduce() para calcular o patrimônio total em estoque
  const valorTotalPatrimonio = listaParaExibir.reduce(
    (acumulador, p) => acumulador + p.preco * p.estoque,
    0,
  );

  const cardPremium = document.getElementById("card-premium-conteudo");

  if (cardPremium) {
    cardPremium.innerText = produtoMaisCaro
      ? `${produtoMaisCaro.nome} - R$ ${Number(produtoMaisCaro.preco).toFixed(2)}`
      : "Nenhum produto cadastrado";
  }

  // .filter() para isolar categorias
  const listaPerifericos = produtos.filter((p) => p.categoria === "Periferico");
  document.getElementById("card-filtro-conteudo").innerText =
    `${listaPerifericos.length} Produto(s)`;

  // Renderização da tabela com .map e Desestruturação
  const tbody = document.getElementById("linhas-produtos");
  if (!tbody) return;

  const arrayDeLinhasHTML = listaParaExibir.map(
    ({ id, nome, categoria, preco, estoque }) => {
      // const temEstoque = estoque > 0;
      const precoNumerico = Number(preco);
      return `
      <tr>
      <td>${id}</td>
        <td><strong>${nome}</strong></td>
        <td>${categoria}</td>
        <td>R$ ${precoNumerico.toFixed(2)}</td>
        <td>${estoque <= 0 ? `<span class="badge-esgotado">Esgotado</span>` : estoque}</td>
        <td>
        <button class="btn-vender" ${estoque <= 0 ? "disabled" : ""} onclick="executarVenda(${id})">
        ${estoque <= 0 ? "Acabou" : "Vender"}
          </button>
          <button class="btn-editar" onclick="prepararEdicao(${id})">Editar</button>
          <button class="btn-excluir" ${estoque > 0 ? "disabled" : ""} onclick="excluirProduto(${id})">
          ${estoque <= 0 ? "Excluir" : "Inativo"}
          </button>
          </td>
          </tr>
          `;
    },
  );
  let htmlFinal = arrayDeLinhasHTML.join("");

  // Injeta a linha final do rodapé calculada pelo .reduce()
  htmlFinal += `
    <tr class="total-row">
    <td colspan="3" style="text-align: right;">Patrimônio Total em Estoque:</td>
    <td colspan="3">R$ ${valorTotalPatrimonio.toFixed(2)}</td>
    </tr>
    `;

  tbody.innerHTML = htmlFinal;

  // Para atualizar o grasfico
  atualizarGrafico(listaParaExibir);
}

// EXECUTAR VENDA (MÉTODO PUT RAPIDO)
// OPERADOR REST (...) para Alteração Imutável
async function executarVenda(idAlvo, estoqueAtual) {
  const produto = produtos.find((p) => p.id === idAlvo);
  if (!produto) return;

  // Desestruturação + Rest para atualizar apenas o estoque imutavelmente antes do envio
  const { estoque, ...resto } = produto;
  const dadosAtualizados = { ...resto, estoque: estoque - 1 };

  try {
    const resposta = await fetch(`${API_URL}/${idAlvo}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosAtualizados),
    });
    if (!resposta.ok) throw new Error();
    carregarProdutos();
  } catch (erro) {
    alert("Erro ao processar venda.");
  }
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
          body: JSON.stringify(dadosProduto),
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
      alert("Falha na comunicação. O registro não foi salvo.");
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

      if (!resposta.ok) throw new Error("Erro ao excluir.");

      // Após deletar no banco com sucesso, recarrega a lista atualizada
      alert("Produto removido com sucesso!");
      carregarProdutos();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert("Erro ao excluir o produto.");
    }
  }
}

// O evento 'input' dispara a cada letra que o usuário digita ou apaga
document.getElementById("campo-busca").addEventListener("input", function (e) {
  const termoBuscado = e.target.value.toLowerCase().trim();

  // Usamos .filter() para filtrar os produtos com base no texto digitado
  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(termoBuscado),
  );

  // Redesenha a tabela exibindo apenas os produtos correspondentes
  atualizarPainel(produtosFiltrados);
});

// Atualizar Gráfico
function atualizarGrafico(dadosParaOGrafico = produtos) {
  // Se por acaso a biblioteca não carregar, evita travar a tabela inteira
  if (typeof Chart === "undefined") {
    console.warn("Aviso: A biblioteca Chart.js ainda não foi carregada.");
    alert("O Gráfico Dinamico não está podendo ser exibido.");
    return;
  }

  const ctx = document.getElementById("grafico-produtos").getContext("2d");

  // Destrói o gráfico anterior se ele já existir (evita sobreposição visual ao atualizar a tela)
  if (meuGrafico) {
    meuGrafico.destroy();
  }

  // APRENDIZADO APLICADO: Usamos .map() para extrair arrays simples contendo apenas o que o gráfico precisa
  const nomes = dadosParaOGrafico.map((p) => p.nome);
  const estoques = dadosParaOGrafico.map((p) => p.estoque);
  const precos = dadosParaOGrafico.map((p) => Number(p.preco));

  // Inicializa o Chart.js com as configurações de eixos e barras
  meuGrafico = new Chart(ctx, {
    type: "bar",
    data: {
      labels: nomes, // Eixo X: Nomes dos produtos
      datasets: [
        {
          label: "Quantidade em Estoque",
          data: estoques,
          backgroundColor: "rgba(40, 167, 69, 0.7)", // Verde
          borderColor: "rgb(40, 167, 69)",
          borderWidth: 1,
          yAxisID: "y", // Vincula ao eixo Y da esquerda
        },
        {
          label: "Preço (R$)",
          data: precos,
          backgroundColor: "rgba(0, 123, 255, 0.7)", // Azul
          borderColor: "rgb(0, 123, 255)",
          borderWidth: 1,
          yAxisID: "y1", // Vincula ao eixo Y da direita (escala monetária)
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          type: "linear",
          display: true,
          position: "left",
          title: { display: true, text: "Quantidade (Unidades)" },
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          title: { display: true, text: "Preço (R$)" },
          grid: { drawOnChartArea: false }, // Evita poluição de linhas cruzadas
        },
      },
    },
  });
}

carregarProdutos();
