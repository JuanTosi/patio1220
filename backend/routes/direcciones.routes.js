import express from "express";
import {
  obtenerMisDirecciones,
  obtenerDireccionPorId,
  agregarDireccion,
  editarDireccion,
  eliminarDireccion,
  marcarDireccionPrincipal
} from "../controllers/direcciones.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// TODAS ESTAS RUTAS REQUIEREN AUTENTICACION
// Rutas de usuario logueado
// GET - Obtener mis direcciones
router.get("/", verificarToken, obtenerMisDirecciones);

// GET - Obtener una dirección específica
router.get("/:id", verificarToken, obtenerDireccionPorId);

// POST - Agregar nueva dirección
router.post("/", verificarToken, agregarDireccion);

// PUT - Editar dirección
router.put("/:id", verificarToken, editarDireccion);

// PATCH - Marcar dirección como principal
router.patch("/:id/principal", verificarToken, marcarDireccionPrincipal);

// DELETE - Eliminar dirección
router.delete("/:id", verificarToken, eliminarDireccion);

export default router;