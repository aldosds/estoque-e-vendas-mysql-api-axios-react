import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  // Sintoniza no contexto global de autenticação para herdar a função de login real
  const { login } = useContext(AuthContext);

  // Estados locais para controlar os dados dos campos do formulário
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Função disparada ao submeter o formulário
  async function lidarComLogin(e) {
    e.preventDefault();
    setMensagemErro("");
    setCarregando(true);

    // Executa a chamada do Axios envelopada dentro do Contexto
    const resultado = await login(email, senha);

    if (!resultado.sucesso) {
      // Se falhar (senha incorreta, e-mail inexistente), renderiza o erro do MySQL na tela
      setMensagemErro(resultado.mensagem);
      setCarregando(false);
    }
    // Se der sucesso, o próprio AuthContext mudará o estado global e a tela atualizará sozinha!
  }

  return (
    // Classes Tailwind: centralização total usando flexbox, min-h-screen (altura toda) e fundo suave
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-2">
          Acesso ao Sistema
        </h1>
        <h2 className="text-2xl text-center text-slate-500 mb-6">
          Controle de Estoque & Vendas
        </h2>

        {mensagemErro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm font-semibold text-center animate-pulse">
            ⚠️ {mensagemErro}
          </div>
        )}

        <form onSubmit={lidarComLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-slate-600"
            >
              E-mail Corporativo
            </label>
            <input
              type="email"
              id="email"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="senha"
              className="text-sm font-semibold text-slate-600"
            >
              Senha de Acesso
            </label>
            <input
              type="password"
              id="senha"
              required
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg transsition duration-200 shadow disabled:bg-slate-400 disabled:cursor-not-allowed mt-2 cursor-pointer"
          >
            {carregando ? "Autenticando..." : "Entrar no Painel"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-sm text-slate-500">
          <strong>Dica técnica:</strong> use as contas criadas na tabela lookup
          para testar privilégios.
        </div>
      </div>
    </div>
  );
};

export default Login;
