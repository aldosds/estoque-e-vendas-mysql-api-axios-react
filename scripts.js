// URL da API fictícia que você criará no Node.js
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
