import connection from "../config/DB.js";
import { enviarEmailReserva } from "../service/email.service.js";

// GET - Obtener mis reservas (usuario logeado)
export const obtenerMisReservas = async (req, res) => {
  const idUsuario = req.user?.idUsuario;

  if (!idUsuario) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const queryReservas = `
    SELECT 
      r.idReserva,
      r.fechaReserva,
      r.fechaRetiroEstimada,
      r.totalReserva AS total,
      r.tipoEntrega,
      r.pagado,
      r.observaciones,
      r.idEstado,
      e.nombreEstado,
      e.color AS colorEstado,
      mp.nombreMetodo,
      CONCAT(d.calle, ' ', d.numero, 
        CASE WHEN d.piso IS NOT NULL THEN CONCAT(', Piso ', d.piso) ELSE '' END,
        CASE WHEN d.departamento IS NOT NULL THEN CONCAT(' Depto ', d.departamento) ELSE '' END,
        ', ', d.localidad, ', ', d.provincia
      ) AS direccionCompleta
    FROM reservas r
    LEFT JOIN estados_reserva e ON r.idEstado = e.idEstado
    LEFT JOIN metodos_pago mp ON r.idMetodoPago = mp.idMetodoPago
    LEFT JOIN direcciones_usuarios d ON r.idDireccion = d.idDireccion
    WHERE r.idUsuario = ?
    ORDER BY r.fechaReserva DESC
  `;

  const queryDetalle = `
    SELECT 
      idReserva,
      nombreProducto,
      nombreTamanio,
      dimension,
      cantidad,
      precioUnitario,
      subtotal
    FROM detalle_reservas
    WHERE idReserva IN (?)
  `;

  try {
    const conn = connection.promise();
    
    const [reservas] = await conn.query(queryReservas, [idUsuario]);

    if (reservas.length === 0) {
      return res.status(200).json([]);
    }

    const idsReservas = reservas.map(r => r.idReserva);

    const [detalles] = await conn.query(queryDetalle, [idsReservas]);

    const reservasConProductos = reservas.map(reserva => ({
      ...reserva,
      productos: detalles.filter(d => d.idReserva === reserva.idReserva)
    }));

    res.status(200).json(reservasConProductos);
  } catch (error) {
    console.error("Error al obtener mis reservas:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET - Obtener detalle completo de una reserva (usuario logeado)
export const obtenerDetalleReserva = (req, res) => {
  const idUsuario = req.user?.idUsuario;
  const { id } = req.params;

  if (!idUsuario) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const queryReserva = `
    SELECT 
      r.idReserva,
      r.fechaReserva,
      r.fechaRetiroEstimada,
      r.totalReserva,
      r.tipoEntrega,
      r.pagado,
      r.observaciones,
      r.createdAt,
      r.updatedAt,
      e.nombreEstado,
      e.descripcion AS descripcionEstado,
      e.color AS colorEstado,
      mp.nombreMetodo AS metodoPago,
      mp.descripcion AS descripcionMetodoPago,
      d.calle,
      d.numero,
      d.piso,
      d.departamento,
      d.localidad,
      d.provincia,
      d.codigoPostal,
      d.referencia
    FROM reservas r
    LEFT JOIN estados_reserva e ON r.idEstado = e.idEstado
    LEFT JOIN metodos_pago mp ON r.idMetodoPago = mp.idMetodoPago
    LEFT JOIN direcciones_usuarios d ON r.idDireccion = d.idDireccion
    WHERE r.idReserva = ? AND r.idUsuario = ?
  `;

  connection.query(queryReserva, [id, idUsuario], (error, reservaResults) => {
    if (error) {
      console.error("Error al obtener reserva:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!reservaResults.length) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const reserva = reservaResults[0];

    const queryDetalle = `
      SELECT 
        dr.idDetalle,
        dr.nombreProducto,
        dr.nombreTamanio,
        dr.dimension,
        dr.cantidad,
        dr.precioUnitario,
        dr.subtotal
      FROM detalle_reservas dr
      WHERE dr.idReserva = ?
    `;

    connection.query(queryDetalle, [id], (err, detalleResults) => {
      if (err) {
        console.error("Error al obtener detalle de reserva:", err);
        return res.status(500).json({ error: err.message });
      }

      res.status(200).json({
        ...reserva,
        productos: detalleResults
      });
    });
  });
};

// POST - Crear nueva reserva 
export const crearReserva = async (req, res) => {
  const idUsuario = req.user?.idUsuario;
  const {
    nombreCliente,
    apellidoCliente,
    emailCliente,
    telefonoCliente,
    idDireccion,
    fechaRetiroEstimada,
    tipoEntrega,
    idMetodoPago,
    observaciones,
    productos 
  } = req.body;

  if (!idUsuario) {
    return res.status(401).json({ error: "No autenticado" });
  }

  if (!productos || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: "La reserva debe tener al menos un producto" });
  }

  const conn = connection.promise();

  try {
    await conn.beginTransaction();

    const [estados] = await conn.query(
      "SELECT idEstado FROM estados_reserva WHERE nombreEstado = 'Pendiente' LIMIT 1"
    );

    if (!estados.length) {
      throw new Error("No existe el estado 'Pendiente' en la base de datos");
    }

    const idEstadoPendiente = estados[0].idEstado;

    let totalReserva = 0;
    const productosValidados = [];

    for (const item of productos) {
      const { idProducto, idTamanio, cantidad } = item;

      if (!idProducto || !cantidad || cantidad <= 0) {
        throw new Error("Datos de producto inválidos");
      }

      let query, params;

      if (idTamanio) {
        query = `
          SELECT 
            p.nombreProducto,
            t.nombreTamanio,
            pt.dimension,
            pt.precio,
            pt.stock
          FROM productos p
          JOIN producto_tamanio pt ON p.idProducto = pt.idProducto
          JOIN tamanios t ON pt.idTamanio = t.idTamanio
          WHERE p.idProducto = ? AND pt.idTamanio = ? AND p.activo = 1 AND pt.activo = 1
        `;
        params = [idProducto, idTamanio];
      } else {
        query = `
          SELECT 
            p.nombreProducto,
            'Único' AS nombreTamanio,
            NULL AS dimension,
            pt.precio AS precio,
            pt.stock
          FROM productos p
          LEFT JOIN producto_tamanio pt ON p.idProducto = pt.idProducto
          WHERE p.idProducto = ? AND p.activo = 1
        `;
        params = [idProducto];
      }

      const [productoData] = await conn.query(query, params);

      if (!productoData.length) {
        throw new Error(`Producto ${idProducto} no disponible`);
      }

      const producto = productoData[0];

      if (producto.stock < cantidad) {
        throw new Error(`Stock insuficiente para ${producto.nombreProducto}`);
      }

      const subtotal = producto.precio * cantidad;
      totalReserva += subtotal;

      productosValidados.push({
        idProducto,
        idTamanio: idTamanio || null,
        nombreProducto: producto.nombreProducto,
        nombreTamanio: producto.nombreTamanio,
        dimension: producto.dimension,
        cantidad,
        precioUnitario: producto.precio,
        subtotal
      });
    }

    const [reservaResult] = await conn.query(
      `INSERT INTO reservas 
      (idUsuario, nombreCliente, apellidoCliente, emailCliente, telefonoCliente, idDireccion, fechaRetiroEstimada, totalReserva, idMetodoPago, idEstado, tipoEntrega, pagado, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [
        idUsuario,
        req.body.nombreCliente || null,
        req.body.apellidoCliente || null,
        req.body.emailCliente || null,
        req.body.telefonoCliente || null,
        idDireccion || null,
        fechaRetiroEstimada || null,
        totalReserva,
        idMetodoPago || null,
        idEstadoPendiente,
        tipoEntrega || 'retiro_local',
        observaciones || null
      ]
    );

    const idReserva = reservaResult.insertId;

    for (const prod of productosValidados) {
      await conn.query(
        `INSERT INTO detalle_reservas 
        (idReserva, idProducto, idTamanio, nombreProducto, nombreTamanio, dimension, cantidad, precioUnitario, subtotal)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          idReserva,
          prod.idProducto,
          prod.idTamanio,
          prod.nombreProducto,
          prod.nombreTamanio,
          prod.dimension,
          prod.cantidad,
          prod.precioUnitario,
          prod.subtotal
        ]
      );

      if (prod.idTamanio) {
        await conn.query(
          "UPDATE producto_tamanio SET stock = stock - ? WHERE idProducto = ? AND idTamanio = ?",
          [prod.cantidad, prod.idProducto, prod.idTamanio]
        );
      } else {
        await conn.query(
          "UPDATE producto_tamanio SET stock = stock - ? WHERE idProducto = ?",
          [prod.cantidad, prod.idProducto]
        );
      }
    }

    await conn.commit();

    try {
  await enviarEmailReserva(
    emailCliente,                // email del usuario
    nombreCliente,               // nombre
    idReserva,                   // ID recién generado por MySQL
    productosValidados,          // array con nombre, cantidad y precio de cada item
    totalReserva,                // total calculado en el controller
    tipoEntrega,                 // "retiro_local" o "envio_domicilio"
    req.body.metodoPago || ""    // nombre del método (si lo mandás desde el frontend)
  );
} catch (emailError) {
  // Si el mail falla, lo logueamos pero NO interrumpimos la respuesta
  console.error("Reserva creada OK, pero falló el email:", emailError.message);
}


    res.status(201).json({
      success: true,
      idReserva,
      totalReserva
    });

  } catch (error) {
    await conn.rollback();
    console.error("Error al crear reserva:", error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH - Cancelar una reserva (solo en estado cendiente o confirmada)
export const cancelarReserva = async (req, res) => {
  const idUsuario = req.user?.idUsuario;
  const { id } = req.params;

  if (!idUsuario) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const conn = connection.promise();

  try {
    await conn.beginTransaction();

    // Obtener la reserva
    const [reserva] = await conn.query(
      `SELECT r.idReserva, r.idEstado, e.nombreEstado 
       FROM reservas r
       JOIN estados_reserva e ON r.idEstado = e.idEstado
       WHERE r.idReserva = ? AND r.idUsuario = ?`,
      [id, idUsuario]
    );

    if (!reserva.length) {
      throw new Error("Reserva no encontrada");
    }

    const estadoActual = reserva[0].nombreEstado;

    if (estadoActual !== "Pendiente" && estadoActual !== "Confirmada") {
      throw new Error("No se puede cancelar una reserva en este estado");
    }

    const [estadoCancelada] = await conn.query(
      "SELECT idEstado FROM estados_reserva WHERE nombreEstado = 'Cancelada' LIMIT 1"
    );

    if (!estadoCancelada.length) {
      throw new Error("Estado 'Cancelada' no encontrado");
    }

    await conn.query(
      "UPDATE reservas SET idEstado = ? WHERE idReserva = ?",
      [estadoCancelada[0].idEstado, id]
    );

    const [productos] = await conn.query(
      "SELECT idProducto, idTamanio, cantidad FROM detalle_reservas WHERE idReserva = ?",
      [id]
    );

    for (const prod of productos) {
      if (prod.idTamanio) {
        await conn.query(
          "UPDATE producto_tamanio SET stock = stock + ? WHERE idProducto = ? AND idTamanio = ?",
          [prod.cantidad, prod.idProducto, prod.idTamanio]
        );
      } else {
        await conn.query(
          "UPDATE producto_tamanio SET stock = stock + ? WHERE idProducto = ?",
          [prod.cantidad, prod.idProducto]
        );
      }
    }

    await conn.commit();

    res.status(200).json({ success: true, message: "Reserva cancelada correctamente" });

  } catch (error) {
    await conn.rollback();
    console.error("Error al cancelar reserva:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET - Obtener todas las reservas ADMIN
export const obtenerTodasLasReservas = (req, res) => {
  const query = `
    SELECT 
      r.idReserva,
      r.idUsuario,
      r.nombreCliente,
      r.apellidoCliente,
      r.emailCliente, 
      r.telefonoCliente,
      r.fechaReserva,
      r.fechaRetiroEstimada,
      r.totalReserva AS total,
      r.tipoEntrega,
      r.pagado,
      r.observaciones,
      r.idEstado,
      e.nombreEstado,
      e.color AS colorEstado,
      mp.nombreMetodo,
      mp.idMetodoPago
    FROM reservas r
    LEFT JOIN estados_reserva e ON r.idEstado = e.idEstado
    LEFT JOIN metodos_pago mp ON r.idMetodoPago = mp.idMetodoPago
    ORDER BY r.fechaReserva DESC
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error al obtener reservas:", error);
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(results);
  });
};

// GET - Obtener detalle de una reserva por ID ADMIN
export const obtenerReservaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const conn = connection.promise();

    const queryReserva = `
      SELECT 
        r.idReserva,
        r.idUsuario,
        r.nombreCliente,
        r.apellidoCliente,
        r.emailCliente,
        r.telefonoCliente,
        r.fechaReserva,
        r.fechaRetiroEstimada,
        r.totalReserva AS total,
        r.tipoEntrega,
        r.pagado,
        r.observaciones,
        r.idEstado,
        e.nombreEstado,
        e.color AS colorEstado,
        mp.nombreMetodo,
        mp.idMetodoPago,
        CONCAT(d.calle, ' ', d.numero, 
          CASE WHEN d.piso IS NOT NULL THEN CONCAT(', Piso ', d.piso) ELSE '' END,
          CASE WHEN d.departamento IS NOT NULL THEN CONCAT(' Depto ', d.departamento) ELSE '' END,
          ', ', d.localidad, ', ', d.provincia
        ) AS direccionCompleta
      FROM reservas r
      LEFT JOIN estados_reserva e ON r.idEstado = e.idEstado
      LEFT JOIN metodos_pago mp ON r.idMetodoPago = mp.idMetodoPago
      LEFT JOIN direcciones_usuarios d ON r.idDireccion = d.idDireccion
      WHERE r.idReserva = ?
    `;

    const [reservas] = await conn.query(queryReserva, [id]);

    if (reservas.length === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const reserva = reservas[0];

    const queryProductos = `
      SELECT 
        nombreProducto,
        nombreTamanio,
        dimension,
        cantidad,
        precioUnitario,
        subtotal
      FROM detalle_reservas
      WHERE idReserva = ?
    `;

    const [productos] = await conn.query(queryProductos, [id]);

    const reservaCompleta = {
      ...reserva,
      productos
    };

    res.status(200).json(reservaCompleta);
  } catch (error) {
    console.error("Error al obtener reserva:", error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH - Cambiar estado de una reserva ADMIN
export const cambiarEstadoReserva = async (req, res) => {
  const { id } = req.params;
  const { idEstado: nuevoEstado } = req.body;

  if (!nuevoEstado) {
    return res.status(400).json({ error: "idEstado es obligatorio" });
  }

  const ESTADOS_FINALES = [5, 6];
  const ID_CANCELADA = 6;

  try {
    const conn = connection.promise();

    const [reservas] = await conn.query(
      "SELECT idEstado FROM reservas WHERE idReserva = ?",
      [id]
    );

    if (reservas.length === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const estadoActual = reservas[0].idEstado;

    if (ESTADOS_FINALES.includes(estadoActual)) {
      return res.status(400).json({ error: "Esta reserva no puede cambiar de estado." });
    }

    if (parseInt(nuevoEstado) !== ID_CANCELADA && parseInt(nuevoEstado) <= estadoActual) {
      return res.status(400).json({ error: "Transición de estado no permitida. La reserva solo puede avanzar." });
    }

    await conn.query(
      "UPDATE reservas SET idEstado = ? WHERE idReserva = ?",
      [nuevoEstado, id]
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error al cambiar estado de reserva:", error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH - Marcar reserva como pagada ADMIN
export const marcarReservaPagada = (req, res) => {
  const { id } = req.params;
  const { pagado } = req.body;

  const query = "UPDATE reservas SET pagado = ? WHERE idReserva = ?";

  connection.query(query, [pagado ? 1 : 0, id], (error, results) => {
    if (error) {
      console.error("Error al marcar reserva como pagada:", error);
      return res.status(500).json({ error: error.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    res.status(200).json({ success: true });
  });
};

// GET - Obtener estadísticas de reservas ADMIN
export const obtenerEstadisticasReservas = (req, res) => {
  const queries = {
    totalReservas: "SELECT COUNT(*) as total FROM reservas",
    totalVentas: "SELECT SUM(totalReserva) as total FROM reservas WHERE pagado = 1",
    reservasPendientes: `
      SELECT COUNT(*) as total 
      FROM reservas r
      JOIN estados_reserva e ON r.idEstado = e.idEstado
      WHERE e.nombreEstado = 'Pendiente'
    `,
    reservasPorEstado: `
      SELECT e.nombreEstado, e.color, COUNT(*) as cantidad
      FROM reservas r
      JOIN estados_reserva e ON r.idEstado = e.idEstado
      GROUP BY e.idEstado, e.nombreEstado, e.color
    `
  };

  const resultados = {};
  let completadas = 0;

  Object.keys(queries).forEach((key) => {
    connection.query(queries[key], (error, results) => {
      if (error) {
        console.error(`Error en query ${key}:`, error);
        return;
      }

      resultados[key] = results;
      completadas++;

      if (completadas === Object.keys(queries).length) {
        res.status(200).json({
          totalReservas: resultados.totalReservas[0].total,
          totalVentas: resultados.totalVentas[0].total || 0,
          reservasPendientes: resultados.reservasPendientes[0].total,
          reservasPorEstado: resultados.reservasPorEstado
        });
      }
    });
  });
};