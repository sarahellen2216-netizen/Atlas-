import { Router } from "express";

import {
  listarAcoes,
  buscarAcao,
  criarAcao,
  atualizarAcao,
  excluirAcao,
} from "../controllers/acoesCorretivasController";

const router = Router();

router.get(
  "/",
  listarAcoes
);

router.get(
  "/:id",
  buscarAcao
);

router.post(
  "/",
  criarAcao
);

router.put(
  "/:id",
  atualizarAcao
);

router.delete(
  "/:id",
  excluirAcao
);

export default router;
