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

// Inicialização
carregarVendas();
