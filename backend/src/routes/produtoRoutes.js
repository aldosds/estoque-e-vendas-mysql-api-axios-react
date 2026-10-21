import express from "express";
import {
  listarProdutos,
  cadastrarProduto,
  editarProduto,
  excluirProduto,
} from "../controllers/produtoController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verificarToken, listarProdutos);
router.post("/", verificarToken, cadastrarProduto);
router.put("/:id", verificarToken, editarProduto);
router.delete("/:id", verificarToken, excluirProduto);

export default router;
