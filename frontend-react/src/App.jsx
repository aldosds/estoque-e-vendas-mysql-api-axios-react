import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./views/Login";
import PainelProdutos from "./views/PainelProdutos";

import ProtectedRoute from "./components/ProtectedRoute";
import MenuNavegacao from "./components/MenuNavegacao";
import HistoricoVendas from "./views/HistoricoVendas";

function VisaoCadastroUsuarios() {
  return (
    <div>
      <h3>👥 Em breve: Cadastro de Novos Funcionários Lookup</h3>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública: Login */}
        <Route path="/login" element={<Login />} />

        {/* 🔒 GRUPO DE ROTAS PROTEGIDAS (Usando o nosso componente guarda) */}
        <Route
          path="/produtos"
          element={
            <ProtectedRoute>
              <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans">
                <MenuNavegacao />
                <PainelProdutos />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendas"
          element={
            <ProtectedRoute>
              <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans">
                <MenuNavegacao />
                <HistoricoVendas />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Rota Protegida com barreira extra exclusiva para Administradores (adminOnly) */}
        <Route
          path="/cadastro-usuarios"
          element={
            <ProtectedRoute adminOnly={true}>
              <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans">
                <MenuNavegacao />
                <VisaoCadastroUsuarios />
              </div>
            </ProtectedRoute>
          }
        />

        {/* 🗺️ DIRECIONAMENTO PADRÃO: Se digitar qualquer caminho inválido, joga para os produtos */}
        <Route path="*" element={<Navigate to="/produtos" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
