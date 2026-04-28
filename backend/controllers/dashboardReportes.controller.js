import connection from "../config/DB.js";
import Groq from "groq-sdk"

// GET /api/dashboardReportes/clientes
export const getTotalClientes = async (req, res) => {
  try {
    const db = connection.promise();

    const [[{ totalClientes }]] = await db.query(`
      SELECT COUNT(*) AS totalClientes
      FROM usuarios
      WHERE rol = 'cliente' AND activo = 1
    `);

    const [grafico] = await db.query(`
      SELECT
        DATE_FORMAT(createdAt, '%b') AS mes,
        MONTH(createdAt)             AS nroMes,
        COUNT(*)                     AS cantidad
      FROM usuarios
      WHERE rol = 'cliente'
        AND activo = 1
        AND YEAR(createdAt) = YEAR(CURDATE())
      GROUP BY mes, nroMes
      ORDER BY nroMes ASC
    `);

    const [[{ semanaActual }]] = await db.query(`
      SELECT COUNT(*) AS semanaActual
      FROM usuarios
      WHERE rol = 'cliente'
        AND activo = 1
        AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `);

    const [[{ semanaAnterior }]] = await db.query(`
      SELECT COUNT(*) AS semanaAnterior
      FROM usuarios
      WHERE rol = 'cliente'
        AND activo = 1
        AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
        AND createdAt <  DATE_SUB(CURDATE(), INTERVAL 7  DAY)
    `);

    res.json({
      kpi: totalClientes,
      grafico,
      semanaActual,
      semanaAnterior,
    });
  } catch (error) {
    console.error("Error getTotalClientes:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/dashboardReportes/productos
export const getTotalProductos = async (req, res) => {
  try {
    const db = connection.promise();

    const [[{ totalProductos }]] = await db.query(`
      SELECT COUNT(*) AS totalProductos
      FROM productos
      WHERE activo = 1
    `);

    const [grafico] = await db.query(`
      SELECT
        c.nombreCategoria AS categoria,
        COALESCE(SUM(
          CASE WHEN pt.activo = 1 THEN pt.stock ELSE 0 END
        ), 0) AS stock
      FROM categorias c
      LEFT JOIN productos p         ON p.idCategoria = c.idCategoria AND p.activo = 1
      LEFT JOIN producto_tamanio pt ON pt.idProducto = p.idProducto
      GROUP BY c.idCategoria, c.nombreCategoria
      ORDER BY stock DESC
    `);

    const [top5] = await db.query(`
      SELECT
        p.nombreProducto  AS nombre,
        c.nombreCategoria AS categoria,
        SUM(pt.stock)     AS stock
      FROM productos p
      JOIN producto_tamanio pt ON pt.idProducto = p.idProducto AND pt.activo = 1
      JOIN categorias c        ON c.idCategoria = p.idCategoria
      WHERE p.activo = 1
      GROUP BY p.idProducto, p.nombreProducto, c.nombreCategoria
      ORDER BY stock DESC
      LIMIT 5
    `);

    const [sinStock] = await db.query(`
      SELECT
        p.nombreProducto  AS nombre,
        t.nombreTamanio   AS tamanio,
        c.nombreCategoria AS categoria
      FROM producto_tamanio pt
      JOIN productos  p ON p.idProducto  = pt.idProducto AND p.activo = 1
      JOIN tamanios   t ON t.idTamanio   = pt.idTamanio
      JOIN categorias c ON c.idCategoria = p.idCategoria
      WHERE pt.activo = 1 AND pt.stock = 0
      ORDER BY p.nombreProducto
    `);

    const [stockCritico] = await db.query(`
      SELECT
        p.nombreProducto  AS nombre,
        t.nombreTamanio   AS tamanio,
        pt.stock,
        c.nombreCategoria AS categoria
      FROM producto_tamanio pt
      JOIN productos  p ON p.idProducto  = pt.idProducto AND p.activo = 1
      JOIN tamanios   t ON t.idTamanio   = pt.idTamanio
      JOIN categorias c ON c.idCategoria = p.idCategoria
      WHERE pt.activo = 1 AND pt.stock BETWEEN 1 AND 5
      ORDER BY pt.stock ASC
    `);

    const [stockBajo] = await db.query(`
      SELECT
        p.nombreProducto  AS nombre,
        t.nombreTamanio   AS tamanio,
        pt.stock,
        c.nombreCategoria AS categoria
      FROM producto_tamanio pt
      JOIN productos  p ON p.idProducto  = pt.idProducto AND p.activo = 1
      JOIN tamanios   t ON t.idTamanio   = pt.idTamanio
      JOIN categorias c ON c.idCategoria = p.idCategoria
      WHERE pt.activo = 1 AND pt.stock BETWEEN 6 AND 10
      ORDER BY pt.stock ASC
    `);

    // Convertimos stock a número porque MySQL puede devolverlo como string
    const graficoFixed = grafico.map(d => ({ ...d, stock: Number(d.stock) }));
    const top5Fixed = top5.map(d => ({ ...d, stock: Number(d.stock) }));
    const stockCriticoFixed = stockCritico.map(d => ({ ...d, stock: Number(d.stock) }));
    const stockBajoFixed = stockBajo.map(d => ({ ...d, stock: Number(d.stock) }));

    res.json({
      kpi: totalProductos,
      grafico: graficoFixed,
      top5: top5Fixed,
      alertas: { sinStock, stockCritico: stockCriticoFixed, stockBajo: stockBajoFixed },
    });
  } catch (error) {
    console.error("Error getTotalProductos:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/dashboardReportes/reservas
export const getTotalReservas = async (req, res) => {
  try {
    const db = connection.promise();

    const [[{ totalReservas }]] = await db.query(`
      SELECT COUNT(*) AS totalReservas
      FROM reservas
      WHERE idEstado IN (1, 2, 3, 4)
    `);

    const [grafico] = await db.query(`
      SELECT
        DATE_FORMAT(fechaReserva, '%b') AS mes,
        MONTH(fechaReserva) AS nroMes,
        SUM(CASE WHEN idEstado = 1 THEN 1 ELSE 0 END) AS pendiente,
        SUM(CASE WHEN idEstado = 2 THEN 1 ELSE 0 END) AS confirmada,
        SUM(CASE WHEN idEstado = 3 THEN 1 ELSE 0 END) AS enPreparacion,
        SUM(CASE WHEN idEstado = 4 THEN 1 ELSE 0 END) AS listaParaRetiro,
        SUM(CASE WHEN idEstado = 5 THEN 1 ELSE 0 END) AS retirada,
        SUM(CASE WHEN idEstado = 6 THEN 1 ELSE 0 END) AS cancelada
      FROM reservas
      WHERE YEAR(fechaReserva) = YEAR(CURDATE())
      GROUP BY mes, nroMes
      ORDER BY nroMes ASC
    `);

    const [top5Usuarios] = await db.query(`
      SELECT
        CONCAT(u.nombre, ' ', u.apellido) AS nombre,
        LEFT(u.nombre, 1) AS avatar,
        COUNT(*) AS total
      FROM reservas r
      JOIN usuarios u ON u.idUsuario = r.idUsuario
      WHERE r.idEstado = 5
      GROUP BY r.idUsuario, u.nombre, u.apellido
      ORDER BY total DESC
      LIMIT 5
    `);

    const [ticketPromedio] = await db.query(`
      SELECT
        DATE_FORMAT(fechaReserva, '%b') AS mes,
        MONTH(fechaReserva) AS nroMes,
        ROUND(AVG(totalReserva), 0) AS promedio,
        COUNT(*) AS cantidad
      FROM reservas
      WHERE YEAR(fechaReserva) = YEAR(CURDATE())
        AND idEstado != 6
      GROUP BY mes, nroMes
      ORDER BY nroMes ASC
    `);

    const [[tiposEntrega]] = await db.query(`
      SELECT
        SUM(CASE WHEN tipoEntrega = 'retiro_local' THEN 1 ELSE 0 END) AS retiroLocal,
        SUM(CASE WHEN tipoEntrega = 'envio_domicilio' THEN 1 ELSE 0 END) AS envioDomicilio
      FROM reservas
      WHERE idEstado != 6
    `);

    const [porDia] = await db.query(`
      SELECT
        DAYOFWEEK(fechaReserva) AS nroDia,
        DATE_FORMAT(fechaReserva, '%W') AS dia,
        COUNT(*) AS cantidad
      FROM reservas
      WHERE YEAR(fechaReserva) = YEAR(CURDATE())
        AND idEstado != 6
      GROUP BY nroDia, dia
      ORDER BY nroDia ASC
    `);

    res.json({ 
      kpi: totalReservas,
      grafico,
      top5Usuarios,
      ticketPromedio: ticketPromedio.map(t => ({ ...t, promedio: Number(t.promedio) })),
      tiposEntrega: {
        retiroLocal: Number(tiposEntrega.retiroLocal),
        envioDomicilio: Number(tiposEntrega.envioDomicilio),
      },
      porDia: porDia.map(d => ({ ...d, cantidad: Number(d.cantidad) })), });
  } catch (error) {
    console.error("Error getTotalReservas:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/dashboardReportes/usuarios
export const getTotalUsuarios = async (req, res) => {
  try {
    const db = connection.promise();

    const [[{ totalUsuarios }]] = await db.query(`
      SELECT COUNT(*) AS totalUsuarios
      FROM usuarios
      WHERE activo = 1
    `);

    const [grafico] = await db.query(`
      SELECT
        DATE_FORMAT(createdAt, '%b') AS mes,
        MONTH(createdAt)             AS nroMes,
        SUM(CASE WHEN rol = 'cliente'  THEN 1 ELSE 0 END) AS clientes,
        SUM(CASE WHEN rol = 'empleado' THEN 1 ELSE 0 END) AS empleados,
        SUM(CASE WHEN rol = 'admin'    THEN 1 ELSE 0 END) AS admins
      FROM usuarios
      WHERE activo = 1 AND YEAR(createdAt) = YEAR(CURDATE())
      GROUP BY mes, nroMes
      ORDER BY nroMes ASC
    `);

    res.json({ kpi: totalUsuarios, grafico });
  } catch (error) {
    console.error("Error getTotalUsuarios:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/dashboardReportes/actividad
export const getDashboardActividad = async (req, res) => {
  try {
    const db = connection.promise();

    const [reservas] = await db.query(`
      SELECT
        r.idReserva,
        CONCAT(u.nombre, ' ', u.apellido) AS cliente,
        e.nombreEstado AS estado,
        DATE_FORMAT(r.fechaReserva, '%d/%m %H:%i') AS fecha,
        MIN(dr.nombreProducto) AS producto,
        MIN(dr.nombreTamanio) AS tamanio
      FROM reservas r
      JOIN usuarios u ON u.idUsuario = r.idUsuario
      JOIN estados_reserva e ON e.idEstado = r.idEstado
      LEFT JOIN detalle_reservas dr ON dr.idReserva = r.idReserva
      GROUP BY r.idReserva, u.nombre, u.apellido, e.nombreEstado, r.fechaReserva
      ORDER BY r.fechaReserva DESC
      LIMIT 5
    `);

    const [clientes] = await db.query(`
      SELECT
        CONCAT(nombre, ' ', apellido) AS nombre,
        email,
        DATE_FORMAT(createdAt, '%d/%m/%Y') AS fecha
      FROM usuarios
      WHERE rol = 'cliente' AND activo = 1
      ORDER BY createdAt DESC
      LIMIT 5
    `);

    res.json({ reservas, clientes });
  } catch (error) {
    console.error("Error getDashboardActividad:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/dashboardReportes/informe?fechaDesde=YYYY-MM-DD&fechaHasta=YYYY-MM-DD
export const getInforme = async (req, res) => {
  const { fechaDesde, fechaHasta, topProductos } = req.query;

  if (!fechaDesde || !fechaHasta) {
    return res.status(400).json({ error: "fechaDesde y fechaHasta son obligatorios" });
  }

  const desde = fechaDesde;
  const hasta = `${fechaHasta} 23:59:59`;

  try {
    const db = connection.promise();

    const [[resumen]] = await db.query(`
      SELECT
        COUNT(*)                                                        AS cantidadReservas,
        COALESCE(SUM(totalReserva), 0)                                  AS totalGeneral,
        COALESCE(SUM(CASE WHEN idEstado = 5 THEN totalReserva END), 0)  AS totalFacturado,
        COALESCE(SUM(CASE WHEN idEstado != 5 AND idEstado != 6 THEN totalReserva END), 0) AS totalEsperado,
        COALESCE(SUM(CASE WHEN pagado = 1 THEN totalReserva END), 0)    AS totalPagado,
        COALESCE(SUM(CASE WHEN pagado = 0 AND idEstado != 6 THEN totalReserva END), 0) AS totalSinPagar,
        COUNT(CASE WHEN idEstado = 6 THEN 1 END)                        AS cantidadCanceladas
      FROM reservas
      WHERE fechaReserva BETWEEN ? AND ?
    `, [desde, hasta]);

    const tasaCancelacion = resumen.cantidadReservas > 0
      ? Math.round((resumen.cantidadCanceladas / resumen.cantidadReservas) * 100)
      : 0;

    const [porEstado] = await db.query(`
      SELECT
        e.nombreEstado,
        e.color,
        COUNT(*)                         AS cantidad,
        COALESCE(SUM(r.totalReserva), 0) AS monto
      FROM reservas r
      JOIN estados_reserva e ON e.idEstado = r.idEstado
      WHERE r.fechaReserva BETWEEN ? AND ?
      GROUP BY e.idEstado, e.nombreEstado, e.color
      ORDER BY e.ordenVisualizacion ASC
    `, [desde, hasta]);

    const limite = Math.min(Number(topProductos) || 50, 50);

    const [productosDestacados] = await db.query(`
      SELECT
        dr.nombreProducto,
        SUM(dr.cantidad)                AS cantidadVendida,
        COALESCE(SUM(dr.subtotal), 0)   AS montoTotal
      FROM detalle_reservas dr
      JOIN reservas r ON r.idReserva = dr.idReserva
      WHERE r.fechaReserva BETWEEN ? AND ?
        AND r.idEstado != 6
      GROUP BY dr.nombreProducto
      ORDER BY cantidadVendida DESC
      LIMIT ?
    `, [desde, hasta, limite]);

    const [evolucionSemanal] = await db.query(`
      SELECT
        DATE_FORMAT(fechaReserva, '%d/%m') AS semana,
        YEARWEEK(fechaReserva, 1)           AS nroSemana,
        COUNT(*)                            AS cantidad,
        COALESCE(SUM(totalReserva), 0)      AS monto
      FROM reservas
      WHERE fechaReserva BETWEEN ? AND ?
        AND idEstado != 6
      GROUP BY nroSemana, semana
      ORDER BY nroSemana ASC
    `, [desde, hasta]);

    const [productosCancelados] = await db.query(`
      SELECT
        dr.nombreProducto,
        COUNT(*) AS vecesEnCanceladas
      FROM detalle_reservas dr
      JOIN reservas r ON r.idReserva = dr.idReserva
      WHERE r.fechaReserva BETWEEN ? AND ?
        AND r.idEstado = 6
      GROUP BY dr.nombreProducto
      ORDER BY vecesEnCanceladas DESC
      LIMIT 50
    `, [desde, hasta]);

    res.json({
      periodo: { desde: fechaDesde, hasta: fechaHasta },
      resumenFinanciero: {
        cantidadReservas:   Number(resumen.cantidadReservas),
        totalGeneral:       Number(resumen.totalGeneral),
        totalFacturado:     Number(resumen.totalFacturado),
        totalEsperado:      Number(resumen.totalEsperado),
        totalPagado:        Number(resumen.totalPagado),
        totalSinPagar:      Number(resumen.totalSinPagar),
        cantidadCanceladas: Number(resumen.cantidadCanceladas),
        tasaCancelacion,
      },
      porEstado: porEstado.map(e => ({ ...e, monto: Number(e.monto) })),
      productosDestacados: productosDestacados.map(p => ({
        ...p,
        cantidadVendida: Number(p.cantidadVendida),
        montoTotal:      Number(p.montoTotal),
      })),
      evolucionSemanal: evolucionSemanal.map(s => ({
        ...s,
        cantidad: Number(s.cantidad),
        monto:    Number(s.monto),
      })),
      productosCancelados,
    });

  } catch (error) {
    console.error("Error getInforme:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const analizarConIA = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "El prompt es obligatorio" });
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      max_tokens: 6000,
    });

    res.json({ texto: completion.choices[0].message.content });
  } catch (error) {
    console.error("Error al llamar a Groq:", error.message);
    res.status(500).json({ error: "Error al conectar con el asistente de IA" });
  }
};