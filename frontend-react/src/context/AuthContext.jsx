import { createContext, useState, useEffect } from "react";
import api from "../services/api";

// 1. Instancia o canal do Contexto Global
export const AuthContext = createContext();

// 2. Cria o Provedor que vai gerenciar o estado real de login
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  // 🚀 APRENDIZADO RECENTE: useEffect atuando no Ciclo de Vida da Aplicação
  // Assim que o app "nasce" no navegador, ele checa se já existe um Token salvo localmente
  useEffect(() => {
    const tokenSalvo = localStorage.getItem("token");
    const nomeSalvo = localStorage.getItem("usuario_nome");
    const nivelSalvo = localStorage.getItem("usuario_nivel");

    if (tokenSalvo && nomeSalvo && nivelSalvo) {
      // Re-alimenta o estado global sem precisar bater no banco de dados novamente
      setUsuario({ nome: nomeSalvo, nivel: nivelSalvo });
    }
    setCarregandoSessao(false); // Libera a renderização das telas
  }, []);

  // 🔑 OPERAÇÃO: Login Real integrado ao Back-end via Axios
  async function login(email, senha) {
    try {
      // Dispara o POST real para a rota do seu servidor Node.js
      const resposta = await api.post("/auth/login", { email, senha });

      const { token, nome, nivel } = resposta.data;

      // Persiste os dados de sessão fisicamente no navegador
      localStorage.setItem("token", token);
      localStorage.setItem("usuario_nome", nome);
      localStorage.setItem("usuario_nivel", nivel);

      // Atualiza o estado global reativo do React
      setUsuario({ nome, nivel });
      return { sucesso: true };
    } catch (erro) {
      console.error("Falha na autenticação:", erro);
      // Captura a mensagem exata enviada pelo seu 'authController.js' ("E-mail ou senha inválidos!")
      return {
        sucesso: false,
        mensagem:
          erro.response?.data?.error || "Erro de conexão com o servidor.",
      };
    }
  }

  // 🚪 OPERAÇÃO: Logout Seguro
  function logout() {
    localStorage.clear(); // Limpa tokens e permissões locais
    setUsuario(null); // Reseta o estado global voltando para a tela de login
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, carregandoSessao }}>
      {children}
    </AuthContext.Provider>
  );
}
