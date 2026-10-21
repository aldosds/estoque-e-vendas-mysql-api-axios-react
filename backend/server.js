import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes.js";
import produtoRoutes from "./src/routes/produtoRoutes.js";
import vendaRoutes from "./src/routes/vendaRoutes.js";

dotenv.config();

const app = express();

// Middlewares obrigatórios
app.use(cors());
app.use(express.json()); // Permite que o Node entenda dados enviados no formato JSON

// Distribuição unificada de endpoints da API RESTful
app.use("/api/auth", authRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/vendas", vendaRoutes);

// Inicializa o servidor na porta 3000
app.listen(3000, () => {
  console.log("🖥️ Servidor rodando em http://localhost:3000");
});
