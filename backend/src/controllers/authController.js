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

    const sql = `
      INSERT INTO usuarios (nome, email, senha, nivel_acesso_id) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, nome, email
    `;

    await db.query(sql, [nome, email, senhaCriptografada, nivel_acesso_id]);
    res
      .status(201)
      .json({ mensagem: "Novo usuário registrado com sucesso no PostgreSQL!" });
  } catch (error) {
    // Código '23505' é o erro padrão do PostgreSQL para violação de chave UNIQUE (e-mail duplicado)
    if (error.code === "23505") {
      return res.status(400).json({ error: "E-mail já cadastrado!" });
    }
    res
      .status(500)
      .json({ error: "Erro ao registrar usuário!", message: error.message });
  }
};

export const loginUsuario = async (req, res) => {
  const { email, senha } = req.body;

  const sqlBuscaUsuario = `
    SELECT u.*, n.nome AS nivel_nome
    FROM usuarios u
    INNER JOIN niveis_acesso n ON u.nivel_acesso_id = n.id
    WHERE u.email = $1
  `;

  try {
    const { rows } = await db.query(sqlBuscaUsuario, [email]);

    if (rows.length === 0) {
      return res.status(400).json({ error: "E-mail ou senha inválidos!" });
    }

    const usuario = rows[0];

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(400).json({ error: "E-mail ou senha inválidos!" });
    }

    const token = jwt.sign(
      { id: usuario.id, nivel: usuario.nivel_nome, nome: usuario.nome },
      JWT_SECRET,
      { expiresIn: "2h" },
    );

    res.json({
      token,
      nome: usuario.nome,
      nivel: usuario.nivel_nome,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
