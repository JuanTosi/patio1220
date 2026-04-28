import express from "express";
import {
  crearReserva,
  obtenerMisReservas,
  obtenerTodasLasReservas,
  obtenerReservaPorId,
  cambiarEstadoReserva,
  marcarReservaPagada,
  cancelarReserva,
} from "../controllers/reservas.controller.js";
import { verificarToken, verificarAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Rutas de usuario logeado
// GET - Obtener mis reservas
router.get("/mis-reservas", verificarToken, obtenerMisReservas);

// POST - Crear nueva reserva
router.post("/", verificarToken, crearReserva);

// PATCH - Cancelar mi reserva
router.patch("/:id/cancelar", verificarToken, cancelarReserva);

// Rutas de ADMIN
// PATCH - Cambiar estado de reserva
router.patch("/:id/estado", verificarToken, verificarAdmin, cambiarEstadoReserva);

// PATCH - Marcar como pagada
router.patch("/:id/pagado", verificarToken, verificarAdmin, marcarReservaPagada);

// GET - Obtener todas las reservas
router.get("/", verificarToken, verificarAdmin, obtenerTodasLasReservas);

// GET - Obtener detalle por ID
router.get("/:id", verificarToken, verificarAdmin, obtenerReservaPorId);

export default router;