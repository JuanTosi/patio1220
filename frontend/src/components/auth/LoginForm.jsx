import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import axios from "axios";
import Logo from "../../assets/logopatio.png";
import { swalCustom } from "../../utils/customSwal";
import RecuperarPasswordModal from "./RecuperarPasswordModal";
import { LOGIN_URL } from "../../constants/constants";
import "../../styles/pages/login.css";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
    };
    try {
      const { data } = await axios.post(LOGIN_URL, payload);
      if (!data?.user || !data.token) {
        swalCustom.fire({
          title: "Error",
          text: "Respuesta inválida del servidor",
          icon: "error",
        });
        return;
      }
      login(data.user, data.token);
      swalCustom.fire({
        title: "¡Bienvenido!",
        text: `Hola ${data.user.nombre}`,
        icon: "success",
      });
      navigate("/");
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        status === 401
          ? "Credenciales inválidas"
          : "Credenciales incorrectas o error del servidor";
      swalCustom.fire({ icon: "error", title: "Error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <img src={Logo} alt="Patio 1220" className="auth-logo" />
          <span className="auth-brand-name">Patio 1220</span>
        </div>

        <h1 className="auth-title">
          Bienvenido
          <br />
          <em>de vuelta</em>
        </h1>

        <div className="auth-divider">
          <span className="auth-divider-icon">✦ acceso ✦</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">
              Correo electrónico
            </label>
            <input
              className="auth-input"
              type="text"
              id="email"
              name="email"
              value={formData.email.toLowerCase().trim()}
              onChange={handleChange}
              placeholder="Ingresa tu mail"
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">
              Contraseña
            </label>
            <input
              className="auth-input"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          <div className="auth-forgot">
            <button type="button" onClick={() => setShowResetModal(true)}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            className="auth-btn-primary"
            disabled={submitting}
          >
            {submitting ? "Ingresando..." : "Ingresar"}
          </button>

          <button
            type="button"
            className="auth-btn-secondary"
            onClick={() => navigate("/register")}
            disabled={submitting}
          >
            Crear una cuenta
          </button>
        </form>
      </div>

      <RecuperarPasswordModal
        visible={showResetModal}
        onClose={() => setShowResetModal(false)}
      />
    </div>
  );
};

export default LoginForm;
