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
    <div>
      <div>
        <h2>👥 Registro de Novos Funcionários</h2>
      </div>

      {/* Alertas de Feedback usando Tailwind */}
      {mensagemSucesso && <div>✅ {mensagemSucesso}</div>}

      {mensagemErro && <div>⚠️ {mensagemErro}</div>}

      <form onSubmit={lidarComCadastro}>
        {/* Campo: Nome */}
        <div>
          <label htmlFor="nome-func">Nome Completo</label>
          <input
            type="text"
            id="nome-func"
            required
            placeholder="Ex: Carlos Alberto Souza"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        {/* Campo: E-mail */}
        <div>
          <label htmlFor="email-func">E-mail de Acesso Corporativo</label>
          <input
            type="email"
            id="email-func"
            required
            placeholder="nome@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Campo: Senha */}
        <div>
          <label htmlFor="senha-func">Senha Inicial de Acesso</label>
          <input
            type="password"
            id="senha-func"
            required
            placeholder="Mínimo 6 caracteres"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        {/* Campo: Nível de Acesso (Lookup Select) */}
        <div>
          <label htmlFor="nivel-func">Nível de Permissão (Tabela Lookup)</label>
          <select
            id="nivel-func"
            value={nivelAcessoId}
            onChange={(e) => setNivelAcessoId(e.target.value)}
          >
            <option value="1">Administrador</option>
            <option value="2">Operador</option>
          </select>
        </div>

        {/* Botão Submeter */}
        <button type="submit" disabled={carregando}>
          {carregando ? "Cadastrando..." : "Cadastrar Funcionário"}
        </button>
      </form>
    </div>
  );
};

export default CadastroUsuarios;
