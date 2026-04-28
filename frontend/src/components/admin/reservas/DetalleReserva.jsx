import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Badge, Table, Button, Spinner, Alert } from "react-bootstrap";
import { FiArrowLeft, FiUser, FiCalendar, FiPackage, FiCreditCard, FiMapPin, FiTruck, FiMessageSquare, FiEdit2, FiCheckCircle } from "react-icons/fi";
import axios from "../../../api/axiosConfig";
import { swalCustom } from "../../../utils/customSwal";
import Swal from "sweetalert2";
import "../../../styles/admin/detalleReserva.css";

const DetalleReserva = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [reserva, setReserva] = useState(null);
    const [estados, setEstados] = useState([]);
    const [loading, setLoading] = useState(true);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [resReserva, resEstados] = await Promise.all([
                axios.get(`/reservas/${id}`),
                axios.get("/estados-reserva"),
            ]);
            setReserva(resReserva.data);
            setEstados(resEstados.data);
        } catch (error) {
            console.error("Error al cargar reserva:", error);
            swalCustom.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo cargar la reserva",
            });
            navigate("/admin/reservas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
        //eslint-disable-next-line
    }, [id]);

    const handleCambiarEstado = async (reserva) => {
        const estadoActual = reserva.idEstado;

        if (estadoActual === 5 || estadoActual === 6) {
            swalCustom.fire({
                icon: "info",
                title: "Sin transiciones disponibles",
                text: "Esta reserva no puede cambiar de estado.",
            });
            return;
        }

        const opcionesEstados = estados
            .filter(est => est.idEstado > estadoActual || est.idEstado === 6)
            .reduce((acc, est) => {
                acc[est.idEstado] = est.nombreEstado;
                return acc;
            }, {});

        const { value: nuevoEstadoId } = await Swal.fire({
            title: "Cambiar estado de reserva",
            input: "select",
            inputOptions: opcionesEstados,
            showCancelButton: true,
            confirmButtonText: "Cambiar",
            cancelButtonText: "Cancelar",
        });

        if (!nuevoEstadoId) return;

        try {
            await axios.patch(`/reservas/${reserva.idReserva}/estado`, {
                idEstado: parseInt(nuevoEstadoId),
            });

            swalCustom.fire({
                icon: "success",
                title: "Estado actualizado",
                timer: 1500,
            });

            cargarDatos();
        } catch (error) {
            console.error("Error al cambiar estado:", error);
            swalCustom.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.error || "No se pudo cambiar el estado",
            });
        }
    };

    const handleTogglePagado = async () => {
        const nuevoPagado = !reserva.pagado;
        const accion = nuevoPagado ? "pagada" : "no pagada";

        const result = await Swal.fire({
            title: `¿Marcar como ${accion}?`,
            text: `Reserva #${id}`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, confirmar",
            cancelButtonText: "Cancelar",
        });

        if (!result.isConfirmed) return;

        try {
            await axios.patch(`/reservas/${id}/pagado`, {
                pagado: nuevoPagado,
            });

            swalCustom.fire({
                icon: "success",
                title: "Estado de pago actualizado",
                timer: 1500,
            });

            cargarDatos();
        } catch (error) {
            console.error("Error al cambiar estado de pago:", error);
            swalCustom.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo actualizar el estado de pago",
            });
        }
    };

    const getBadgeColor = (idEstado) => {
        const colors = {
            1: "warning",
            2: "info",
            3: "success",
            4: "danger",
        };
        return colors[idEstado] || "secondary";
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" />
                <p className="mt-3">Cargando detalle de reserva...</p>
            </Container>
        );
    }

    if (!reserva) {
        return (
            <Container className="py-5">
                <Alert variant="danger">No se encontró la reserva</Alert>
            </Container>
        );
    }

    return (
        <div className="detalle-reserva-page">
            <Container className="py-4">
                <Button
                    variant="outline-secondary"
                    className="mb-4"
                    onClick={() => navigate(-1)}
                >
                    <FiArrowLeft className="me-2" />
                    Volver
                </Button>

                <Row>
                    <Col lg={8}>
                        <Card className="mb-4">
                            <Card.Header>
                                <h5 className="mb-0">
                                    <FiUser className="me-2" />
                                    Información del Cliente
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <strong>Nombre completo:</strong>
                                        <p className="mb-0">
                                            {reserva.nombreCliente} {reserva.apellidoCliente}
                                        </p>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <strong>Email:</strong>
                                        <p className="mb-0">{reserva.emailCliente}</p>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <strong>Teléfono:</strong>
                                        <p className="mb-0">{reserva.telefonoCliente || "-"}</p>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <strong>Fecha de reserva:</strong>
                                        <p className="mb-0">
                                            <FiCalendar className="me-2" />
                                            {new Date(reserva.fechaReserva).toLocaleString("es-AR")}
                                        </p>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <Card className="mb-4">
                            <Card.Header>
                                <h5 className="mb-0">
                                    <FiPackage className="me-2" />
                                    Productos
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <Table bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Tamaño</th>
                                            <th>Cantidad</th>
                                            <th>Precio Unit.</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reserva.productos.map((prod, idx) => (
                                            <tr key={idx}>
                                                <td>{prod.nombreProducto}</td>
                                                <td>{prod.dimension || prod.nombreTamanio || "-"}</td>
                                                <td>{prod.cantidad}</td>
                                                <td>${prod.precioUnitario}</td>
                                                <td>
                                                    <strong>${prod.subtotal}</strong>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="4" className="text-end">
                                                <strong>TOTAL:</strong>
                                            </td>
                                            <td>
                                                <strong className="text-success fs-5">
                                                    ${reserva.total}
                                                </strong>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </Table>
                            </Card.Body>
                        </Card>

                        <Card className="mb-4">
                            <Card.Header>
                                <h5 className="mb-0">
                                    <FiCreditCard className="me-2" />
                                    Método de Pago y Entrega
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <strong>Método de pago:</strong>
                                        <p className="mb-0">{reserva.nombreMetodo || "-"}</p>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <strong>Tipo de entrega:</strong>
                                        <p className="mb-0">
                                            <FiTruck className="me-2" />
                                            {reserva.tipoEntrega === "retiro_local"
                                                ? "Retiro en local"
                                                : "Envío a domicilio"}
                                        </p>
                                    </Col>
                                </Row>

                                {reserva.direccionCompleta && (
                                    <div className="mt-2">
                                        <strong>
                                            <FiMapPin className="me-2" />
                                            Dirección de entrega:
                                        </strong>
                                        <p className="mb-0">{reserva.direccionCompleta}</p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {reserva.observaciones && (
                            <Card className="mb-4">
                                <Card.Header>
                                    <h5 className="mb-0">
                                        <FiMessageSquare className="me-2" />
                                        Observaciones
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <p className="mb-0">{reserva.observaciones}</p>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>

                    <Col lg={4}>
                        <Card className="sticky-top" style={{ top: "20px" }}>
                            <Card.Header>
                                <h5 className="mb-0">Estado y Acciones</h5>
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-4">
                                    <strong className="d-block mb-2">Estado de la reserva:</strong>
                                    <Badge
                                        bg={getBadgeColor(reserva.idEstado)}
                                        className="fs-6 px-3 py-2"
                                    >
                                        {reserva.nombreEstado}
                                    </Badge>
                                </div>

                                <Button
                                    variant="outline-primary"
                                    className="w-100 mb-3"
                                    onClick={() => handleCambiarEstado(reserva)}
                                >
                                    <FiEdit2 className="me-2" />
                                    Cambiar estado
                                </Button>

                                <hr />

                                <div className="mb-4">
                                    <strong className="d-block mb-2">Estado de pago:</strong>
                                    <Badge
                                        bg={reserva.pagado ? "success" : "secondary"}
                                        className="fs-6 px-3 py-2"
                                    >
                                        {reserva.pagado ? "Pagada" : "Sin pagar"}
                                    </Badge>
                                </div>

                                <Button
                                    variant={reserva.pagado ? "outline-secondary" : "outline-success"}
                                    className="w-100"
                                    onClick={handleTogglePagado}
                                >
                                    <FiCheckCircle className="me-2" />
                                    {reserva.pagado ? "Marcar como no pagada" : "Marcar como pagada"}
                                </Button>

                                <hr />

                                <div className="mt-4">
                                    <small className="text-muted d-block mb-2">
                                        <strong>ID de reserva:</strong> #{reserva.idReserva}
                                    </small>
                                    <small className="text-muted d-block mb-2">
                                        <strong>ID de usuario:</strong> {reserva.idUsuario}
                                    </small>
                                    {reserva.fechaRetiroEstimada && (
                                        <small className="text-muted d-block">
                                            <strong>Fecha estimada retiro:</strong>{" "}
                                            {new Date(reserva.fechaRetiroEstimada).toLocaleDateString("es-AR")}
                                        </small>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default DetalleReserva;