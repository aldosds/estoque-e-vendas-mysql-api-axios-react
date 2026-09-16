// 1. URL da API fictícia que você criará no Node.js
const API_URL = "http://localhost:3000/api/produtos";
let produtos = [];

// Carrega os dados do banco de dados (API) assim que abre a página
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

// 2. Função de Renderização e Atualização da Interface
function atualizarPainel() {
  // 1: .find() para localizar um item específico
  const produtoCaro = produtos.find((p) => p.preco > 1000);
  const cardPremium = document.getElementById("card-premium-conteudo");

  if (produtoCaro) {
    cardPremium.innerText = `${produtoCaro.nome} - R$ ${produtoCaro.preco.toFixed(2)}`;
  } else {
    cardPremium.innerText = "Nenhum acima de R$ 1000";
  }

  // 2: .filter() para isolar categorias
  const listaPerifericos = produtos.filter((p) => p.categoria === "Periferico");
  document.getElementById("card-filtro-conteudo").innerText =
    `${listaPerifericos.length} Produto(s)`;

  // 3: .reduce() para somar acumulados dinamicamente
  const valorTotalPatrimonio = produtos.reduce(
    (acumulador, p) => acumulador + p.preco * p.estoque,
    0,
  );

  // 4: .map() + DESESTRUTURAÇÃO DE OBJETOS para criar a tabela HTML
  const tbody = document.getElementById("linhas-produtos");

  const arrayDeLinhasHTML = produtos.map(
    ({ id, nome, categoria, preco, estoque }) => {
      const temEstoque = estoque > 0;

      return `
        <tr>
            <td>${id}</td>
            <td><strong>${nome}</strong></td>
            <td>R$ ${preco.toFixed(2)}</td>
            <td>${categoria}</td>
            <td>${temEstoque ? estoque : `<span class="badge-esgotado">Esgotado</span>`}</td>            
            <td>
                <button class="btn-vender" ${!temEstoque ? "disabled" : ""} onclick="executarVenda(${id})">
                    ${temEstoque ? "Vender (-1)" : "Indisponível"}
                </button>
            </td>
        </tr>
        `;
    },
  );

  let htmlFinal = arrayDeLinhasHTML.join("");

  htmlFinal += `
        <tr class="total-row">
            <td colspan="2" style="text-align: right">Patrimônio Total em Estoque:</td>
            <td colspan="4">R$ ${valorTotalPatrimonio.toFixed(2)}</td>
        </tr>
      `;

  tbody.innerHTML = htmlFinal;
}

// 5: DESESTRUTURAÇÃO + OPERADOR REST (...) para Alteração Imutável
function executarVenda(idAlvo) {
  produtos = produtos.map((item) => {
    if (item.id === idAlvo) {
      const { estoque, ...propriedadesIntactas } = item;

      return {
        ...propriedadesIntactas,
        estoque: estoque - 1,
      };
    }
    return item;
  });
  atualizarPainel();
}

// 6: Captura de Formulários (Adicionar Novos Elementos com Validação)
const formulario = document.getElementById("form-produto");

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault(); // Impede a página de recarregar

  // Captura o valor digitado tirando os espaços extras nas pontas (.trim())
  const nomeDigitado = document.getElementById("nome").value.trim();
  const categoriaSelecionada = document.getElementById("categoria").value;
  const precoDigitado = parseFloat(document.getElementById("preco").value);
  const estoqueDigitado = parseInt(document.getElementById("estoque").value);

  // VALIDAÇÃO DE DUPLICIDADE
  // O .some() verifica se já existe algum produto com o mesmo nome
  // Usamos .toLowerCase() para que "Teclado" e "teclado" sejam considerados iguais (Case Insensitive)
  const produtoJaExiste = produtos.some(
    (p) => p.nome.toLowerCase() === nomeDigitado.toLowerCase(),
  );
  console.log(produtoJaExiste);

  if (produtoJaExiste) {
    alert(
      `⚠️ Erro: Já existe um produto cadastrado com o nome ${nomeDigitado}!`,
    );
    return;
  }

  // Cria um novo objeto formatado exatamente igual aos outros da lista
  const novoProduto = {
    id: proximoId,
    nome: nomeDigitado,
    categoria: categoriaSelecionada,
    preco: precoDigitado,
    estoque: estoqueDigitado,
  };

  // Adiciona o novo produto ao nosso array principal
  produtos.push(novoProduto);

  proximoId++; // Incrementa o ID para o próximo cadastro não duplicar

  formulario.reset(); // Limpa todos os campos do formulário na tela

  atualizarPainel(); // Redesenha a tela exibindo o novo produto e novos totais!
});

atualizarPainel();
