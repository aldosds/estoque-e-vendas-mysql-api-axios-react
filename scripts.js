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
  console.log(cardPremium);

  const tbody = document.getElementById("linhas-produtos");

  const arrayDeLinhas = produtos.map(({ id, nome, preco, estoque }) => {
    const ativo = estoque > 0;

    return `
        <tr>
            <td>${id}</td>
            <td><strong>${nome}</strong></td>
            <td>R$ ${preco.toFixed(2)}</td>
            <td>${ativo ? estoque : `<span class="sem-estoque">Esgotado</span>`}</td>
            <td>${ativo ? "✅ Ativo" : "⚠️ Inativo"}</td>
            <td>
                <button class="btn-vender" ${!ativo ? "disabled" : ""} onclick="venderProduto(${id})">
                    ${ativo ? "Vender (-1)" : "Sem Estoque"}
                </button>
            </td>
        </tr>
        `;
  });

  const valorTotalEstoque = produtos.reduce(
    (acc, p) => acc + p.preco * p.estoque,
    0,
  );

  let htmlFinal = arrayDeLinhas.join("");

  htmlFinal += `
        <tr class="total-row">
            <td colspan="2" style="text-align: right">Total:</td>
            <td colspan="4">R$ ${valorTotalEstoque.toFixed(2)}</td>
        </tr>
      `;

  tbody.innerHTML = htmlFinal;
}

function venderProduto(idDoProduto) {
  produtos = produtos.map((produto) => {
    if (produto.id === idDoProduto) {
      const { estoque, ...resto } = produto;

      return {
        ...resto,
        estoque: estoque - 1,
      };
    }
    return produto;
  });
  renderizarTabela();
}

renderizarTabela();
