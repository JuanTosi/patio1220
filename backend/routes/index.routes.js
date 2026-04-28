import express from "express";
import usuariosRoutes from "./usuarios.routes.js";
import productosRoutes from "./productos.routes.js";
import categoriasRoutes from "./categorias.routes.js";
import tamaniosRoutes from "./tamanios.routes.js";
import direccionesRoutes from "./direcciones.routes.js";
import metodosPagoRoutes from "./metodos_pago.routes.js";
import reservasRoutes from "./reservas.routes.js";
import estadosRoutes from "./estado_reservas.routes.js";
import dashboardReportesRoutes from "./dashboardReportes.routes.js";

const router = express.Router();

router.use("/auth", usuariosRoutes);
router.use("/usuarios", usuariosRoutes);
router.use("/productos", productosRoutes);
router.use("/categorias", categoriasRoutes);
router.use("/tamanios", tamaniosRoutes);
router.use("/direcciones", direccionesRoutes);
router.use("/reservas", reservasRoutes);
router.use("/estados-reserva", estadosRoutes);
router.use("/metodos-pago", metodosPagoRoutes);
router.use("/dashboardReportes", dashboardReportesRoutes);

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "API del Vivero funcionando correctamente",
    timestamp: new Date().toISOString()
  });
});

export default router;