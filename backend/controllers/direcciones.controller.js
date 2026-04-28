import connection from "../config/DB.js";

// GET - OBTENER DIRECCIONES DE USUARIO LOGEADO
export const obtenerMisDirecciones = (req, res) => {
  const idUsuario = req.user?.idUsuario;

  if (!idUsuario) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const query = `
    SELECT 
      idDireccion,
      alias,
      calle,
      numero,
      piso,
      departamento,
      localidad,
      provincia,
      codigoPostal,
      referencia,
      esPrincipal
    FROM direcciones_usuarios
    WHERE idUsuario = ?
    ORDER BY esPrincipal DESC, idDireccion ASC
  `;

  connection.query(query, [idUsuario], (error, results) => {
    if (error) {
      console.error("Error al obtener direcciones:", error);
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(results);
  });
};

// GET - OBTENER DIRECCION POR ID DEL USUARIO LOGEADO
export const obtenerDireccionPorId = (req, res) => {
  const idUsuario = req.user?.idUsuario;
  const { id } = req.params;

  if (!idUsuario) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const query = `
    SELECT 
      idDireccion,
      alias,
      calle,
      numero,
      piso,
      departamento,
      localidad,
      provincia,
      codigoPostal,
      referencia,
      esPrincipal
    FROM direcciones_usuarios
    WHERE idDireccion = ? AND idUsuario = ?
  `;

  connection.query(query, [id, idUsuario], (error, results) => {
    if (error) {
      console.error("Error al obtener dirección:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!results.length) {
      return res.status(404).json({ error: "Dirección no encontrada" });
    }

    res.status(200).json(results[0]);
  });
};

// POST - AGREGAR DIRECCION
export const agregarDireccion = (req, res) => {
  const idUsuario = req.user?.idUsuario;
  const {
    alias,
    calle,
    numero,
    piso,
    departamento,
    localidad,
    provincia,
    codigoPostal,
    referencia,
    esPrincipal
  } = req.body;

  if (!idUsuario) {
    return res.status(401).json({ error: "No autenticado" });
  }

  if (!calle || !numero || !localidad || !provincia) {
    return res.status(400).json({ error: "Faltan datos obligatorios (calle, número, localidad, provincia)" });
  }

  if (esPrincipal) {
    connection.query(
      "UPDATE direcciones_usuarios SET esPrincipal = 0 WHERE idUsuario = ?",
      [idUsuario],
      (err) => {
        if (err) console.error("Error al actualizar direcciones principales:", err);
      }
    );
  }

  const query = `
    INSERT INTO direcciones_usuarios 
    (idUsuario, alias, calle, numero, piso, departamento, localidad, provincia, codigoPostal, referencia, esPrincipal)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    idUsuario,
    alias || null,
    calle.trim(),
    numero.trim(),
    piso || null,
    departamento || null,
    localidad.trim(),
    provincia.trim(),
    codigoPostal || null,
    referencia || null,
    esPrincipal ? 1 : 0
  ];

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error("Error al agregar dirección:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      idDireccion: results.insertId,
      success: true
    });
  });
};

// PUT - EDITAR DATOS DE UNA DIRECCION
export const editarDireccion = (req, res) => {
  const idUsuario = req.user?.idUsuario;
  const { id } = req.params;
  const {
    alias,
    calle,
    numero,
    piso,
    departamento,
    localidad,
    provincia,
    codigoPostal,
    referencia,
    esPrincipal
  } = req.body;

  if (!idUsuario) {
    return res.status(401).json({ error: "No autenticado" });
  }

  if (!calle || !numero || !localidad || !provincia) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  if (esPrincipal) {
    connection.query(
      "UPDATE direcciones_usuarios SET esPrincipal = 0 WHERE idUsuario = ? AND idDireccion != ?",
      [idUsuario, id],
      (err) => {
        if (err) console.error("Error al actualizar direcciones principales:", err);
      }
    );
  }

  const query = `
    UPDATE direcciones_usuarios 
    SET alias=?, calle=?, numero=?, piso=?, departamento=?, localidad=?, provincia=?, codigoPostal=?, referencia=?, esPrincipal=?
    WHERE idDireccion = ? AND idUsuario = ?
  `;

  const values = [
    alias || null,
    calle.trim(),
    numero.trim(),
    piso || null,
    departamento || null,
    localidad.trim(),
    provincia.trim(),
    codigoPostal || null,
    referencia || null,
    esPrincipal ? 1 : 0,
    id,
    idUsuario
  ];

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error("Error al editar dirección:", error);
      return res.status(500).json({ error: error.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Dirección no encontrada" });
    }

    res.status(200).json({ success: true });
  });
};

// DELETE - ELIMINAR DIRECCION
export const eliminarDireccion = (req, res) => {
  const idUsuario = req.user?.idUsuario;
  const { id } = req.params;

  if (!idUsuario) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const query = "DELETE FROM direcciones_usuarios WHERE idDireccion = ? AND idUsuario = ?";

  connection.query(query, [id, idUsuario], (error, results) => {
    if (error) {
      console.error("Error al eliminar dirección:", error);
      return res.status(500).json({ error: error.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Dirección no encontrada" });
    }

    res.status(200).json({ success: true, message: "Dirección eliminada" });
  });
};

// PATCH - ESTADO PARA MARCAR COMO DIRECCION PRINCIPAL
export const marcarDireccionPrincipal = (req, res) => {
  const idUsuario = req.user?.idUsuario;
  const { id } = req.params;

  if (!idUsuario) {
    return res.status(401).json({ error: "No autenticado" });
  }

  connection.query(
    "UPDATE direcciones_usuarios SET esPrincipal = 0 WHERE idUsuario = ?",
    [idUsuario],
    (error) => {
      if (error) {
        console.error("Error al actualizar direcciones:", error);
        return res.status(500).json({ error: error.message });
      }

      const query = "UPDATE direcciones_usuarios SET esPrincipal = 1 WHERE idDireccion = ? AND idUsuario = ?";

      connection.query(query, [id, idUsuario], (err, results) => {
        if (err) {
          console.error("Error al marcar dirección principal:", err);
          return res.status(500).json({ error: err.message });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Dirección no encontrada" });
        }

        res.status(200).json({ success: true });
      });
    }
  );
};