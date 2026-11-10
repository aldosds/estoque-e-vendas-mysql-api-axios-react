import { useState } from "react";
import api from "../services/api";

const CadastroUsuarios = () => {
  // Estados para gerenciar as entradas do novo funcionário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nivelAcessoId, setNivelAcessoId] = useState("2"); // Inicia o select como Operador (ID 2)

  // Estados de feedback visual
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function lidarComCadastro(e) {
    e.preventDefault();
    setMensagemSucesso("");
    setMensagemErro("");
    setCarregando(true);

    // Validação local simples preventiva de tamanho de senha
    if (senha.length < 6) {
      setMensagemErro(
        "A senha de acesso inicial deve conter no mínimo 6 caracteres!",
      );
      setCarregando(false);
      return;
    }

    try {
      // Dispara o POST direcionado para a rota protegida do back-end Node.js
      const resposta = await api.post("/auth/registrar", {
        nome: nome.trim(),
        email: email.trim(),
        senha,
        nivel_acesso_id: parseInt(nivelAcessoId), // Converte a string do select para o ID numérico exigido pela FK
      });

      setMensagemSucesso(resposta.data.mensagem);
      limparCampos();
    } catch (error) {
      console.error(error);
      setMensagemErro(
        error.response?.data?.error || "Falha ao registrar novo usuário no DB.",
      );
    } finally {
      setCarregando(false);
    }
  }

  function limparCampos() {
    setNome("");
    setEmail("");
    setSenha("");
    setNivelAcessoId("2");
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          👥 Registro de Novos Funcionários
        </h2>
      </div>

      {/* Alertas de Feedback usando Tailwind */}
      {mensagemSucesso && (
        <div className="bg-emerald-50 border border-emerald-400 text-emerald-800 px-4 py-3 rounded-lg mb-4 text-sm font-semibold text-center">
          ✅ {mensagemSucesso}
        </div>
      )}

      {mensagemErro && (
        <div className="bg-rose-50 border border-rose-400 text-rose-800 px-4 py-3 rounded-lg mb-4 text-sm font-semibold text-center animate-pulse">
          ⚠️ {mensagemErro}
        </div>
      )}

      <form onSubmit={lidarComCadastro} className="flex flex-col gap-5">
        {/* Campo: Nome */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="nome-func"
            className="text-xs font-bold text-slate-500 uppercase"
          >
            Nome Completo
          </label>
          <input
            type="text"
            id="nome-func"
            required
            placeholder="Ex: Carlos Alberto Souza"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          />
        </div>

        {/* Campo: E-mail */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="email-func"
            className="text-xs font-bold text-slate-500 uppercase"
          >
            E-mail de Acesso Corporativo
          </label>
          <input
            type="email"
            id="email-func"
            required
            placeholder="nome@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          />
        </div>

        {/* Campo: Senha */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="senha-func"
            className="text-xs font-bold text-slate-500 uppercase"
          >
            Senha Inicial de Acesso
          </label>
          <input
            type="password"
            id="senha-func"
            required
            placeholder="Mínimo 6 caracteres"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          />
        </div>

        {/* Campo: Nível de Acesso (Lookup Select) */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="nivel-func"
            className="text-xs font-bold text-slate-500 uppercase"
          >
            Nível de Permissão
          </label>
          <select
            id="nivel-func"
            value={nivelAcessoId}
            onChange={(e) => setNivelAcessoId(e.target.value)}
            className="p-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
          >
            <option value="1">Administrador (Acesso Total)</option>
            <option value="2">Operador (Apenas Vendas)</option>
          </select>
        </div>

        {/* Botão Submeter */}
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={carregando}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-lg shadow-sm transition disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {carregando ? "Registrando no MySQL..." : "Cadastrar Funcionário"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CadastroUsuarios;
