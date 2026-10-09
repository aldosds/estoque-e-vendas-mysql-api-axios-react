// 🛡️ VERIFICAÇÃO DE SESSÃO LOCAL ATIVA
// Se o token não existir no navegador, impede a leitura do script e expulsa para a tela de login
if (!localStorage.getItem("token")) {
  window.location.href = "./login/login.html";
}

// Configuração da instância base do Axios
const api = axios.create({ baseURL: "http://localhost:3000/api" });

// 🔄 INTERCEPTOR DO AXIOS: Injeta o passaporte (Token) em 100% das chamadas HTTP automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Padrão de mercado para cabeçalhos JWT
    }
    return config;
  },
  (erro) => {
    return Promise.reject(erro);
  },
);

// 🔄 INTERCEPTOR DE RESPOSTA: Se o servidor rejeitar o token (ex expirou), desloga na hora
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (erro.response?.status === 401 || erro.response?.status === 403) {
      alert("Sua sessão expirou ou você não tem permissão!");
      localStorage.clear(); // Limpa as credenciais locais salvas
      window.location.href = "./login/login.html";
    }
    return Promise.reject(erro);
  },
);

// Adicione também uma lógica simples no carregarPainel para esconder botões se o nível for 'operador'
function aplicarPermissoesDeTela() {
  // 01 EXIBIÇÃO DE PERFIL
  // Captura os dados do usuário salvos no localStorage no momento do login
  const nomeUsuario = localStorage.getItem("usuario_nome");
  const nivelUsuario = localStorage.getItem("usuario_nivel");

  // 1. Injeta o nome do usuário na mensagem de boas-vindas
  const txtBoasVindas = document.getElementById("mensagem-boas-vindas");
  if (txtBoasVindas && nomeUsuario) {
    txtBoasVindas.innerHTML = `Olá, <strong>${nomeUsuario}</strong>! Bem-vindo ao sistema.`;
  }

  // 2. Injeta e estiliza uma etiqueta (badge) com o nível de acesso dele
  const txtBadge = document.getElementById("badge-nivel");
  if (txtBadge && nivelUsuario) {
    txtBadge.innerText = nivelUsuario;

    // Altera a cor da etiqueta baseada no cargo (Dica visual de UX!)
    if (nivelUsuario === "admin") {
      txtBadge.style.backgroundColor = "#f2ce5a"; // Amarelo claro
      txtBadge.style.color = "#856404"; // Marrom escuro
    } else {
      txtBadge.style.backgroundColor = "#cecfd1"; // Cinza claro
      txtBadge.style.color = "#383d41"; // Cinza escuro
    }
  }

  // 02 PERMISSÕES DE TELA
  if (nivelUsuario === "operador") {
    // Esconde o formulário de cadastro/edição de produtos para o operador
    const form = document.getElementById("form-produto");
    const tituloForm = document.getElementById("titulo-form");
    const btnMenuUsuarios = document.getElementById("menu-usuarios");
    if (form) form.style.display = "none";
    if (tituloForm) tituloForm.style.display = "none";
    if (btnMenuUsuarios) btnMenuUsuarios.style.display = "none";

    // Opcional: Esconde os botões de Editar e Excluir das linhas da tabela
    // (Podemos fazer isso escondendo as classes .btn-editar e .btn-excluir via CSS injetado)
    const style = document.createElement("style");
    style.innerHTML = ".btn-editar, .btn-excluir { display: none !important; }";
    document.head.appendChild(style);
  }
}

// Variável global que armazenará os produtos vindos do MySQL
let produtos = [];

// Guarda a instância do gráfico para podermos destruí-lo/recriá-lo ao atualizar dados
let meuGrafico = null;

// 1. CARREGAR PRODUTOS (MÉTODO GET)
async function carregarProdutos() {
  try {
    const resposta = await api.get("/produtos");
    produtos = resposta.data; // O dado bruto já vem mapeado em .data pelo Axios vindo do MySQL!

    // Atualiza toda a interface visual
    atualizarPainel();
  } catch (erro) {
    console.error("Erro ao buscar dados do MySQL:", erro);
    alert(
      "Não foi possível carregar os produtos do banco de dados. O servidor está rodando?",
    );
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
      const temEstoque = estoque > 0;
      const precoNumerico = Number(preco);
      return `
      <tr>
        <td>${id}</td>
        <td><strong>${nome}</strong></td>
        <td>${categoria}</td>
        <td>R$ ${precoNumerico.toFixed(2)}</td>
        <td>${temEstoque ? estoque : `<span class="badge-esgotado">Esgotado</span>`}</td>
        <td>
          <div class="btn-acoes-container">
            <button class="btn-vender" ${!temEstoque ? "disabled" : ""} onclick="executarVenda(${id}, ${estoque})">
              ${!temEstoque ? "Acabou" : "Vender"}
            </button>
            <button class="btn-editar" onclick="prepararEdicao(${id})">Editar</button>
            <button class="btn-excluir" ${temEstoque ? "disabled" : ""}  onclick="excluirProduto(${id})">
              ${!temEstoque ? "Excluir" : "Inativo"}
            </button>
          </div>
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

  aplicarPermissoesDeTela();

  // Para atualizar o grasfico
  atualizarGrafico(listaParaExibir);
}

/// AÇÃO DE VENDA: Agora se conecta à API de Vendas (POST)
async function executarVenda(idAlvo, estoqueAtual) {
  const produto = produtos.find((p) => p.id === idAlvo);
  if (!produto) return;

  try {
    // Dispara a criação do registro de venda no banco
    await api.post("/vendas", {
      produto_id: idAlvo,
      quantidade: 1,
      preco_unitario: produto.preco,
    });

    carregarProdutos(); // Recarrega para ver o estoque atualizado
  } catch (erro) {
    alert(erro.response?.data?.erro || "Erro ao processar venda.");
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

  // Seleciona o formulário e faz a tela rolar até ele de forma suave (smooth)
  document
    .getElementById("form-produto")
    .scrollIntoView({ behavior: "smooth", block: "start" });
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

    if (
      produtos.some(
        (p) =>
          p.nome.toLowerCase() === nome.toLowerCase() && p.id !== Number(id),
      )
    ) {
      alert("Nome duplicado!");
      return;
    }

    const dados = { nome, categoria, preco, estoque };

    try {
      if (id) {
        await api.put(`/produtos/${id}`, dados);
        alert("Produto atualizado!");
        cancelarEdicao();
      } else {
        await api.post("/produtos", dados);
        alert("Produto cadastrado!");
        document.getElementById("form-produto").reset();
      }
      carregarProdutos();
    } catch (erro) {
      alert("Falha ao salvar produto.");
    }
  });

// OPERAÇÃO: Excluir Produto (Usa .filter() para remover da lista)
async function excluirProduto(idAlvo) {
  if (confirm("Tem certeza que deseja excluir este produto?")) {
    try {
      // Faz a chamada para a rota DELETE do servidor Node.js
      await api.delete(`/produtos/${idAlvo}`);

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

// 🚪 OPERAÇÃO DE LOGOUT SEGURO
document.getElementById("btn-logout").addEventListener("click", function () {
  if (confirm("Deseja realmente sair do sistema?")) {
    // Limpa o Token, Nome e Nível de Acesso salvos no navegador
    localStorage.clear();

    // Redireciona o usuário para a tela de login na raiz
    window.location.href = "./login/login.html";
  }
});
