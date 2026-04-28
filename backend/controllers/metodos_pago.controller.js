import connection from "../config/DB.js";

// GET - OBTENER TODOS LOS MÉTODOS DE PAGO
export const obtenerMetodosPago = (req, res) => {
  const query = `
    SELECT 
      idMetodoPago,
      nombreMetodo,
      descripcion,
      activo
    FROM metodos_pago
    ORDER BY nombreMetodo ASC
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error al obtener métodos de pago:", error);
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(results);
  });
};

// GET - OBTENER MÉTODOS DE PAGO ACTIVOS
export const obtenerMetodosPagoActivos = (req, res) => {
  const query = `
    SELECT 
      idMetodoPago,
      nombreMetodo,
      descripcion
    FROM metodos_pago
    WHERE activo = 1
    ORDER BY nombreMetodo ASC
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error al obtener métodos de pago activos:", error);
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(results);
  });
};

// GET - OBTENER UN MÉTODO DE PAGO POR ID
export const obtenerMetodoPagoPorId = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      idMetodoPago,
      nombreMetodo,
      descripcion,
      activo
    FROM metodos_pago
    WHERE idMetodoPago = ?
  `;

  connection.query(query, [id], (error, results) => {
    if (error) {
      console.error("Error al obtener método de pago:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!results.length) {
      return res.status(404).json({ error: "Método de pago no encontrado" });
    }

    res.status(200).json(results[0]);
  });
};

// POST - CREAR NUEVO MÉTODO DE PAGO
export const crearMetodoPago = (req, res) => {
  const { nombreMetodo, descripcion, activo } = req.body;

  if (!nombreMetodo || !nombreMetodo.trim()) {
    return res.status(400).json({ error: "El nombre del método de pago es obligatorio" });
  }

  const query = `
    INSERT INTO metodos_pago (nombreMetodo, descripcion, activo)
    VALUES (?, ?, ?)
  `;

  const values = [
    nombreMetodo.trim(),
    descripcion || null,
    activo !== undefined ? (activo ? 1 : 0) : 1
  ];

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error("Error al crear método de pago:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      idMetodoPago: results.insertId,
      nombreMetodo,
      descripcion: descripcion || null,
      activo: activo !== undefined ? (activo ? 1 : 0) : 1
    });
  });
};

// PUT - EDITAR MÉTODO DE PAGO
export const editarMetodoPago = (req, res) => {
  const { id } = req.params;
  const { nombreMetodo, descripcion, activo } = req.body;

  if (!nombreMetodo || !nombreMetodo.trim()) {
    return res.status(400).json({ error: "El nombre del método de pago es obligatorio" });
  }

  const query = `
    UPDATE metodos_pago 
    SET nombreMetodo = ?, descripcion = ?, activo = ?
    WHERE idMetodoPago = ?
  `;

  const values = [
    nombreMetodo.trim(),
    descripcion || null,
    activo ? 1 : 0,
    id
  ];

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error("Error al editar método de pago:", error);
      return res.status(500).json({ error: error.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Método de pago no encontrado" });
    }

    res.status(200).json({ success: true });
  });
};

// DELETE - ELIMINAR MÉTODO DE PAGO
export const eliminarMetodoPago = (req, res) => {
  const { id } = req.params;

  const queryCheck = "SELECT COUNT(*) as total FROM reservas WHERE idMetodoPago = ?";

  connection.query(queryCheck, [id], (error, results) => {
    if (error) {
      console.error("Error al verificar reservas:", error);
      return res.status(500).json({ error: error.message });
    }

    if (results[0].total > 0) {
      return res.status(409).json({
        error: "No se puede eliminar el método de pago porque tiene reservas asociadas"
      });
    }

    const queryDelete = "DELETE FROM metodos_pago WHERE idMetodoPago = ?";

    connection.query(queryDelete, [id], (err, deleteResults) => {
      if (err) {
        console.error("Error al eliminar método de pago:", err);
        return res.status(500).json({ error: err.message });
      }

      if (deleteResults.affectedRows === 0) {
        return res.status(404).json({ error: "Método de pago no encontrado" });
      }

      res.status(200).json({ success: true, message: "Método de pago eliminado correctamente" });
    });
  });
};