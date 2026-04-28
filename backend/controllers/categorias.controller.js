import connection from "../config/DB.js";

// GET - OBTENER TODAS LAS CATEGORÍAS
export const obtenerCategorias = (req, res) => {
  const query = `
    SELECT 
      idCategoria,
      nombreCategoria,
      descripcionCategoria,
      activo,
      ordenVisualizacion
    FROM categorias
    ORDER BY ordenVisualizacion ASC, nombreCategoria ASC
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error al obtener categorías:", error);
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(results);
  });
};

// GET - OBTENER CATEGORÍAS ACTIVAS
export const obtenerCategoriasActivas = (req, res) => {
  const query = `
    SELECT 
      idCategoria,
      nombreCategoria,
      descripcionCategoria,
      ordenVisualizacion
    FROM categorias
    WHERE activo = 1
    ORDER BY ordenVisualizacion ASC, nombreCategoria ASC
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error al obtener categorías activas:", error);
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(results);
  });
};

// GET - OBTENER UNA CATEGORÍA POR ID
export const obtenerCategoriaPorId = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      idCategoria,
      nombreCategoria,
      descripcionCategoria,
      activo,
      ordenVisualizacion
    FROM categorias
    WHERE idCategoria = ?
  `;

  connection.query(query, [id], (error, results) => {
    if (error) {
      console.error("Error al obtener categoría:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!results.length) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.status(200).json(results[0]);
  });
};

// POST - CREAR NUEVA CATEGORÍA
export const crearCategoria = (req, res) => {
  const { nombreCategoria, descripcionCategoria, activo, ordenVisualizacion } = req.body;

  if (!nombreCategoria || !nombreCategoria.trim()) {
    return res.status(400).json({ error: "El nombre de la categoría es obligatorio" });
  }

  const query = `
    INSERT INTO categorias (nombreCategoria, descripcionCategoria, activo, ordenVisualizacion)
    VALUES (?, ?, ?, ?)
  `;

  const values = [
    nombreCategoria.trim(),
    descripcionCategoria || null,
    activo !== undefined ? (activo ? 1 : 0) : 1,
    ordenVisualizacion || 0
  ];

  connection.query(query, values, (error, results) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Ya existe una categoría con ese nombre" });
      }
      console.error("Error al crear categoría:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      idCategoria: results.insertId,
      nombreCategoria,
      descripcionCategoria: descripcionCategoria || null,
      activo: activo !== undefined ? (activo ? 1 : 0) : 1,
      ordenVisualizacion: ordenVisualizacion || 0
    });
  });
};

// PUT - EDITAR CATEGORÍA
export const editarCategoria = (req, res) => {
  const { id } = req.params;
  const { nombreCategoria, descripcionCategoria, activo, ordenVisualizacion } = req.body;

  if (!nombreCategoria || !nombreCategoria.trim()) {
    return res.status(400).json({ error: "El nombre de la categoría es obligatorio" });
  }

  const query = `
    UPDATE categorias 
    SET nombreCategoria = ?, descripcionCategoria = ?, activo = ?, ordenVisualizacion = ?
    WHERE idCategoria = ?
  `;

  const values = [
    nombreCategoria.trim(),
    descripcionCategoria || null,
    activo ? 1 : 0,
    ordenVisualizacion || 0,
    id
  ];

  connection.query(query, values, (error, results) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Ya existe una categoría con ese nombre" });
      }
      console.error("Error al editar categoría:", error);
      return res.status(500).json({ error: error.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.status(200).json({ success: true });
  });
};

// DELETE - ELIMINAR CATEGORÍA
export const eliminarCategoria = (req, res) => {
  const { id } = req.params;

  const queryCheck = "SELECT COUNT(*) as total FROM productos WHERE idCategoria = ?";

  connection.query(queryCheck, [id], (error, results) => {
    if (error) {
      console.error("Error al verificar productos:", error);
      return res.status(500).json({ error: error.message });
    }

    if (results[0].total > 0) {
      return res.status(409).json({
        error: "No se puede eliminar la categoría porque tiene productos asociados"
      });
    }

    const queryDelete = "DELETE FROM categorias WHERE idCategoria = ?";

    connection.query(queryDelete, [id], (err, deleteResults) => {
      if (err) {
        console.error("Error al eliminar categoría:", err);
        return res.status(500).json({ error: err.message });
      }

      if (deleteResults.affectedRows === 0) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }

      res.status(200).json({ success: true, message: "Categoría eliminada correctamente" });
    });
  });
};