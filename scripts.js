const produtos = [
  { id: 1, nome: "Teclado Mecânico", preco: 150, estoque: 3 },
  { id: 2, nome: "Mouse Gamer", preco: 80, estoque: 5 },
  { id: 3, nome: "Monitor 24'", preco: 900, estoque: 2 },
  { id: 4, nome: "Headset USB", preco: 220, estoque: 0 },
  { id: 5, nome: "Placa de Vídeo", preco: 2500, estoque: 5 },
];

const produtoPremium = produtos.find((p) => p.id === 5);
const divDestaque = document.getElementById("bloco-destaque");
if (produtoPremium) {
  divDestaque.innerHTML = `⭐ <strong>Destaque:</strong> ${produtoPremium.nome} - R$ ${produtoPremium.preco}`;
}

const valorTotal = apenasPerifericos.reduce((acc, p) => acc + p.preco, 0);

const tbody = document.getElementById("linhas-produtos");
let htmlLinhas = apenasPerifericos
  .map(
    ({ id, nome, categoria, preco }) => `
    <tr>
        <td>${id}</td>
        <td>${nome}</td>
        <td>${categoria}</td>
        <td>R$ ${preco}</td>
    </tr>
    `,
  )
  .join("");

htmlLinhas += `
    <tr class="total-row">
        <td colspan="3" style="text-align: right">Total:</td>
        <td>R$ ${valorTotal}</td>
    </tr>
  `;

tbody.innerHTML = htmlLinhas;
