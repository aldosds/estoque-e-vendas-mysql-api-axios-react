import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { usuario, carregandoSessao } = useContext(AuthContext);

  // Enquanto o useEffect do contexto lê o localStorage, mantém a tela neutra
  if (carregandoSessao) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50 text-slate-600 font-semibold text-lg">
        ⏳ Validando credenciais de acesso...
      </div>
    );
  }

  // 🛡️ BARREIRA 1: Se não estiver logado, redireciona para o login na hora
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // 🛡️ BARREIRA 2: Se a rota exigir administrador e o usuário for operador, barra o acesso
  if (adminOnly && usuario.nivel !== "admin") {
    alert("Acesso negado! Esta página é exclusiva para administradores.");
    return <Navigate to="/produtos" replace />;
  }

  // Se passou pelas barreiras, renderiza a página que ele tentou acessar
  return children;
};

export default ProtectedRoute;
