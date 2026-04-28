import connection from "../config/DB.js";

// GET - OBTENER TODOS LOS ESTADOS DE RESERVA
export const obtenerEstadosReserva = (req, res) => {
  const query = `
    SELECT 
      idEstado,
      nombreEstado,
      descripcion,
      color,
      ordenVisualizacion,
      esEstadoFinal,
      activo
    FROM estados_reserva
    ORDER BY ordenVisualizacion ASC
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error al obtener estados:", error);
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(results);
  });
};

// GET - OBTENER ESTADOS ACTIVOS
export const obtenerEstadosActivos = (req, res) => {
  const query = `
    SELECT 
      idEstado,
      nombreEstado,
      descripcion,
      color,
      ordenVisualizacion
    FROM estados_reserva
    WHERE activo = 1
    ORDER BY ordenVisualizacion ASC
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error al obtener estados activos:", error);
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(results);
  });
};

// GET - OBTENER UN ESTADO POR ID
export const obtenerEstadoPorId = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      idEstado,
      nombreEstado,
      descripcion,
      color,
      ordenVisualizacion,
      esEstadoFinal,
      activo
    FROM estados_reserva
    WHERE idEstado = ?
  `;

  connection.query(query, [id], (error, results) => {
    if (error) {
      console.error("Error al obtener estado:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!results.length) {
      return res.status(404).json({ error: "Estado no encontrado" });
    }

    res.status(200).json(results[0]);
  });
};

// POST - CREAR NUEVO ESTADO
export const crearEstado = (req, res) => {
  const {
    nombreEstado,
    descripcion,
    color,
    ordenVisualizacion,
    esEstadoFinal,
    activo
  } = req.body;

  if (!nombreEstado || !nombreEstado.trim()) {
    return res.status(400).json({ error: "El nombre del estado es obligatorio" });
  }

  const query = `
    INSERT INTO estados_reserva 
    (nombreEstado, descripcion, color, ordenVisualizacion, esEstadoFinal, activo)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    nombreEstado.trim(),
    descripcion || null,
    color || '#6B7280',
    ordenVisualizacion || 0,
    esEstadoFinal ? 1 : 0,
    activo !== undefined ? (activo ? 1 : 0) : 1
  ];

  connection.query(query, values, (error, results) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Ya existe un estado con ese nombre" });
      }
      console.error("Error al crear estado:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      idEstado: results.insertId,
      success: true
    });
  });
};

// PUT - EDITAR ESTADO
export const editarEstado = (req, res) => {
  const { id } = req.params;
  const {
    nombreEstado,
    descripcion,
    color,
    ordenVisualizacion,
    esEstadoFinal,
    activo
  } = req.body;

  if (!nombreEstado || !nombreEstado.trim()) {
    return res.status(400).json({ error: "El nombre del estado es obligatorio" });
  }

  const query = `
    UPDATE estados_reserva 
    SET nombreEstado = ?, descripcion = ?, color = ?, ordenVisualizacion = ?, 
        esEstadoFinal = ?, activo = ?
    WHERE idEstado = ?
  `;

  const values = [
    nombreEstado.trim(),
    descripcion || null,
    color || '#6B7280',
    ordenVisualizacion || 0,
    esEstadoFinal ? 1 : 0,
    activo ? 1 : 0,
    id
  ];

  connection.query(query, values, (error, results) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Ya existe un estado con ese nombre" });
      }
      console.error("Error al editar estado:", error);
      return res.status(500).json({ error: error.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Estado no encontrado" });
    }

    res.status(200).json({ success: true });
  });
};

// DELETE - ELIMINAR ESTADO
export const eliminarEstado = (req, res) => {
  const { id } = req.params;

  const queryCheck = "SELECT COUNT(*) as total FROM reservas WHERE idEstado = ?";

  connection.query(queryCheck, [id], (error, results) => {
    if (error) {
      console.error("Error al verificar reservas:", error);
      return res.status(500).json({ error: error.message });
    }

    if (results[0].total > 0) {
      return res.status(409).json({
        error: "No se puede eliminar el estado porque tiene reservas asociadas"
      });
    }

    const queryDelete = "DELETE FROM estados_reserva WHERE idEstado = ?";

    connection.query(queryDelete, [id], (err, deleteResults) => {
      if (err) {
        console.error("Error al eliminar estado:", err);
        return res.status(500).json({ error: err.message });
      }

      if (deleteResults.affectedRows === 0) {
        return res.status(404).json({ error: "Estado no encontrado" });
      }

      res.status(200).json({ success: true, message: "Estado eliminado correctamente" });
    });
  });
};