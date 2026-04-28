import { useState } from "react";
import { Modal } from "react-bootstrap";
import axios from "axios";
import { USUARIOS_URL } from "../../constants/constants";
import { swalCustom } from "../../utils/customSwal";
import "../../styles/pages/login.css";

const RecuperarPasswordModal = ({ onClose, visible }) => {
  const [email, setEmail] = useState("");
  const [mailEnviado, setMailEnviado] = useState(false);

  const handleClose = () => {
    setEmail("");
    setMailEnviado(false);
    onClose();
  };

  const handleEnviarMail = async () => {
    if (!email) {
      swalCustom.fire({
        icon: "warning",
        title: "Falta el email",
        text: "Ingresá tu correo registrado",
      });
      return;
    }

    try {
      await axios.post(`${USUARIOS_URL}/forgot-password`, { email });

      setMailEnviado(true);
    } catch {
      swalCustom.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema. Intentá de nuevo más tarde.",
      });
    }
  };

  return (
    <Modal
      show={visible}
      onHide={handleClose}
      centered
      className="auth-recovery-modal"
    >
      <Modal.Body className="auth-recovery-body">
        {!mailEnviado ? (
          <>
            <h2
              className="auth-title"
              style={{ fontSize: "1.8rem", marginBottom: "0.25rem" }}
            >
              Recuperar
              <br />
              <em>contraseña</em>
            </h2>

            <div className="auth-divider" style={{ margin: "1rem 0 1.5rem" }}>
              <span className="auth-divider-icon">✦</span>
            </div>

            <p
              className="auth-label"
              style={{
                color: "#555",
                marginBottom: "1rem",
                fontSize: "0.95rem",
              }}
            >
              Ingresá tu correo y te mandamos un enlace para restablecer tu
              contraseña.
            </p>

            <div className="auth-field">
              <label className="auth-label">Correo registrado</label>
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>

            <button
              className="auth-btn-primary"
              onClick={handleEnviarMail}
              style={{ marginTop: "0.5rem" }}
            >
              Enviar enlace
            </button>

            <div className="auth-separator">
              <span>o</span>
            </div>

            <button className="auth-btn-secondary" onClick={handleClose}>
              Cancelar
            </button>
          </>
        ) : (
          <>
            <h2
              className="auth-title"
              style={{ fontSize: "1.8rem", marginBottom: "0.25rem" }}
            >
              Revisá tu
              <br />
              <em>correo</em>
            </h2>

            <div className="auth-divider" style={{ margin: "1rem 0 1.5rem" }}>
              <span className="auth-divider-icon">✦</span>
            </div>

            <p
              style={{
                color: "#555",
                textAlign: "center",
                fontSize: "0.95rem",
              }}
            >
              Si <strong>{email}</strong> está registrado, vas a recibir un
              enlace para restablecer tu contraseña.
            </p>

            <p
              style={{
                color: "#888",
                textAlign: "center",
                fontSize: "0.85rem",
                marginTop: "0.5rem",
              }}
            >
              Revisá también la carpeta de spam.
            </p>

            <button
              className="auth-btn-primary"
              onClick={handleClose}
              style={{ marginTop: "1.5rem" }}
            >
              Entendido
            </button>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default RecuperarPasswordModal;
