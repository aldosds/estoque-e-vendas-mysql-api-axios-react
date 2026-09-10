// 1. Dados em memória
let produtos = [
  {
    id: 1,
    nome: "Teclado Mecânico",
    categoria: "Periferico",
    preco: 150,
    estoque: 3,
  },
  {
    id: 2,
    nome: "Mouse Gamer",
    categoria: "Periferico",
    preco: 80,
    estoque: 5,
  },
  { id: 3, nome: "Monitor 24'", categoria: "Video", preco: 900, estoque: 2 },
  {
    id: 4,
    nome: "Headset USB",
    categoria: "Periferico",
    preco: 220,
    estoque: 0,
  },
  {
    id: 5,
    nome: "Placa de Vídeo",
    categoria: "Video",
    preco: 2500,
    estoque: 5,
  },
];

let proximoId = 6; //Controla o auto-incremento do ID

// 2. Função de Renderização e Atualização da Interface
function renderizarTabela() {
  // 1: .find() para localizar um item específico
  const produtoCaro = produtos.find((p) => p.preco > 1000);
  const cardPremium = document.getElementById("card-premium-conteudo");

  if (produtoCaro) {
    cardPremium.innerText = `${produtoCaro.nome} - R$ ${produtoCaro.preco.toFixed(2)}`;
  } else {
    cardPremium.innerText = "Nenhum acima de R$ 500";
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
  renderizarTabela();
}

// 6: Captura de Formulários (Adicionar Novos Elementos)
const formulario = document.getElementById("form-produto");

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  // Captura os valores digitados nos inputs HTML
  const nomeDigitado = document.getElementById("nome").value;
  const categoriaSelecionada = document.getElementById("categoria").value;
  const precoDigitado = parseFloat(document.getElementById("preco").value);
  const estoqueDigitado = parseInt(document.getElementById("estoque").value);
  console.log(estoqueDigitado);

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

  renderizarTabela(); // Redesenha a tela exibindo o novo produto e novos totais!
});

renderizarTabela();
