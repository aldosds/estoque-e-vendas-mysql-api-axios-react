// Ferramentas de segurança
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Carrega as variáveis do arquivo .env
dotenv.config();

// Captura a chave do .env ou assume uma senha padrão de segurança (fallback)
export const JWT_SECRET = process.env.JWT_SECRET || "fallback_chave_segura";

export function verificarToken(req, res, next) {
  // Captura o token enviado no cabeçalho (Header) da requisição Axios
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Acesso negado. Token não fornecido!" });
  }

  try {
    const dadosDecodificados = jwt.verify(token, JWT_SECRET);
    req.usuarioLogado = dadosDecodificados; // Armazena os dados do usuário logado na requisição
    next(); // Permite que a requisição siga para a rota original
  } catch (error) {
    return res.status(403).json({ error: "Token inválido ou expirado!" });
  }
}
