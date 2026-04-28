import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import apiRoutes from "./routes/index.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Vivero API",
    version: "1.0",
    endpoints: {
      auth: "/api/auth",
      usuarios: "/api/usuarios",
      productos: "/api/productos",
      categorias: "/api/categorias",
      tamanios: "/api/tamanios",
      direcciones: "/api/direcciones",
      reservas: "/api/reservas",
      estadosReserva: "/api/estados-reserva",
      metodosPago: "/api/metodos-pago",
      health: "/api/health"
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error("Error no manejado:", err);
  res.status(500).json({ error: "Error interno del servidor", message: err.message });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`API disponible en http://localhost:${PORT}/api`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;