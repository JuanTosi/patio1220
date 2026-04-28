import connection from "../config/DB.js";

const verificarTamaniosActivos = async (conn, idProducto) => {
  const [tamanios] = await conn.query(
    "SELECT COUNT(*) as total FROM producto_tamanio WHERE idProducto = ? AND activo = 1",
    [idProducto]
  );
  return tamanios[0].total > 0;
};

const desactivarProductoSiNoTieneTamanosActivos = async (conn, idProducto) => {
  const tieneTamaniosActivos = await verificarTamaniosActivos(conn, idProducto);
  
  if (!tieneTamaniosActivos) {
    await conn.query(
      "UPDATE productos SET activo = 0 WHERE idProducto = ?",
      [idProducto]
    );
    return true;
  }
  return false;
};

const renombrarAUnicoSiCorresponde = async (conn, idProducto) => {
  const [tamanios] = await conn.query(
    "SELECT COUNT(*) as total FROM producto_tamanio WHERE idProducto = ?",
    [idProducto]
  );

  if (tamanios[0].total === 1) {
    let [tamanioUnico] = await conn.query(
      "SELECT idTamanio FROM tamanios WHERE nombreTamanio = 'Único' LIMIT 1"
    );

    let idTamanioUnico;

    if (tamanioUnico.length > 0) {
      idTamanioUnico = tamanioUnico[0].idTamanio;
    } else {
      const [nuevo] = await conn.query(
        "INSERT INTO tamanios (nombreTamanio) VALUES ('Único')"
      );
      idTamanioUnico = nuevo.insertId;
    }

    await conn.query(
      "UPDATE producto_tamanio SET idTamanio = ? WHERE idProducto = ?",
      [idTamanioUnico, idProducto]
    );
  }
};

// GET - OBTENER TODOS LOS PRODUCTOS
export const obtenerProductos = (req, res) => {
  const queryProductos = `
    SELECT 
      p.idProducto,
      p.nombreProducto,
      p.descripcionProducto,
      p.idCategoria,
      c.nombreCategoria AS categoriaNombre,
      p.imagenPrincipal,
      p.destacado,
      p.activo,
      COALESCE(SUM(CASE WHEN pt.activo = 1 THEN pt.stock ELSE 0 END), 0) AS stock
    FROM productos p
    LEFT JOIN categorias c ON p.idCategoria = c.idCategoria
    LEFT JOIN producto_tamanio pt ON p.idProducto = pt.idProducto
    WHERE p.eliminado = 0
    GROUP BY 
      p.idProducto, 
      p.nombreProducto, 
      p.descripcionProducto, 
      p.idCategoria, 
      c.nombreCategoria, 
      p.imagenPrincipal,
      p.destacado,
      p.activo
    ORDER BY p.idProducto ASC;
  `;

  connection.query(queryProductos, async (error, productos) => {
    if (error) {
      console.error("Error al obtener productos:", error);
      return res.status(500).json({ error: "Error al obtener los productos" });
    }

    if (!productos.length) return res.json([]);

    const ids = productos.map((p) => p.idProducto);
    const queryTamanios = `
      SELECT 
        pt.idProducto,
        pt.idTamanio,
        t.nombreTamanio,
        pt.dimension,
        pt.precio,
        pt.stock,
        pt.activo
      FROM producto_tamanio pt
      JOIN tamanios t ON pt.idTamanio = t.idTamanio
      WHERE pt.idProducto IN (?)
      ORDER BY t.nombreTamanio ASC
    `;

    connection.query(queryTamanios, [ids], (err, tamanios) => {
      if (err) {
        console.error("Error al obtener tamaños:", err);
        return res.status(500).json({ error: "Error al obtener tamaños" });
      }

      const productosConTamanios = productos.map((p) => ({
        ...p,
        tamanios: tamanios.filter((t) => t.idProducto === p.idProducto),
      }));

      res.json(productosConTamanios);
    });
  });
};

// GET x ID - OBTENER UN PRODUCTO POR ID
export const obtenerProductoPorID = (req, res) => {
  const { id } = req.params;

  const queryProducto = `
    SELECT 
      p.idProducto,
      p.nombreProducto,
      p.descripcionProducto,
      p.idCategoria,
      p.imagenPrincipal,
      p.destacado,
      p.activo,
      p.eliminado,
      p.fechaCreacion,
      p.fechaActualizacion,
      c.nombreCategoria AS categoriaProducto
    FROM productos p
    LEFT JOIN categorias c ON p.idCategoria = c.idCategoria
    WHERE p.idProducto = ?
  `;

  connection.query(queryProducto, [id], (error, productos) => {
    if (error) {
      console.error("Error al obtener producto:", error);
      return res.status(500).json({ error: "Error al obtener producto" });
    }

    if (!productos.length) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const producto = productos[0];

    const queryTamanios = `
      SELECT 
        pt.idTamanio,
        t.nombreTamanio,
        pt.dimension,
        pt.precio,
        pt.stock,
        pt.activo
      FROM producto_tamanio pt
      JOIN tamanios t ON pt.idTamanio = t.idTamanio
      WHERE pt.idProducto = ?
      ORDER BY t.nombreTamanio ASC
    `;

    connection.query(queryTamanios, [id], (err, tamanios) => {
      if (err) {
        console.error("Error al obtener tamaños:", err);
        return res.status(500).json({ error: "Error al obtener tamaños" });
      }

      res.json({
        ...producto,
        tamanios: tamanios,
      });
    });
  });
};

// POST - AGREGAR NUEVO PRODUCTO
export const agregarProducto = async (req, res) => {
  const {
    nombreProducto,
    descripcionProducto,
    idCategoria,
    imagenPrincipal,
    destacado,
    activo,
    tamanios = []
  } = req.body;

  if (!nombreProducto || !nombreProducto.trim()) {
    return res.status(400).json({ error: "El nombre del producto es obligatorio" });
  }

  if (!tamanios || tamanios.length === 0) {
    return res.status(400).json({ error: "Debe agregar al menos un tamaño" });
  }

  const conn = connection.promise();

  try {
    await conn.beginTransaction();

    // Insertar producto
    const [result] = await conn.query(
      `INSERT INTO productos (nombreProducto, descripcionProducto, idCategoria, imagenPrincipal, destacado, activo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nombreProducto,
        descripcionProducto || null,
        idCategoria || null,
        imagenPrincipal || null,
        destacado ? 1 : 0,
        activo ? 1 : 0
      ]
    );

    const idProducto = result.insertId;

    for (const tam of tamanios) {
      const { nombreTamanio, dimension, precio, stock, activo: activoTam } = tam;

      if (!nombreTamanio || !precio) {
        await conn.rollback();
        return res.status(400).json({ 
          error: "Cada tamaño debe tener nombre y precio" 
        });
      }

      const nombreNormalizado = nombreTamanio.trim()
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase());

      let [tamanioExistente] = await conn.query(
        "SELECT idTamanio FROM tamanios WHERE LOWER(nombreTamanio) = LOWER(?) LIMIT 1",
        [nombreNormalizado]
      );

      let idTamanio;

      if (tamanioExistente.length > 0) {
        idTamanio = tamanioExistente[0].idTamanio;
      } else {
        const [nuevoTamanio] = await conn.query(
          "INSERT INTO tamanios (nombreTamanio) VALUES (?)",
          [nombreNormalizado]
        );
        idTamanio = nuevoTamanio.insertId;
      }

      await conn.query(
        `INSERT INTO producto_tamanio (idProducto, idTamanio, dimension, precio, stock, activo)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          idProducto,
          idTamanio,
          dimension || null,
          precio,
          stock || 0,
          activoTam !== false
        ]
      );
    }

    await desactivarProductoSiNoTieneTamanosActivos(conn, idProducto);

    await conn.commit();

    const [productoCreado] = await conn.query(
      `SELECT * FROM productos WHERE idProducto = ?`,
      [idProducto]
    );

    const [tamaniosCreados] = await conn.query(
      `SELECT 
        pt.idTamanio,
        t.nombreTamanio,
        pt.dimension,
        pt.precio,
        pt.stock,
        pt.activo
       FROM producto_tamanio pt
       JOIN tamanios t ON pt.idTamanio = t.idTamanio
       WHERE pt.idProducto = ?`,
      [idProducto]
    );

    res.status(201).json({
      ...productoCreado[0],
      tamanios: tamaniosCreados
    });

  } catch (error) {
    await conn.rollback();
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: error.message });
  }
};

// PUT - EDITAR PRODUCTO
export const editarProducto = async (req, res) => {
  const idProducto = req.params.id;
  const {
    nombreProducto,
    descripcionProducto,
    idCategoria,
    imagenPrincipal,
    destacado,
    activo,
  } = req.body;

  try {
    const conn = connection.promise();

    await conn.query(
      `UPDATE productos 
       SET nombreProducto = ?, descripcionProducto = ?, idCategoria = ?, 
           imagenPrincipal = ?, destacado = ?, activo = ?
       WHERE idProducto = ?`,
      [
        nombreProducto,
        descripcionProducto || null,
        idCategoria || null,
        imagenPrincipal || null,
        destacado ? 1 : 0,
        activo ? 1 : 0,
        idProducto
      ]
    );

    const [productoActualizado] = await conn.query(
      `SELECT * FROM productos WHERE idProducto = ?`,
      [idProducto]
    );

    res.json(productoActualizado[0]);

  } catch (error) {
    console.error("Error al editar producto:", error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH - CAMBIAR DESTACADO
export const cambiarDestacadoProducto = async (req, res) => {
  const { id } = req.params;
  const { destacado } = req.body;

  const conn = connection.promise();

  try {
    await conn.query(
      "UPDATE productos SET destacado = ? WHERE idProducto = ?",
      [destacado ? 1 : 0, id]
    );

    const [producto] = await conn.query(
      "SELECT * FROM productos WHERE idProducto = ?",
      [id]
    );

    res.json(producto[0]);
  } catch (error) {
    console.error("Error al cambiar destacado:", error);
    res.status(500).json({ error: "Error al cambiar destacado" });
  }
};

// PATCH - CAMBIAR ESTADO ACTIVO/INACTIVO
export const cambiarEstadoProducto = async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;
  const activoNormalizado = activo ? 1 : 0;

  const conn = connection.promise();

  try {
    if (activoNormalizado === 1) {
      const tieneTamaniosActivos = await verificarTamaniosActivos(conn, id);
      
      if (!tieneTamaniosActivos) {
        return res.status(400).json({ 
          error: "No se puede activar el producto sin tamaños activos",
          requiereSeleccionTamanios: true
        });
      }
    }

    await conn.query("UPDATE productos SET activo = ? WHERE idProducto = ?", [activoNormalizado, id]);

    const [producto] = await conn.query("SELECT * FROM productos WHERE idProducto = ?", [id]);

    res.json(producto[0]);

  } catch (error) {
    console.error("Error al cambiar estado:", error);
    res.status(500).json({ error: "Error al cambiar estado" });
  }
};

// POST - ACTIVAR PRODUCTO CON SELECCIÓN DE TAMAÑOS
export const activarProductoConTamanios = async (req, res) => {
  const { id } = req.params;
  const { tamaniosSeleccionados } = req.body;

  if (!tamaniosSeleccionados || tamaniosSeleccionados.length === 0) {
    return res.status(400).json({ error: "Debe seleccionar al menos un tamaño" });
  }

  const conn = connection.promise();

  try {
    await conn.beginTransaction();

    for (const idTamanio of tamaniosSeleccionados) {
      await conn.query(
        "UPDATE producto_tamanio SET activo = 1 WHERE idProducto = ? AND idTamanio = ?",
        [id, idTamanio]
      );
    }

    await conn.query("UPDATE productos SET activo = 1 WHERE idProducto = ?", [id]);

    await conn.commit();

    const [producto] = await conn.query("SELECT * FROM productos WHERE idProducto = ?", [id]);

    res.json({
      ...producto[0],
      tamaniosActivados: tamaniosSeleccionados.length
    });

  } catch (error) {
    await conn.rollback();
    console.error("Error al activar producto con tamaños:", error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE - ELIMINAR PRODUCTO
export const eliminarProducto = async (req, res) => {
  const { id } = req.params;
  const conn = connection.promise();
  
  try {
    await conn.beginTransaction();
    await conn.query("DELETE FROM producto_tamanio WHERE idProducto = ?", [id]);
    await conn.query("DELETE FROM productos WHERE idProducto = ?", [id]);
    await conn.commit();

    res.json({ message: "Producto eliminado correctamente", idProducto: id });
  } catch (error) {
    await conn.rollback();
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: "Error al eliminar producto o sus tamaños" });
  }
};

// GET - OBTENER TAMAÑOS DE UN PRODUCTO
export const obtenerTamaniosProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const conn = connection.promise();

    const [tamanios] = await conn.query(
      `SELECT 
        pt.idTamanio,
        t.nombreTamanio,
        pt.dimension,
        pt.precio,
        pt.stock,
        pt.activo
      FROM producto_tamanio pt
      JOIN tamanios t ON pt.idTamanio = t.idTamanio
      WHERE pt.idProducto = ?
      ORDER BY t.nombreTamanio ASC`,
      [id]
    );

    res.json(tamanios);
  } catch (error) {
    console.error("Error al obtener tamaños del producto:", error);
    res.status(500).json({ error: error.message });
  }
};

// POST - AGREGAR TAMAÑO
export const agregarTamanioAProducto = async (req, res) => {
  const { id } = req.params;
  const { nombreTamanio, dimension, precio, stock, activo } = req.body;

  if (!nombreTamanio || !precio) {
    return res.status(400).json({ error: "nombreTamanio y precio son obligatorios" });
  }

  const conn = connection.promise();

  try {
    const [producto] = await conn.query(
      "SELECT idProducto FROM productos WHERE idProducto = ?",
      [id]
    );

    if (!producto.length) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const nombreNormalizado = nombreTamanio.trim()
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());

    let [tamanioExistente] = await conn.query(
      "SELECT idTamanio FROM tamanios WHERE LOWER(nombreTamanio) = LOWER(?) LIMIT 1",
      [nombreNormalizado]
    );

    let idTamanio;

    if (tamanioExistente.length > 0) {
      idTamanio = tamanioExistente[0].idTamanio;
    } else {
      const [nuevoTamanio] = await conn.query(
        "INSERT INTO tamanios (nombreTamanio) VALUES (?)",
        [nombreNormalizado]
      );
      idTamanio = nuevoTamanio.insertId;
    }

    const [yaExiste] = await conn.query(
      "SELECT * FROM producto_tamanio WHERE idProducto = ? AND idTamanio = ?",
      [id, idTamanio]
    );

    if (yaExiste.length > 0) {
      return res.status(400).json({ 
        error: `El tamaño "${nombreNormalizado}" ya está asociado a este producto` 
      });
    }

    await conn.query(
      `INSERT INTO producto_tamanio (idProducto, idTamanio, dimension, precio, stock, activo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, idTamanio, dimension || null, precio, stock || 0, activo !== false]
    );

    const [tamanioAgregado] = await conn.query(
      `SELECT 
        pt.idTamanio,
        t.nombreTamanio,
        pt.dimension,
        pt.precio,
        pt.stock,
        pt.activo
      FROM producto_tamanio pt
      JOIN tamanios t ON pt.idTamanio = t.idTamanio
      WHERE pt.idProducto = ? AND pt.idTamanio = ?`,
      [id, idTamanio]
    );

    res.status(201).json(tamanioAgregado[0]);
  } catch (error) {
    console.error("Error al agregar tamaño:", error);
    res.status(500).json({ error: error.message });
  }
};

// PUT - EDITAR TAMAÑO
export const editarTamanioDeProducto = async (req, res) => {
  const { id, idTamanio } = req.params;
  const { dimension, precio, stock, activo } = req.body;

  const conn = connection.promise();

  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `UPDATE producto_tamanio 
       SET dimension = ?, precio = ?, stock = ?, activo = ?
       WHERE idProducto = ? AND idTamanio = ?`,
      [dimension || null, precio, stock || 0, activo !== false, id, idTamanio]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Tamaño no encontrado" });
    }

    const seDesactivo = await desactivarProductoSiNoTieneTamanosActivos(conn, id);

    await conn.commit();

    res.json({ 
      success: true, 
      message: "Tamaño actualizado",
      productoDesactivado: seDesactivo
    });

  } catch (error) {
    await conn.rollback();
    console.error("Error al editar tamaño:", error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE - ELIMINAR TAMAÑO
export const eliminarTamanioDeProducto = async (req, res) => {
  const { id, idTamanio } = req.params;

  const conn = connection.promise();

  try {
    await conn.beginTransaction();

    const [tamanios] = await conn.query(
      "SELECT COUNT(*) as total FROM producto_tamanio WHERE idProducto = ?",
      [id]
    );

    if (tamanios[0].total <= 1) {
      await conn.rollback();
      return res.status(400).json({ 
        error: "No se puede eliminar el último tamaño" 
      });
    }

    const [result] = await conn.query(
      "DELETE FROM producto_tamanio WHERE idProducto = ? AND idTamanio = ?",
      [id, idTamanio]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Tamaño no encontrado" });
    }

    await renombrarAUnicoSiCorresponde(conn, id);

    const seDesactivo = await desactivarProductoSiNoTieneTamanosActivos(conn, id);

    await conn.commit();

    res.json({ 
      success: true, 
      message: "Tamaño eliminado",
      productoDesactivado: seDesactivo
    });

  } catch (error) {
    await conn.rollback();
    console.error("Error al eliminar tamaño:", error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH - MOVER PRODUCTO A PAPELERA (borrado lógico)
export const moverAPapelera = async (req, res) => {
  const { id } = req.params;
  const conn = connection.promise();

  try {
    const [result] = await conn.query(
      "UPDATE productos SET eliminado = 1, activo = 0 WHERE idProducto = ? AND eliminado = 0",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado o ya está en papelera" });
    }

    res.json({ message: "Producto movido a papelera", idProducto: id });
  } catch (error) {
    console.error("Error al mover producto a papelera:", error);
    res.status(500).json({ error: "Error al mover producto a papelera" });
  }
};

// PATCH - RESTAURAR PRODUCTO DESDE PAPELERA
export const restaurarProducto = async (req, res) => {
  const { id } = req.params;
  const conn = connection.promise();

  try {
    const [result] = await conn.query(
      "UPDATE productos SET eliminado = 0 WHERE idProducto = ? AND eliminado = 1",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado o no está en papelera" });
    }

    res.json({ message: "Producto restaurado correctamente", idProducto: id });
  } catch (error) {
    console.error("Error al restaurar producto:", error);
    res.status(500).json({ error: "Error al restaurar producto" });
  }
};

// GET - OBTENER PRODUCTOS EN PAPELERA
export const obtenerPapelera = async (req, res) => {
  const conn = connection.promise();

  try {
    const [productos] = await conn.query(
      `SELECT 
        p.idProducto,
        p.nombreProducto,
        p.idCategoria,
        c.nombreCategoria AS categoriaNombre,
        p.imagenPrincipal,
        p.fechaActualizacion AS fechaEliminacion
      FROM productos p
      LEFT JOIN categorias c ON p.idCategoria = c.idCategoria
      WHERE p.eliminado = 1
      ORDER BY p.fechaActualizacion DESC`
    );

    res.json(productos);
  } catch (error) {
    console.error("Error al obtener papelera:", error);
    res.status(500).json({ error: "Error al obtener papelera" });
  }
};