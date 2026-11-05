import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { BrowserRouter, Routes, Rout, Navigate } from "react-router-dom";

import Login from "./views/Login";
import PainelProdutos from "./views/PainelProdutos";

import ProtectedRoute from "./components/ProtectedRoute";
import MenuNavegacao from "./components/MenuNavegacao";

function App() {
  const { usuario, carregandoSessao } = useContext(AuthContext);

  // // Enquanto o useEffect do contexto lê o localStorage, exibe uma tela neutra
  // if (carregandoSessao) {
  //   return (
  //     <div className="min-h-screen flex justify-center items-center bg-gray-50 text-slate-600 font-semibold text-lg">
  //       ⏳ Validando credenciais...
  //     </div>
  //   );
  // }

  // // Se NÃO houver usuário logado no contexto global, exibe a tela de login estilizada
  // if (!usuario) {
  //   return <Login />;
  // }

  // Se o usuário já estiver logado, por enquanto mostra apenas uma mensagem de sucesso
  return (
    <>
      <PainelProdutos />
    </>
  );
}

export default App;
