import express from "express";
import {
  listarVendas,
  realizarVenda,
  estornarVenda,
} from "../controllers/vendaController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verificarToken, listarVendas);
router.post("/", verificarToken, realizarVenda);
router.delete("/:id", verificarToken, estornarVenda);

export default router;
