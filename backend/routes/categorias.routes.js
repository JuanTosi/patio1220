import express from "express";
import {
  obtenerCategorias,
  obtenerCategoriasActivas,
  obtenerCategoriaPorId,
  crearCategoria,
  editarCategoria,
  eliminarCategoria
} from "../controllers/categorias.controller.js";
import { verificarToken, verificarAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Rutas publicas
// GET - Obtener categorías activas
router.get("/activas", obtenerCategoriasActivas);

// GET - Obtener una categoría por ID
router.get("/:id", obtenerCategoriaPorId);

// Rutas de ADMIN
// GET - Obtener todas las categorías
router.get("/", verificarToken, verificarAdmin, obtenerCategorias);

// POST - Crear nueva categoría
router.post("/", verificarToken, verificarAdmin, crearCategoria);

// PUT - Editar categoría
router.put("/:id", verificarToken, verificarAdmin, editarCategoria);

// DELETE - Eliminar categoría
router.delete("/:id", verificarToken, verificarAdmin, eliminarCategoria);

export default router;