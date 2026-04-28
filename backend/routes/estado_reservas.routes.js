import express from "express";
import {
  obtenerEstadosReserva,
  obtenerEstadosActivos,
  obtenerEstadoPorId,
  crearEstado,
  editarEstado,
  eliminarEstado
} from "../controllers/estado_reservas.controller.js";
import { verificarToken, verificarAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Rutas de usuarios logeados
// GET - Obtener estados activos
router.get("/activos", verificarToken, obtenerEstadosActivos);

// Rutas de ADMIN
// GET - Obtener todos los estados
router.get("/", verificarToken, verificarAdmin, obtenerEstadosReserva);

// GET - Obtener un estado por ID
router.get("/:id", verificarToken, verificarAdmin, obtenerEstadoPorId);

// POST - Crear nuevo estado
router.post("/", verificarToken, verificarAdmin, crearEstado);

// PUT - Editar estado
router.put("/:id", verificarToken, verificarAdmin, editarEstado);

// DELETE - Eliminar estado
router.delete("/:id", verificarToken, verificarAdmin, eliminarEstado);

export default router;