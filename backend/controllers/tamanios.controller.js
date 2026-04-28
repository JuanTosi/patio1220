import connection from "../config/DB.js";

// GET - OBTENER TODOS LOS TAMAÑOS
export const obtenerTamanios = (req, res) => {
  const query = `
    SELECT 
      idTamanio,
      nombreTamanio,
      abreviatura,
      ordenVisualizacion,
      activo
    FROM tamanios
    ORDER BY ordenVisualizacion ASC, nombreTamanio ASC
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error al obtener tamaños:", error);
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(results);
  });
};

// GET - OBTENER TAMAÑOS ACTIVOS
export const obtenerTamaniosActivos = (req, res) => {
  const query = `
    SELECT 
      idTamanio,
      nombreTamanio,
      abreviatura,
      ordenVisualizacion
    FROM tamanios
    WHERE activo = 1
    ORDER BY ordenVisualizacion ASC, nombreTamanio ASC
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error al obtener tamaños activos:", error);
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(results);
  });
};

// GET - OBTENER UN TAMAÑO POR ID
export const obtenerTamanioPorId = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      idTamanio,
      nombreTamanio,
      abreviatura,
      ordenVisualizacion,
      activo
    FROM tamanios
    WHERE idTamanio = ?
  `;

  connection.query(query, [id], (error, results) => {
    if (error) {
      console.error("Error al obtener tamaño:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!results.length) {
      return res.status(404).json({ error: "Tamaño no encontrado" });
    }

    res.status(200).json(results[0]);
  });
};

// POST - CREAR NUEVO TAMAÑO
export const crearTamanio = (req, res) => {
  const { nombreTamanio, abreviatura, ordenVisualizacion, activo } = req.body;

  if (!nombreTamanio || !nombreTamanio.trim()) {
    return res.status(400).json({ error: "El nombre del tamaño es obligatorio" });
  }

  const query = `
    INSERT INTO tamanios (nombreTamanio, abreviatura, ordenVisualizacion, activo)
    VALUES (?, ?, ?, ?)
  `;

  const values = [
    nombreTamanio.trim(),
    abreviatura ? abreviatura.trim() : null,
    ordenVisualizacion || 0,
    activo !== undefined ? (activo ? 1 : 0) : 1
  ];

  connection.query(query, values, (error, results) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Ya existe un tamaño con ese nombre" });
      }
      console.error("Error al crear tamaño:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      idTamanio: results.insertId,
      nombreTamanio,
      abreviatura: abreviatura || null,
      ordenVisualizacion: ordenVisualizacion || 0,
      activo: activo !== undefined ? (activo ? 1 : 0) : 1
    });
  });
};

// PUT - EDITAR TAMAÑO
export const editarTamanio = (req, res) => {
  const { id } = req.params;
  const { nombreTamanio, abreviatura, ordenVisualizacion, activo } = req.body;

  if (!nombreTamanio || !nombreTamanio.trim()) {
    return res.status(400).json({ error: "El nombre del tamaño es obligatorio" });
  }

  const query = `
    UPDATE tamanios 
    SET nombreTamanio = ?, abreviatura = ?, ordenVisualizacion = ?, activo = ?
    WHERE idTamanio = ?
  `;

  const values = [
    nombreTamanio.trim(),
    abreviatura ? abreviatura.trim() : null,
    ordenVisualizacion || 0,
    activo ? 1 : 0,
    id
  ];

  connection.query(query, values, (error, results) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Ya existe un tamaño con ese nombre" });
      }
      console.error("Error al editar tamaño:", error);
      return res.status(500).json({ error: error.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Tamaño no encontrado" });
    }

    res.status(200).json({ success: true });
  });
};

// DELETE - ELIMINAR TAMAÑO
export const eliminarTamanio = (req, res) => {
  const { id } = req.params;

  const queryCheck = "SELECT COUNT(*) as total FROM producto_tamanio WHERE idTamanio = ?";

  connection.query(queryCheck, [id], (error, results) => {
    if (error) {
      console.error("Error al verificar productos:", error);
      return res.status(500).json({ error: error.message });
    }

    if (results[0].total > 0) {
      return res.status(409).json({
        error: "No se puede eliminar el tamaño porque tiene productos asociados"
      });
    }

    const queryDelete = "DELETE FROM tamanios WHERE idTamanio = ?";

    connection.query(queryDelete, [id], (err, deleteResults) => {
      if (err) {
        console.error("Error al eliminar tamaño:", err);
        return res.status(500).json({ error: err.message });
      }

      if (deleteResults.affectedRows === 0) {
        return res.status(404).json({ error: "Tamaño no encontrado" });
      }

      res.status(200).json({ success: true, message: "Tamaño eliminado correctamente" });
    });
  });
};