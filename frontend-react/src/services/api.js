import axios from "axios";

// Verifica se o app está rodando localmente ou em produção para escolher a porta certa
const URL_LOCAL = "http://localhost:3000/api";
const URL_PRODUCAO = import.meta.env.VITE_API_URL; // Padrão do Vite para ler variáveis de ambiente

const api = axios.create({
  baseURL:
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? URL_LOCAL
      : URL_PRODUCAO,
});

// 🔄 INTERCEPTOR DE REQUISIÇÃO: Anexa o passaporte (Token JWT) automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (erro) => {
    return Promise.reject(erro);
  },
);

// 🔒 TRAVA LÓGICA GLOBAL: Evita que múltiplos alertas de sessão apareçam ao mesmo tempo
let alertaExibido = false;

// 🔄 INTERCEPTOR DE RESPOSTA: Se a sessão cair no MySQL (401/403), limpa os dados locais
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (erro.response?.status === 401 || erro.response?.status === 403) {
      // Se a trava estiver falsa, significa que é o PRIMEIRO erro. Entra e bloqueia os próximos!
      if (!alertaExibido) {
        alertaExibido = true; // Ativa a trava imediatamente

        alert(
          "Sua sessão expirou ou você não possui permissão para esta ação!",
        );
        localStorage.clear();
        // localStorage.removeItem("token"); // Para apagar apenas o token de login.
        window.location.href = "/login"; // Redirecionará usando as rotas do React futuramente
      }
    }
    return Promise.reject(erro);
  },
);

export default api;
