import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";

const RutaPrivada = ({ rolesPermitidos }) => {
  const { user, token } = useAuthStore();

  if (!token || !user) return <Navigate to="/login" replace />;

  if (!rolesPermitidos) return <Outlet />;

  if (!rolesPermitidos.includes(user.rol)) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default RutaPrivada;
