import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { USUARIOS_URL } from "../../constants/constants";
import { swalCustom } from "../../utils/customSwal";
import "../../styles/pages/login.css";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [nuevaPassword, setNuevaPassword] = useState("");
  const [checkPassword, setCheckPassword] = useState("");

  const handleReset = async () => {
    if (!nuevaPassword || !checkPassword) {
      swalCustom.fire({
        icon: "warning",
        title: "Faltan datos",
        text: "Completá los dos campos",
      });
      return;
    }

    if (nuevaPassword !== checkPassword) {
      swalCustom.fire({
        icon: "error",
        title: "Las contraseñas no coinciden",
        text: "Escribí la misma contraseña en ambos campos",
      });
      return;
    }

    if (!token) {
      swalCustom.fire({
        icon: "error",
        title: "Token inválido",
        text: "El enlace no es válido. Pedí uno nuevo.",
      });
      return;
    }

    try {
      await axios.post(`${USUARIOS_URL}/reset-password`, {
        token,
        nuevaPassword,
      });

      swalCustom.fire({
        icon: "success",
        title: "¡Listo!",
        text: "Contraseña actualizada. Ya podés iniciar sesión.",
      });

      navigate("/login");
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        status === 400
          ? "El enlace no es válido o ya expiró. Pedí uno nuevo."
          : "Hubo un problema. Intentá de nuevo más tarde.";

      swalCustom.fire({ icon: "error", title: "Error", text: msg });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">
          Nueva
          <br />
          <em>contraseña</em>
        </h2>

        <div className="auth-divider" style={{ margin: "1rem 0 1.5rem" }}>
          <span className="auth-divider-icon">✦</span>
        </div>

        <div className="auth-field">
          <label className="auth-label">Nueva contraseña</label>
          <input
            className="auth-input"
            type="password"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">Confirmá la contraseña</label>
          <input
            className="auth-input"
            type="password"
            value={checkPassword}
            onChange={(e) => setCheckPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button
          className="auth-btn-secondary"
          onClick={handleReset}
          style={{ marginTop: "0.5rem" }}
        >
          Guardar contraseña
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
