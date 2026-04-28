import connection from "../config/DB.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import { enviarEmailRegistro, enviarRecuperarContrasena } from "../service/email.service.js";

export const loginUsuario = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Faltan datos" });
    }

    const emailLowerCase = email.toLowerCase().trim();

    const query = "SELECT * FROM usuarios WHERE email = ? LIMIT 1";
    connection.query(query, [emailLowerCase], async (error, results) => {
        if (error) return res.status(500).json({ error: error.message });

        if (results.length === 0) {
        return res.status(401).json({error: "Credenciales invalidas"});
        }

        const user = results[0];

        if (!user.activo) {
            return res.status(403).json({ error: "Usuario desactivado. Contacte al administrador." })
        }

        try {
        const passwordCorrecta = await bcrypt.compare(password, user.passwordHash)
        if (!passwordCorrecta) {
          return res.status(401).json({error: "Credenciales invalidas"})
        }
            const payload = {sub: user.idUsuario, rol: user.rol};
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "2h",
            })

        return res.json({
            token,
            user: {
            id: user.idUsuario,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            telefono: user.telefono,
            rol: user.rol,
            activo: user.activo,
            fechaRegistro: user.createdAt,
            },
        });
        } catch (error) {
        return res.status(500).json({error: "Error verificando contraseña"})
        }
    });
}

export const registrarUsuario = async (req, res) => {
  const { nombre, apellido, email, telefono, password } = req.body;

  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

   const emailNormalizado = email.toLowerCase().trim();
   
  const queryCheck = "SELECT idUsuario FROM usuarios WHERE email = ? LIMIT 1";
  connection.query(queryCheck, [emailNormalizado], async (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (rows.length > 0) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    try {
      const passwordHash = await bcrypt.hash(password, 10);

      const queryInsert = `
        INSERT INTO usuarios (nombre, apellido, email, telefono, rol, activo, passwordHash) 
        VALUES (?, ?, ?, ?, 'cliente', 1, ?)
      `;

      connection.query(
        queryInsert,
        [nombre, apellido, emailNormalizado, telefono || null, passwordHash],
         async (error, results) => {
          if (error) {
            console.error("Error al registrar usuario:", error);
            return res.status(500).json({ error: error.message });
          }
console.log("INSERT exitoso, id:", results.insertId);
          const nuevoId = results.insertId;

          const payload = { sub: nuevoId, rol: "cliente" };
          const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "2h",
          });
 console.log("Llamando a enviarEmailRegistro..."); // ← agregar
          await enviarEmailRegistro(emailNormalizado, nombre);
 console.log("enviarEmailRegistro terminó"); // ← agregar
          return res.status(201).json({
            token,
            user: {
              id: nuevoId,
              nombre,
              apellido,
              email,
              telefono: telefono || null,
              rol: "cliente",
              activo: 1,
            },
          });
        }
      );
    } catch (error) {
      console.error("Error hasheando contraseña:", error);
      return res.status(500).json({ error: "Error al registrar usuario" });
    }
  });
};

// POST /api/auth/forgot-password
export const solicitarRecuperacionPassword = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "El email es obligatorio" });
  }

  const emailNormalizado = email.toLowerCase().trim();

  // buscamos si existe el usuario
  const query = "SELECT idUsuario, nombre FROM usuarios WHERE email = ? LIMIT 1";
  connection.query(query, [emailNormalizado], async (error, results) => {
    if (error) return res.status(500).json({ error: error.message });

    // aunque no exista el email respondemos lo mismo
    // asi no se puede saber que emails estan o no registrados
    if (results.length === 0) {
      return res.status(200).json({
        message: "Si el email existe, vas a recibir un enlace para recuperar tu contraseña.",
      });
    }

    const user = results[0];

    // generamos un token simple con Date.now() y un numero random
    // Date.now() nos da el tiempo actual en milisegundos, siempre es unico
    const resetToken = Date.now().toString(36) + Math.random().toString(36).substring(2);

    // el token expira en 1 hora
    // Date.now() esta en milisegundos, 1000ms = 1s, 60s = 1min, 60min = 1hora
    const resetTokenExpira = new Date(Date.now() + 1000 * 60 * 60);

    // guardamos el token en la DB para verificarlo despues
    const queryUpdate = `
      UPDATE usuarios SET resetToken = ?, resetTokenExpira = ? WHERE idUsuario = ?
    `;

    connection.query(
      queryUpdate,
      [resetToken, resetTokenExpira, user.idUsuario],
      async (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // armamos el link que va en el mail
        const link = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // mandamos el mail con el link
        await enviarRecuperarContrasena(emailNormalizado, link);

        return res.status(200).json({
          message: "Si el email existe, vas a recibir un enlace para recuperar tu contraseña.",
        });
      }
    );
  });
};

// POST /api/auth/reset-password
export const resetearPassword = async (req, res) => {
  const { token, nuevaPassword } = req.body;

  if (!token || !nuevaPassword) {
    return res.status(400).json({ error: "Token y nueva contraseña son obligatorios" });
  }

  // buscamos el token en la DB y verificamos que no haya expirado
  // NOW() es una funcion de MySQL que devuelve la fecha y hora actual
  const query = `
    SELECT idUsuario FROM usuarios
    WHERE resetToken = ? AND resetTokenExpira > NOW()
    LIMIT 1
  `;

  connection.query(query, [token], async (error, results) => {
    if (error) return res.status(500).json({ error: error.message });

    // si el token no existe o ya expiro mandamos error
    if (results.length === 0) {
      return res.status(400).json({
        error: "El enlace no es válido o ya expiró. Pedí uno nuevo.",
      });
    }

    const user = results[0];

    try {
      // hasheamos la nueva password
      const passwordHash = await bcrypt.hash(nuevaPassword, 10);

      // actualizamos la password y borramos el token para que no se pueda usar de nuevo
      const queryUpdate = `
        UPDATE usuarios
        SET passwordHash = ?, resetToken = NULL, resetTokenExpira = NULL
        WHERE idUsuario = ?
      `;

      connection.query(queryUpdate, [passwordHash, user.idUsuario], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        return res.status(200).json({
          message: "Contraseña actualizada correctamente. Ya podés iniciar sesión.",
        });
      });
    } catch (error) {
      return res.status(500).json({ error: "Error al actualizar la contraseña" });
    }
  });
};