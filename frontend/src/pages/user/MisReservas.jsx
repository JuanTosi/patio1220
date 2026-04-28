import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Container, Card, Badge, Button, Spinner, Alert, Row, Col, Form } from "react-bootstrap";
import { FiCalendar, FiPackage, FiCreditCard, FiMapPin, FiMessageSquare, FiTruck, FiFilter, FiChevronDown, FiChevronUp, FiXCircle } from "react-icons/fi";
import axios from "../../api/axiosConfig";
import { swalCustom } from "../../utils/customSwal";
import Swal from "sweetalert2";
import "../../styles/pages/misReservas.css";
import Paginador from "../../components/common/Paginador";

const getBadgeColor = (nombreEstado) => {
    const colors = {
        Pendiente: "warning",
        Confirmada: "info",
        Entregada: "success",
        Cancelada: "danger",
    };
    return colors[nombreEstado] || "secondary";
};

const formatFecha = (fecha) =>
    new Date(fecha).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

const formatTotal = (total) =>
    Number(total).toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
    });

const formatTipoEntrega = (tipo) => {
    if (tipo === "retiro_local") return "Retiro en local";
    if (tipo === "envio_domicilio") return "Envío a domicilio";
    return tipo;
};

const FILTROS_INICIALES = {
    estado: "todos",
    orden: "nuevas",
    pago: "todos",
};

const DetalleProductos = ({ productos }) => {
    if (!productos || productos.length === 0) {
        return <p className="text-muted small mb-0">Sin productos</p>;
    }

    return (
        <div className="detalle-productos mt-3">
            <h6 className="mb-2 text-muted" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Productos
            </h6>
            <div className="d-flex flex-column gap-2">
                {productos.map((prod, idx) => (
                    <div
                        key={idx}
                        className="d-flex justify-content-between align-items-start py-2 px-3 rounded"
                        style={{ backgroundColor: "#f8f9fa", fontSize: "0.875rem" }}
                    >
                        <div className="flex-grow-1">
                            <span className="fw-semibold">{prod.nombreProducto}</span>
                            {prod.nombreTamanio && (
                                <span className="text-muted ms-1">
                                    ({prod.dimension ? `${prod.dimension}` : ""})
                                </span>
                            )}
                            <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                {prod.cantidad} u. × {formatTotal(prod.precioUnitario)}
                            </div>
                        </div>
                        <span className="fw-semibold ms-3 text-nowrap">
                            {formatTotal(prod.subtotal)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ReservaCard = ({ reserva, expandida, onToggle, onCancelar }) => {
    const puedeCancel =
        reserva.nombreEstado === "Pendiente" ||
        reserva.nombreEstado === "Confirmada";

    const resumenProductos = reserva.productos?.length > 0
        ? reserva.productos
            .slice(0, 2)
            .map((p) => `${p.nombreProducto}${p.cantidad > 1 ? ` x${p.cantidad}` : ""}`)
            .join(", ") + (reserva.productos.length > 2 ? ` y ${reserva.productos.length - 2} más` : "")
        : null;

    return (
        <Card
            id={`reserva-${reserva.idReserva}`}
            className="reserva-card"
            style={{ transition: "background-color 0.5s ease" }}
        >
            <Card.Header className="reserva-card-header">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <span className="fw-semibold text-muted" style={{ fontSize: "0.85rem" }}>
                            Reserva #{reserva.idReserva}
                            <br />
                            <Badge bg={getBadgeColor(reserva.nombreEstado)} className="px-2 py-1" >
                                {reserva.nombreEstado}
                            </Badge>
                        </span>
                        <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                            {formatFecha(reserva.fechaReserva)}
                        </span>
                    </div>
                    {!expandida &&
                        <Button
                            variant="link"
                            size="sm"
                            onClick={() => onToggle(reserva.idReserva)}
                            className="text-decoration-none p-0"
                        >
                            Ver detalle <FiChevronDown size={14} className="ms-1" />
                        </Button>
                    }
                    {expandida &&
                        <Button
                            variant="link"
                            size="sm"
                            onClick={() => onToggle(reserva.idReserva)}
                            className="text-decoration-none p-0"
                        >
                            Ocultar detalle <FiChevronUp size={14} className="me-1" />
                        </Button>
                    }
                </div>
            </Card.Header>

            <Card.Body>
                {resumenProductos && !expandida && (
                    <div className="d-flex justify-content-between align-items-center">
                        <div
                            className="px-3 py-2 rounded"
                            style={{
                                backgroundColor: "#f0f4f0",
                                fontSize: "0.82rem",
                                color: "#555",
                                width: "100%"
                            }}
                        >
                            <span className="fw-bold" style={{ fontSize: "1.1rem" }}>
                                <Badge bg={reserva.pagado ? "success" : "secondary"} className="px-2 py-1" style={{ width: "25%" }}>
                                    {reserva.pagado ? "Pagada" : "Sin pagar"}
                                </Badge>
                                <br />
                                Total: {formatTotal(reserva.total)}
                            </span>
                            <br />
                            <FiPackage size={12} className="me-1" />
                            {resumenProductos}
                        </div>
                    </div>
                )}

                {expandida && (
                    <>
                        <div className="detalle-info mb-3">
                            <Badge bg={reserva.pagado ? "success" : "secondary"} className="px-2 py-1" style={{ width: "20%" }}>
                                {reserva.pagado ? "Pagada" : "Sin pagar"}
                            </Badge>
                            <div className="detalle-info-item">
                                <FiTruck size={15} className="text-muted" />
                                <div>
                                    <small className="text-muted d-block">Tipo de entrega</small>
                                    <span>{formatTipoEntrega(reserva.tipoEntrega)}</span>
                                </div>
                            </div>

                            {reserva.fechaRetiroEstimada && (
                                <div className="detalle-info-item">
                                    <FiCalendar size={15} className="text-muted" />
                                    <div>
                                        <small className="text-muted d-block">
                                            {reserva.tipoEntrega === "retiro_local" ? "Retiro estimado" : "Entrega estimada"}
                                        </small>
                                        <span>{formatFecha(reserva.fechaRetiroEstimada)}</span>
                                    </div>
                                </div>
                            )}

                            {reserva.tipoEntrega === "envio_domicilio" && reserva.direccionCompleta && (
                                <div className="detalle-info-item">
                                    <FiMapPin size={15} className="text-muted" />
                                    <div>
                                        <small className="text-muted d-block">Dirección de entrega</small>
                                        <span style={{ fontSize: "0.9rem" }}>
                                            {reserva.direccionCompleta}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {reserva.nombreMetodo && (
                                <div className="detalle-info-item">
                                    <FiCreditCard size={15} className="text-muted" />
                                    <div>
                                        <small className="text-muted d-block">Método de pago</small>
                                        <span>{reserva.nombreMetodo}</span>
                                    </div>
                                </div>
                            )}

                            {reserva.observaciones && (
                                <div className="detalle-info-item">
                                    <FiMessageSquare size={15} className="text-muted" />
                                    <div>
                                        <small className="text-muted d-block">Observaciones</small>
                                        <span style={{ fontSize: "0.9rem" }}>
                                            {reserva.observaciones}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DetalleProductos productos={reserva.productos} />
                        <div className="detalle-productos border-top mt-2">
                            <div className="d-flex flex-column mt-2">
                                <div
                                    className="d-flex justify-content-between align-items-start py-2 px-3 rounded"
                                    style={{ backgroundColor: "#f8f9fa", fontSize: "0.875rem" }}
                                >
                                    <div className="flex-grow-1">
                                        <span className="fw-semibold">Total:</span>
                                    </div>
                                    <span className="fw-semibold ms-3 text-nowrap">
                                        {formatTotal(reserva.total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex gap-2 justify-content-between align-items-center pt-3">
                            {puedeCancel && (
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => onCancelar(reserva.idReserva)}
                                >
                                    Cancelar reserva
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </Card.Body>
        </Card>
    );
};

const MisReservas = () => {
    const location = useLocation();

    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reservaExpandida, setReservaExpandida] = useState(null);
    const [filtros, setFiltros] = useState(FILTROS_INICIALES);
    const [paginaActual, setPaginaActual] = useState(1);

    const RESERVAS_POR_PAGINA = 6;

    const reservasFiltradas = useMemo(() => {
        let resultado = [...reservas];

        if (filtros.estado !== "todos") {
            resultado = resultado.filter((r) => r.nombreEstado === filtros.estado);
        }

        if (filtros.pago === "pagadas") {
            resultado = resultado.filter((r) => r.pagado);
        } else if (filtros.pago === "sinPagar") {
            resultado = resultado.filter((r) => !r.pagado);
        }

        resultado.sort((a, b) => {
            const diff = new Date(a.fechaReserva) - new Date(b.fechaReserva);
            return filtros.orden === "nuevas" ? -diff : diff;
        });

        return resultado;
    }, [reservas, filtros]);

    const totalPaginas = Math.ceil(reservasFiltradas.length / RESERVAS_POR_PAGINA);

    const reservasPaginadas = useMemo(() => {
        const inicio = (paginaActual - 1) * RESERVAS_POR_PAGINA;
        return reservasFiltradas.slice(inicio, inicio + RESERVAS_POR_PAGINA);
    }, [reservasFiltradas, paginaActual]);

    const hayFiltrosActivos =
        filtros.estado !== "todos" ||
        filtros.pago !== "todos" ||
        filtros.orden !== "nuevas";

    const cargarReservas = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/reservas/mis-reservas");
            setReservas(data);
        } catch (error) {
            console.error("Error al cargar reservas:", error);
            swalCustom.fire({
                icon: "error",
                title: "Error",
                text: "No se pudieron cargar tus reservas",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarReservas();
    }, []);

    useEffect(() => {
        if (!location.hash) return;

        const id = location.hash.replace("#reserva-", "");
        const timer = setTimeout(() => {
            const elemento = document.getElementById(`reserva-${id}`);
            if (!elemento) return;

            elemento.scrollIntoView({ behavior: "smooth", block: "center" });
            elemento.style.backgroundColor = "#fff3cd";
            setReservaExpandida(Number(id));

            setTimeout(() => {
                elemento.style.backgroundColor = "";
                window.history.replaceState(null, "", location.pathname);
            }, 2000);
        }, 300);

        return () => clearTimeout(timer);
        //eslint-disable-next-line
    }, [location.hash, loading]);

    const handleCancelar = async (idReserva) => {
        const result = await Swal.fire({
            title: "¿Cancelar reserva?",
            text: `La reserva #${idReserva} será cancelada`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, cancelar",
            cancelButtonText: "No",
            confirmButtonColor: "#d33",
        });

        if (!result.isConfirmed) return;

        try {
            await axios.patch(`/reservas/${idReserva}/cancelar`);
            swalCustom.fire({
                icon: "success",
                title: "Reserva cancelada",
                timer: 1500,
            });
            cargarReservas();
        } catch (error) {
            console.error("Error al cancelar:", error);
            swalCustom.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.error || "No se pudo cancelar la reserva",
            });
        }
    };

    const toggleDetalle = (idReserva) => {
        setReservaExpandida((prev) => (prev === idReserva ? null : idReserva));
    };

    const handleFiltroChange = (campo, valor) => {
        setFiltros((prev) => ({ ...prev, [campo]: valor }));
        setReservaExpandida(null);
        setPaginaActual(1);
    };

    const handleLimpiarFiltros = () => {
        setFiltros(FILTROS_INICIALES);
        setReservaExpandida(null);
        setPaginaActual(1);
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" />
                <p className="mt-3 text-muted">Cargando tus reservas...</p>
            </Container>
        );
    }

    return (
        <div className="mis-reservas-page">
            <Container className="py-4">

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-0">Mis Reservas</h2>
                    </div>
                </div>

                {reservas.length === 0 ? (
                    <Alert variant="info" className="d-flex align-items-center gap-2">
                        <FiPackage size={22} />
                        <span>
                            No tenés reservas aún.{" "}
                            <a href="/catalogo" className="alert-link">
                                Explorá nuestros productos
                            </a>{" "}
                            y hacé tu primera compra.
                        </span>
                    </Alert>
                ) : (
                    <>
                        <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                            <Form.Select
                                size="sm"
                                value={filtros.estado}
                                onChange={(e) => handleFiltroChange("estado", e.target.value)}
                                style={{ width: "auto" }}
                            >
                                <option value="todos">Todos los estados</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Confirmada">Confirmada</option>
                                <option value="Entregada">Entregada</option>
                                <option value="Cancelada">Cancelada</option>
                            </Form.Select>

                            <Form.Select
                                size="sm"
                                value={filtros.pago}
                                onChange={(e) => handleFiltroChange("pago", e.target.value)}
                                style={{ width: "auto" }}
                            >
                                <option value="todos">Todos los pagos</option>
                                <option value="pagadas">Pagadas</option>
                                <option value="sinPagar">Sin pagar</option>
                            </Form.Select>

                            <Form.Select
                                size="sm"
                                value={filtros.orden}
                                onChange={(e) => handleFiltroChange("orden", e.target.value)}
                                style={{ width: "auto" }}
                            >
                                <option value="nuevas">Más nuevas primero</option>
                                <option value="viejas">Más viejas primero</option>
                            </Form.Select>

                            {hayFiltrosActivos && (
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={handleLimpiarFiltros}
                                    className="d-flex align-items-center gap-1"
                                >
                                    <FiXCircle size={13} />
                                    Limpiar
                                </Button>
                            )}
                        </div>

                        {reservasFiltradas.length === 0 ? (
                            <Alert variant="light" className="border">
                                <p className="mb-1 fw-semibold">
                                    No hay reservas que coincidan con los filtros aplicados.
                                </p>
                                <Button
                                    variant="link"
                                    className="p-0"
                                    onClick={handleLimpiarFiltros}
                                >
                                    Limpiar filtros
                                </Button>
                            </Alert>
                        ) : (
                            <Row xs={1} lg={2} className="g-3">
                                {reservasPaginadas.map((reserva) => (
                                    <Col key={reserva.idReserva}>
                                        <ReservaCard
                                            reserva={reserva}
                                            expandida={reservaExpandida === reserva.idReserva}
                                            onToggle={toggleDetalle}
                                            onCancelar={handleCancelar}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        )}
                        <Paginador
                            paginaActual={paginaActual}
                            totalPaginas={totalPaginas}
                            onChangePagina={(pagina) => {
                                setPaginaActual(pagina);
                                setReservaExpandida(null);
                            }}
                        />
                        {reservas.length > 0 && (
                            <div className="mt-2 text-center text-muted">
                                <small>
                                    Mostrando {reservasFiltradas.length} de {reservas.length} reserva{reservas.length !== 1 ? "s" : ""}
                                </small>
                            </div>
                        )}
                    </>
                )}
            </Container>
        </div>
    );
};

export default MisReservas;