import { Router } from "express";
import {
  getTotalClientes,
  getTotalProductos,
  getTotalReservas,
  getTotalUsuarios,
  getDashboardActividad,
  getInforme,
  analizarConIA,
} from "../controllers/dashboardReportes.controller.js";
import { verificarToken, verificarAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarToken, verificarAdmin);

router.get("/clientes", getTotalClientes);
router.get("/productos", getTotalProductos);
router.get("/reservas", getTotalReservas);
router.get("/usuarios", getTotalUsuarios);
router.get("/actividad", getDashboardActividad);
router.get("/informe", getInforme);
router.post("/analizar-ia", analizarConIA);

export default router;