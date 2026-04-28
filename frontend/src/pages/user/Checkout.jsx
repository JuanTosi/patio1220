import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Form,
} from "react-bootstrap";
import { useCarritoStore } from "../../store/carritoStore";
import { useAuthStore } from "../../store/authStore";
import ResumenCarrito from "../../components/checkout/ResumenCarrito";
import SeccionTipoEntrega from "../../components/checkout/SeccionTipoEntrega";
import SeccionDireccion from "../../components/checkout/SeccionDireccion";
import SeccionPago from "../../components/checkout/SeccionPago";
import axios from "../../api/axiosConfig";
import { swalCustom } from "../../utils/customSwal";
import Swal from "sweetalert2";
import { FiMessageSquare } from "react-icons/fi";
import "../../styles/pages/checkout.css";
import { generarComprobantePDF } from "../../utils/generarComprobantePDF";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { carrito, totalCarrito, vaciarCarrito } = useCarritoStore();

  const total = totalCarrito();

  const [tipoEntrega, setTipoEntrega] = useState("retiro_local");
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState(null);
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validarCheckout = () => {
    if (tipoEntrega === "envio_domicilio" && !direccionSeleccionada) {
      setError("Seleccioná una dirección de entrega");
      return false;
    }
    if (!metodoPagoSeleccionado) {
      setError("Seleccioná un método de pago");
      return false;
    }
    setError("");
    return true;
  };

  const handleConfirmarCompra = async () => {
    if (!validarCheckout()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const result = await Swal.fire({
      title: "¿Confirmar reserva?",
      html: `
        <p>Total: <strong>$${total.toFixed(2)}</strong></p>
        <p>Productos: ${carrito.length}</p>
        <p>Tipo de entrega: <strong>${tipoEntrega === "retiro_local" ? "Retiro en local" : "Envío a domicilio"}</strong></p>
        <p>Método de pago: ${metodoPagoSeleccionado.nombreMetodo}</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#28a745",
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      const reservaData = {
        idUsuario: user.idUsuario,
        nombreCliente: user.nombre,
        apellidoCliente: user.apellido,
        emailCliente: user.email,
        telefonoCliente: user.telefono || "",
        tipoEntrega: tipoEntrega,
        idDireccion:
          tipoEntrega === "envio_domicilio"
            ? direccionSeleccionada.idDireccion
            : null,
        idMetodoPago: metodoPagoSeleccionado.idMetodoPago,
        observaciones: observaciones.trim() || null,
        total: total,
        productos: carrito.map((item) => ({
          idProducto: item.idProducto,
          idTamanio: item.idTamanio || null,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
        })),
      };

      console.log("=== DATOS ANTES DE ENVIAR ===");
      console.log("tipoEntrega:", tipoEntrega);
      console.log("reservaData:", reservaData);
      const { data } = await axios.post("/reservas", reservaData);

      const productosParaPDF = [...carrito];

      const swalResult = await swalCustom.fire({
        icon: "success",
        title: "¡Reserva creada!",
        html: `
        <p>Tu reserva <strong>#${data.idReserva}</strong> fue creada exitosamente.</p>
        <p>Te enviamos un email de confirmación.</p>
    `,
        confirmButtonText: "Aceptar",
        showDenyButton: true,
        denyButtonText: "📄 Descargar comprobante",
        denyButtonColor: "#6c757d",
      });

      if (swalResult.isDenied) {
        generarComprobantePDF(
          data.idReserva,
          productosParaPDF,
          total,
          tipoEntrega,
          metodoPagoSeleccionado.nombreMetodo,
          user,
        );
      }

      vaciarCarrito();

      setTimeout(() => {
        navigate("/mis-reservas");
      }, 100);
    } catch (error) {
      console.error("Error al crear reserva:", error);

      const errorMsg =
        error.response?.data?.error || "No se pudo crear la reserva";

      swalCustom.fire({
        icon: "error",
        title: "Error",
        text: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  if (carrito.length === 0 && !loading) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          <h5>Carrito vacío</h5>
          <p>No hay productos para finalizar la compra</p>
          <Button onClick={() => navigate("/catalogo")}>Ver productos</Button>
        </Alert>
      </Container>
    );
  } else {
    return (
      <div className="checkout-page">
        <Container className="py-4">
          <h2 className="checkout-title mb-4">Finalizar Compra</h2>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Row>
            <Col lg={5} className="mb-4">
              <ResumenCarrito carrito={carrito} total={total} />
            </Col>

            <Col lg={7}>
              <Card className="mb-4">
                <Card.Body>
                  <SeccionTipoEntrega
                    tipoEntrega={tipoEntrega}
                    onSeleccionar={setTipoEntrega}
                  />
                </Card.Body>
              </Card>

              {tipoEntrega === "envio_domicilio" && (
                <Card className="mb-4">
                  <Card.Body>
                    <SeccionDireccion
                      direccionSeleccionada={direccionSeleccionada}
                      onSeleccionar={setDireccionSeleccionada}
                    />
                  </Card.Body>
                </Card>
              )}

              <Card className="mb-4">
                <Card.Body>
                  <SeccionPago
                    metodoPagoSeleccionado={metodoPagoSeleccionado}
                    onSeleccionar={setMetodoPagoSeleccionado}
                  />
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Body>
                  <h5 className="mb-3">
                    <FiMessageSquare className="me-2" />
                    Observaciones (opcional)
                  </h5>
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Ej: Timbre roto, llamar al portero. Dejar en recepción..."
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      maxLength={500}
                    />
                    <Form.Text className="text-muted">
                      {observaciones.length}/500 caracteres
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
              </Card>

              <div className="checkout-actions">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate("/catalogo")}
                  disabled={loading}
                >
                  Seguir comprando
                </Button>
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleConfirmarCompra}
                  disabled={loading}
                >
                  {loading
                    ? "Procesando..."
                    : `Confirmar compra - $${total.toFixed(2)}`}
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
};

export default Checkout;
