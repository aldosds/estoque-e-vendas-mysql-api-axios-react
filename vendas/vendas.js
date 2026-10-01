// 🛡️ VERIFICAÇÃO DE SESSÃO LOCAL ATIVA
// Se o token não existir no navegador, impede a leitura do script e expulsa para a tela de login
if (!localStorage.getItem("token")) {
  window.location.href = "../login/login.html";
}

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
      window.location.href = "../login/login.html";
    }
    return Promise.reject(erro);
  },
);

// Adicione também uma lógica simples no carregarPainel para esconder botões se o nível for 'operador'
function aplicarPermissoesDeTela() {
  const nivel = localStorage.getItem("usuario_nivel");
  if (nivel === "operador") {
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

let vendas = [];
let graficoVendasInstance = null;

async function carregarVendas() {
  try {
    const resposta = await api.get("/vendas");
    vendas = resposta.data;

    renderizarPainelVendas();
  } catch (error) {
    console.error(error);
    alert("Erro ao carregar histórico de vendas.");
  }
}

function renderizarPainelVendas(listaVendas = vendas) {
  // 1. .reduce() para somar faturamento total e quantidade de itens vendidos
  const faturamentoTotal = listaVendas.reduce(
    (acc, v) => acc + Number(v.valor_total),
    0,
  );
  const totalItens = listaVendas.reduce((acc, v) => acc + v.quantidade, 0);

  document.getElementById("total-faturamento").innerText =
    `R$ ${faturamentoTotal.toFixed(2)}`;

  document.getElementById("total-itens").innerText = `${totalItens}`;

  // 2. .map() + Desestruturação para montar as linhas do histórico
  const tbody = document.getElementById("linhas-vendas");

  tbody.innerHTML = listaVendas
    .map(
      ({
        id,
        produto_nome,
        quantidade,
        preco_unitario,
        valor_total,
        data_venda,
      }) => `
    <tr>
      <td>#${id}</td>
      <td><strong>${produto_nome}</strong></td>
      <td>${quantidade}</td>
      <td>R$ ${Number(preco_unitario).toFixed(2)}</td>
      <td>R$ ${Number(valor_total).toFixed(2)}</td>
      <td>${new Date(data_venda).toLocaleString("pt-BR")}</td>
      <td>
        <button class="btn-excluir" onclick="estornarVenda(${id})">Excluir (Estornar)</button>
      </td>
    </tr>
  `,
    )
    .join("");

  aplicarPermissoesDeTela();
  atualizarGraficoVendas(listaVendas);
}

// 3. .reduce() Avançado: Agrupar faturamento por nome do produto para o gráfico
function atualizarGraficoVendas(dadosVendas) {
  const ctx = document.getElementById("graficoVendas").getContext("2d");
  if (graficoVendasInstance) graficoVendasInstance.destroy();

  // Consolida os valores acumulados por produto
  const faturamentoPorProduto = dadosVendas.reduce((acc, v) => {
    acc[v.produto_nome] = (acc[v.produto_nome] || 0) + Number(v.valor_total);
    return acc;
  }, {});

  const labels = Object.keys(faturamentoPorProduto);
  const valores = Object.values(faturamentoPorProduto);

  graficoVendasInstance = new Chart(ctx, {
    type: "pie", // Gráfico de Pizza/Setores para faturamento proporcional
    data: {
      labels: labels,
      datasets: [
        {
          label: "Faturamento Total (R$)",
          data: valores,
          backgroundColor: [
            "#4caf50",
            "#2196f3",
            "#ff9800",
            "#9c27b0",
            "#e91e63",
          ],
        },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false },
  });
}

// DELETE: Cancelar venda e devolver itens ao estoque (Transação segura no Back)
async function estornarVenda(idVenda) {
  if (
    confirm(
      "Deseja cancelar esta venda? O estoque correspondente será devolvido.",
    )
  ) {
    try {
      await api.delete(`/vendas/${idVenda}`);
      alert("Venda estornada com sucesso!");
      carregarVendas();
    } catch (error) {
      alert("Erro ao estornar a venda.");
    }
  }
}

// .filter() + .includes() na barra de pesquisa por digitação
document.getElementById("busca-venda").addEventListener("input", function (e) {
  const termo = e.target.value.toLowerCase().trim();
  const filtradas = vendas.filter((v) =>
    v.produto_nome.toLowerCase().includes(termo),
  );
  renderizarPainelVendas(filtradas);
});

// Inicialização
carregarVendas();
