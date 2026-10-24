import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Login from "./views/Login";

function App() {
  const { usuario, carregandoSessao } = useContext(AuthContext);

  // Enquanto o useEffect do contexto lê o localStorage, exibe uma tela neutra
  if (carregandoSessao) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 text-slate-600 font-semibold text-lg">
        ⏳ Validando credenciais...
      </div>
    );
  }

  // Se NÃO houver usuário logado no contexto global, exibe a tela de login estilizada
  if (!usuario) {
    return <Login />;
  }

  // Se o usuário já estiver logado, por enquanto mostra apenas uma mensagem de sucesso
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold text-emerald-400">
        🔐 Autenticação Aprovada com Sucesso!
        <p className="mt-2 text-slate-300">
          Olá, {usuario.nome}. Você está logado como {usuario.nivel}
        </p>
      </h1>
    </div>
  );
}

export default App;
