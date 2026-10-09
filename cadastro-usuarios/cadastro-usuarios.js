// 🛡️ BLOQUEIO DE SESSÃO LOCAL: Impede o acesso se não houver token ou se o nível não for admin
if (!localStorage.getItem("token")) {
  window.location.href = "../login/login.html";
}
if (localStorage.getItem("usuario_nivel") !== "admin") {
  alert("Acesso negado! Apenas administradores podem acessar esta página.");
  window.location.href = "../index.html";
}

// Configuração centralizada do Axios
const api = axios.create({ baseURL: "http://localhost:3000/api" });

// Interceptor para injetar o Token de segurança na requisição POST
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 01 EXIBIÇÃO DE PERFIL
// Captura os dados do usuário salvos no localStorage no momento do login
const nomeUsuario = localStorage.getItem("usuario_nome");
const nivelUsuario = localStorage.getItem("usuario_nivel");

// 1. Injeta o nome do usuário na mensagem de boas-vindas
const txtBoasVindas = document.getElementById("mensagem-boas-vindas");
if (txtBoasVindas && nomeUsuario) {
  txtBoasVindas.innerHTML = `Usuário logado: <strong>${nomeUsuario}</strong>`;
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

// Escuta o envio do formulário de cadastro
document
  .getElementById("form-cadastro-usuario")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const nivel_acesso_id = parseInt(
      document.getElementById("nivel_acesso").value,
    );

    try {
      const resposta = await api.post("/auth/registrar", {
        nome,
        email,
        senha,
        nivel_acesso_id, // Enviado como número (1 ou 2) atendendo à sua regra de FK
      });

      alert(resposta.data.mensagem);
      document.getElementById("form-cadastro-usuario").reset(); // Limpa a tela
    } catch (erro) {
      console.error(erro);
      alert(erro.response?.data?.erro || "Erro ao conectar com o servidor.");
    }
  });

// 🚪 OPERAÇÃO DE LOGOUT SEGURO
document.getElementById("btn-logout").addEventListener("click", function () {
  if (confirm("Deseja realmente sair do sistema?")) {
    // Limpa o Token, Nome e Nível de Acesso salvos no navegador
    localStorage.clear();

    // Redireciona o usuário para a tela de login na raiz
    window.location.href = "../login/login.html";
  }
});
