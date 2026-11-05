import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { NavLink } from "react-router-dom";

const MenuNavegacao = () => {
  const { usuario, logout } = useContext(AuthContext);

  return (
    <header className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
      {/* Informações do Perfil */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="h-10 w-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-lg shrink-0">
          {usuario?.nome?.charAt(0)}
        </div>
        <div>
          <p classNme="text-slate-500 text-xs">Sessão operacional ativa</p>
          <h2 calssName="text-slate-800 font-bold text-sm">
            {usuario?.nome}

            <span
              className={`ml-2 text-[10px] uppercase px-2 py-0.5 rounded-full font-extrabold ${usuario?.nivel === "admin" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}
            >
              {usuario?.nivel}
            </span>
          </h2>
        </div>
      </div>

      {/* 🛣️ LINKS DE NAVEGAÇÃO SPA (React Router v6) */}
      <nav className="flex items-center gap-6 my-2 md:my-0">
        <NavLink to="/produtos">📦 Produtos</NavLink>
        <NavLink to="/vendas">💰 Histórico de Vendas</NavLink>

        {/* Renderização condicional do link de usuários apenas se for admin */}
        {usuario?.nivel === "admin" && (
          <NavLink to="/cadastro-usuarios">👥 Novo Usuário</NavLink>
        )}
      </nav>

      {/* Botão Logout */}
      <button
        onClick={logout}
        className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-4 py-2 rounded-lg shadow-sm transition cursor-pointer"
      >
        Sair do Sistema 🚪
      </button>
    </header>
  );
};

export default MenuNavegacao;
