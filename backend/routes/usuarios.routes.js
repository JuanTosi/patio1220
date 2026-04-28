import express from "express";
import { loginUsuario,  registrarUsuario,solicitarRecuperacionPassword, resetearPassword } from "../controllers/auth.controller.js";
import {
  obtenerUsuario,
  obtenerUsuarioPorId,
  agregarUsuario,
  editarUsuario,
  editarMiUsuario,
  actualizarPassword,
  actualizarMiPassword,
  eliminarUsuario,
  cambiarEstadoUsuario,
  cambiarRolUsuario,
} from "../controllers/usuarios.controller.js";
import { verificarToken, verificarAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Rutas publicas
// POST - Login
router.post("/login", loginUsuario);

// POST - Registro de nuevo usuario
router.post("/register",  registrarUsuario);

// PUT - Recuperar contraseña 
router.put("/actualizar-password", actualizarPassword);

// CAMBIO: rutas nuevas para el flujo de recuperar contraseña por mail
// POST - el usuario manda su email y le llega el link
router.post("/forgot-password", solicitarRecuperacionPassword);
// POST - el usuario manda el token del mail y su nueva password
router.post("/reset-password", resetearPassword);

// Rutas de usuario logueado
// GET - Obtener mi perfil
router.get("/me", verificarToken, obtenerUsuarioPorId);

// PUT - Editar mi perfil
router.put("/me", verificarToken, editarMiUsuario);

// PUT - Cambiar mi contraseña
router.put("/me/password", verificarToken, actualizarMiPassword);

// Rutas de ADMIN
// GET - Obtener todos los usuarios
router.get("/", verificarToken, verificarAdmin, obtenerUsuario);

// GET - Obtener un usuario por ID
router.get("/:id", verificarToken, verificarAdmin, obtenerUsuarioPorId);

// POST - Crear nuevo usuario
router.post("/", verificarToken, verificarAdmin, agregarUsuario);

// PUT - Editar usuario
router.put("/:id", verificarToken, verificarAdmin, editarUsuario);

// PUT - Actualizar contraseña de cualquier usuario
router.put("/:id/password", verificarToken, verificarAdmin, actualizarPassword);

// DELETE - Eliminar usuario
router.delete("/:id", verificarToken, verificarAdmin, eliminarUsuario);

// PATCH - Cambiar estado (activo/inactivo)
router.patch("/:id/estado", verificarToken, verificarAdmin, cambiarEstadoUsuario);

// PATCH - Cambiar rol
router.patch("/:id/rol", verificarToken, verificarAdmin, cambiarRolUsuario);

export default router;