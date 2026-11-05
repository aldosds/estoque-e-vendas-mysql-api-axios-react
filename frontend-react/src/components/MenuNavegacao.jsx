import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { NavLink } from "react-router-dom";

const MenuNavegacao = () => {
  const { usuario, logout } = useContext(AuthContext);

  return (
    <header>
      {/* Informações do Perfil */}
      <div>
        <div>{usuario?.nome?.charAt(0)}</div>
        <div>
          <p>Sessão operacional ativa</p>
          <h2>
            {usuario?.nome}

            <span>{usuario?.nivel}</span>
          </h2>
        </div>
      </div>

      {/* 🛣️ LINKS DE NAVEGAÇÃO SPA (React Router v6) */}
      <nav>
        <NavLink to="/produtos">📦 Produtos</NavLink>
        <NavLink to="/vendas">💰 Histórico de Vendas</NavLink>

        {/* Renderização condicional do link de usuários apenas se for admin */}
        {usuario?.nivel === "admin" && (
          <NavLink to="/cadastro-usuarios">👥 Novo Usuário</NavLink>
        )}
      </nav>

      {/* Botão Logout */}
      <button onClick={logout}>Sair do Sistema 🚪</button>
    </header>
  );
};

export default MenuNavegacao;
