import db from "../config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../middlewares/authMiddleware.js";

export const registrarUsuario = async (req, res) => {
  // Recebemos 'nivel_acesso_id' (número) em vez da string ENUM antiga
  const { nome, email, senha, nivel_acesso_id } = req.body;

  try {
    // Criptografa a senha do novo funcionário de forma segura
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    const sql =
      "INSERT INTO usuarios (nome, email, senha, nivel_acesso_id) VALUES (?, ?, ?, ?)";
    db.query(
      sql,
      [nome, email, senhaCriptografada, nivel_acesso_id],
      (error) => {
        if (error)
          return res.status(400).json({ error: "E-mail já cadastrado!" });
        res.json({ mensagem: "Usuário registrado com sucesso!" });
      },
    );
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao registrar usuário!", message: error.message });
  }
};

export const loginUsuario = (req, res) => {
  const { email, senha } = req.body;
  const sqlBuscaUsuario = `
        SELECT u.*, n.nome AS nivel_nome
        FROM usuarios u
        INNER JOIN niveis_acesso n ON u.nivel_acesso_id = n.id
        WHERE u.email = ?
    `;

  db.query(sqlBuscaUsuario, [email], async (error, results) => {
    if (error) {
      console.error("Erro na query de login:", err.message);
      return res.status(500).json({
        error: "Erro interno no servidor de banco de dados.",
        message: error.message,
      });
    }

    // Se o array de resultados vier vazio, significa que o e-mail não existe no MySQL
    if (results.length === 0)
      return res.status(400).json({ error: "E-mail ou senha inválidos!" });

    // Como o e-mail é UNIQUE, pegamos a primeira e única posição [0] do resultado
    const usuario = results[0];

    // Compara a senha digitada no formulário com o hash Bcrypt salvo no banco
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta)
      return res.status(400).json({ error: "E-mail ou senha inválidos!" });

    // Cria o token JWT com os dados do usuário logado
    const token = jwt.sign(
      { id: usuario.id, nivel: usuario.nivel_nome, nome: usuario.nome },
      JWT_SECRET,
      { expiresIn: "2h" }, // Token expira automaticamente em 2 horas
    );
    // Retorna a resposta de sucesso com o Token e dados públicos
    res.json({
      token,
      nome: usuario.nome,
      nivel: usuario.nivel_nome, // Envia 'admin' ou 'operador' por extenso
    });
  });
};
