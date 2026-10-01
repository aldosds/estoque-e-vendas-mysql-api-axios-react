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
