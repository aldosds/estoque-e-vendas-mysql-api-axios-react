const api = axios.create({ baseURL: "http://localhost:3000/api" });
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
