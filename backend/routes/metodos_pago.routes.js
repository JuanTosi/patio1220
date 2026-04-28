import express from "express";
import {
  obtenerMetodosPago,
  obtenerMetodosPagoActivos,
  obtenerMetodoPagoPorId,
  crearMetodoPago,
  editarMetodoPago,
  eliminarMetodoPago
} from "../controllers/metodos_pago.controller.js";
import { verificarToken, verificarAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Rutas publicas
// GET - Obtener métodos de pago activos
router.get("/activos", obtenerMetodosPagoActivos);

// Rutas de ADMIN
// GET - Obtener todos los métodos de pago
router.get("/", verificarToken, verificarAdmin, obtenerMetodosPago);

// GET - Obtener un método de pago por ID
router.get("/:id", verificarToken, verificarAdmin, obtenerMetodoPagoPorId);

// POST - Crear nuevo método de pago
router.post("/", verificarToken, verificarAdmin, crearMetodoPago);

// PUT - Editar método de pago
router.put("/:id", verificarToken, verificarAdmin, editarMetodoPago);

// DELETE - Eliminar método de pago
router.delete("/:id", verificarToken, verificarAdmin, eliminarMetodoPago);

export default router;