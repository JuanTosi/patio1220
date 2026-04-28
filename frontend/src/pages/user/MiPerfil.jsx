import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import { useAuthStore } from "../../store/authStore.js";
import "../../styles/pages/MiPerfil.css";
import CardDatosUsuario from "../../components/profile/CardDatosUsuario.jsx";
import CardModificarPassword from "../../components/profile/CardModificarPassword.jsx";
import CardDirecciones from "../../components/profile/CardDirecciones";
import CardReservas from "../../components/profile/CardReservas.jsx";
import api from "../../api/axiosConfig.js";

function getInitialData(u) {
  return {
    nombre: u?.nombre || "",
    apellido: u?.apellido || "",
    telefono: u?.telefono || "",
    direccion: u?.direccion || "",
  };
}

function getInitialSecurity() {
  return {
    passwordActual: "",
    nuevaPassword: "",
    confirmarNuevaPassword: "",
  };
}

const MiPerfil = () => {
  const { user, updateUser } = useAuthStore();
  const [cardAbierta, setCardAbierta] = useState(null);
  const [initialData, setInitialData] = useState(() => getInitialData(user));
  const [formData, setFormData] = useState(() => getInitialData(user));
  const [security, setSecurity] = useState(() => getInitialSecurity());
  const [uiMsg, setUiMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    const data = getInitialData(user);
    setInitialData(data);
    setFormData(data);
    setSecurity(getInitialSecurity());
    setCardAbierta(null);
  }, [user]);

  const hasProfileChanges =
    JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleEditDatos = () => {
    setUiMsg({ type: "", text: "" });
    setCardAbierta('datos');
  };

  const handleCancelDatos = () => {
    setFormData(initialData);
    setUiMsg({ type: "", text: "" });
    setCardAbierta(null);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!hasProfileChanges) {
      setUiMsg({ type: "info", text: "No hay cambios para guardar." });
      return;
    }

    try {
      const { data } = await api.put("/usuarios/me", formData);

      if (!data?.success || !data?.user) {
        setUiMsg({
          type: "danger",
          text: "Respuesta invalida del servidor al actualizar el perfil.",
        });
        return;
      }

      updateUser(data.user);

      const updated = getInitialData(data.user);
      setInitialData(updated);
      setFormData(updated);

      setCardAbierta(null);
      setUiMsg({ type: "success", text: "Perfil actualizado con exito." });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const status = error?.response?.status;
      const backendMsg = error?.response?.data?.message;

      const msg =
        backendMsg ||
        (status === 401
          ? "Sesion invalida o expirada. Volve a iniciar sesion."
          : "No se pudo actualizar el perfil.");
      setUiMsg({ type: "danger", text: msg });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleEditPassword = () => {
    setUiMsg({ type: "", text: "" });
    setSecurity(getInitialSecurity());
    setCardAbierta('password');
  };

  const handleCancelPassword = () => {
    setSecurity(getInitialSecurity());
    setUiMsg({ type: "", text: "" });
    setCardAbierta(null);
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurity((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setUiMsg({ type: "", text: "" });

    const { passwordActual, nuevaPassword, confirmarNuevaPassword } = security;

    if (!passwordActual || !nuevaPassword || !confirmarNuevaPassword) {
      setUiMsg({ type: "danger", text: "Completa todos los campos" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (nuevaPassword !== confirmarNuevaPassword) {
      setUiMsg({
        type: "danger",
        text: "Las contraseñas no coinciden",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (nuevaPassword.length < 6 || nuevaPassword.length > 30) {
      setUiMsg({
        type: "danger",
        text: "La contraseña debe contener entre 6 y 30 caracteres",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (/\s/.test(nuevaPassword)) {
      setUiMsg({
        type: "danger",
        text: "La contraseña no puede contener espacios",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const { data } = await api.put("/usuarios/me/password", {
        passwordActual,
        nuevaPassword,
      });

      if (!data?.success) {
        setUiMsg({
          type: "danger",
          text: "Respuesta invalida del servidor al actualizar la contraseña",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      setSecurity(getInitialSecurity());
      setCardAbierta(null);
      setUiMsg({ type: "success", text: "Contraseña actualizada con exito." });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const status = error?.response?.status;
      const backendMsg = error?.response?.data?.message;
      const msg =
        backendMsg ||
        (status === 401
          ? "Contraseña actual incorrecta."
          : status === 400
            ? "Datos inválidos. Revisá los campos."
            : "No se pudo actualizar la contraseña.");

      setUiMsg({ type: "danger", text: msg });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleEditDirecciones = () => {
    setUiMsg({ type: "", text: "" });
    setCardAbierta('direcciones');
  };

  const handleCancelDirecciones = () => {
    setUiMsg({ type: "", text: "" });
    setCardAbierta(null);
  };

  return (
    <div className="mi-perfil-page">
      <Container className="mi-perfil-container">
        <div className="mi-perfil-header">
          <div>
            <h1 className="mi-perfil-title">Mi perfil</h1>
            <p className="mi-perfil-subtitle">
              Administrá tu información personal y de contacto.
            </p>
          </div>
        </div>

        {uiMsg.text && (
          <Alert
            variant={uiMsg.type || "info"}
            className="mi-perfil-alert"
            dismissible
            onClose={() => setUiMsg({ type: "", text: "" })}
          >
            {uiMsg.text}
          </Alert>
        )}

        <Row className="g-4">
          <Col lg={4}>
            <Card className="mp-card mp-card-sticky">
              <Card.Body>
                <div className="mp-identity">
                  <div className="mp-avatar" aria-hidden="true">
                    {(() => {
                      const nombre = String(user?.nombre || "").trim();
                      const apellido = String(user?.apellido || "").trim();

                      const inicialNombre = nombre
                        ? nombre.charAt(0).toUpperCase()
                        : "";
                      const inicialApellido = apellido
                        ? apellido.charAt(0).toUpperCase()
                        : "";

                      if (inicialNombre && inicialApellido)
                        return `${inicialNombre}${inicialApellido}`;
                      if (inicialNombre) return inicialNombre;
                      return "U";
                    })()}
                  </div>

                  <div className="mp-identity-text">
                    <div className="mp-name">
                      {formData.nombre || user.nombre}
                      {formData.apellido ? ` ${formData.apellido}` : ""}
                    </div>

                    <div className="mp-email">
                      {String(user.email || "").toLowerCase()}
                    </div>
                  </div>
                </div>

                <div className="mp-divider" />

                <div className="mp-readonly">
                  <div className="mp-readonly-row">
                    <span className="mp-label">Tipo de usuario</span>
                    <span className="mp-value" style={{ textTransform: "capitalize" }}>
                      {user.rol || "-"}
                    </span>
                  </div>

                  <div className="mp-readonly-row">
                    <span className="mp-label">Teléfono</span>
                    <span className="mp-value">
                      {user.telefono || "No especificado"}
                    </span>
                  </div>

                  <div className="mp-readonly-row">
                    <span className="mp-label">Miembro desde</span>
                    <span className="mp-value">
                      {user.fechaRegistro
                        ? new Date(user.fechaRegistro).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })
                        : "-"}
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <CardDatosUsuario
              isOpen={cardAbierta === 'datos'}
              onEdit={handleEditDatos}
              onCancel={handleCancelDatos}
              onSubmit={handleProfileSubmit}
              formData={formData}
              onChange={handleProfileChange}
              hasChanges={hasProfileChanges}
            />

            <CardModificarPassword
              className="mt-4"
              isOpen={cardAbierta === 'password'}
              onEdit={handleEditPassword}
              onCancel={handleCancelPassword}
              onSubmit={handlePasswordSubmit}
              security={security}
              onChange={handleSecurityChange}
            />

            <CardDirecciones
              className="mt-4"
              isOpen={cardAbierta === 'direcciones'}
              onEdit={handleEditDirecciones}
              onCancel={handleCancelDirecciones}
            />

            <CardReservas
              className="mt-4 mb-4"
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MiPerfil;