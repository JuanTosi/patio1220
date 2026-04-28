import { Routes, Route } from "react-router-dom";
import Home from "./pages/public/Home";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import CatalogoProductos from "./pages/public/CatalogoProductos";
import Carrito from "./components/carrito/Carrito";
import GuiaVivero from "./pages/public/GuiaVivero";
import MiPerfil from "./pages/user/MiPerfil";
import Error from "./pages/public/Error";
import RutaPublica from "./routes/PublicRoute";
import RutaPrivada from "./routes/PrivateRoute";
import "./App.css";
import { useUIStore } from "./store/uiStore";
import ScrollToTopButton from "./components/common/ScrollToTopButton";
import ScrollToTop from "./components/common/ScrollToTop";
import AdminLayout from "./components/admin/layout/AdminLayout";
import AdminDashboard from "./components/admin/dashboard/AdminDashboard";
import AdminProductos from "./components/admin/productos/AdminProductos";
import AdminUsuarios from "./components/admin/usuarios/AdminUsuarios";
import AdminReservas from "./components/admin/reservas/AdminReservas";
import Checkout from "./pages/user/Checkout";
import MisReservas from "./pages/user/MisReservas";
import DetalleReserva from "./components/admin/reservas/DetalleReserva";
import DetalleProducto from "./components/admin/productos/DetalleProducto";
import EditarProducto from "./components/admin/productos/EditarProducto";
import NuevoProducto from "./components/admin/productos/NuevoProducto";
import AdminReportes from "./components/admin/reportes/AdminReportes";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import PapeleraProductos from "./components/admin/productos/PapeleraProductos";

function App() {
  const { showCarrito, cerrarCarrito } = useUIStore();

  return (
    <>
      <ScrollToTop />
      <Header />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/login"
            element={
              <RutaPublica>
                <Login />
              </RutaPublica>
            }
          />
          <Route
            path="/register"
            element={
              <RutaPublica>
                <Register />
              </RutaPublica>
            }
          />

          <Route path="/catalogo" element={<CatalogoProductos />} />
          <Route path="/guia" element={<GuiaVivero />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route path="/miPerfil" element={<RutaPrivada />}>
            <Route index element={<MiPerfil />} />
          </Route>

          <Route path="/checkout" element={<RutaPrivada />}>
            <Route index element={<Checkout />} />
          </Route>

          <Route path="/mis-reservas" element={<RutaPrivada />}>
            <Route index element={<MisReservas />} />
          </Route>

          <Route
            path="/admin"
            element={<RutaPrivada rolesPermitidos={["admin", "empleado"]} />}
          >
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="productos" element={<AdminProductos />} />
              <Route path="productos/nuevo" element={<NuevoProducto />} />
              <Route path="productos/:id" element={<DetalleProducto />} />
              <Route path="productos/:id/editar" element={<EditarProducto />} />
              <Route path="reservas" element={<AdminReservas />} />
              <Route path="reservas/:id" element={<DetalleReserva />} />
              <Route element={<RutaPrivada rolesPermitidos={["admin"]} />}>
                <Route path="usuarios" element={<AdminUsuarios />} />
                <Route path="reportes" element={<AdminReportes />} />
                <Route path="productos/papelera" element={<PapeleraProductos />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Error />} />
        </Routes>
      </div>

      <Footer />
      <ScrollToTopButton />
      <Carrito show={showCarrito} handleClose={cerrarCarrito} />
    </>
  );
}

export default App;
