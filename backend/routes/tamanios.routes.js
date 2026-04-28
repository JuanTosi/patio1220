import express from "express";
import {
  obtenerTamanios,
  obtenerTamaniosActivos,
  obtenerTamanioPorId,
  crearTamanio,
  editarTamanio,
  eliminarTamanio
} from "../controllers/tamanios.controller.js";
import { verificarToken, verificarAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Rutas publicas
// GET - Obtener tamaños activos
router.get("/activos", obtenerTamaniosActivos);

// GET - Obtener un tamaño por ID
router.get("/:id", obtenerTamanioPorId);

// Rutas de ADMIN
// GET - Obtener todos los tamaños)
router.get("/", verificarToken, verificarAdmin, obtenerTamanios);

// POST - Crear nuevo tamaño
router.post("/", verificarToken, verificarAdmin, crearTamanio);

// PUT - Editar tamaño
router.put("/:id", verificarToken, verificarAdmin, editarTamanio);

// DELETE - Eliminar tamaño
router.delete("/:id", verificarToken, verificarAdmin, eliminarTamanio);

export default router;