const produtos = [
  { id: 1, nome: "Teclado Mecânico", preco: 150, categoria: "Periferico" },
  { id: 2, nome: "Mouse Gamer", preco: 80, categoria: "Periferico" },
  { id: 3, nome: "Monitor 24'", preco: 900, categoria: "Video" },
  { id: 4, nome: "Headset USB", preco: 220, categoria: "Periferico" },
  { id: 5, nome: "Placa de Vídeo", preco: 2500, categoria: "Video" },
];

const produtoPremium = produtos.find((p) => p.id === 5);
const divDestaque = document.getElementById("bloco-destaque");
if (produtoPremium) {
  divDestaque.innerHTML = `⭐ <strong>Destaque:</strong> ${produtoPremium.nome} - R$ ${produtoPremium.preco}`;
}

const apenasPerifericos = produtos.filter((p) => p.categoria === "Periferico");

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
console.log(valorTotal);
