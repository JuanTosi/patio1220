import { useState, useEffect } from "react";
import { Card, Badge } from "react-bootstrap";
import { FiCalendar, FiPackage, FiShoppingBag } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";

const getBadgeColor = (nombreEstado) => {
    const colors = {
        Pendiente: "warning",
        Confirmada: "info",
        Entregada: "success",
        Cancelada: "danger",
    };
    return colors[nombreEstado] || "secondary";
};

const getBorderColor = (nombreEstado) => {
    const colors = {
        Pendiente: "#ffc107",
        Confirmada: "#0dcaf0",
        Entregada: "#198754",
        Cancelada: "#dc3545",
    };
    return colors[nombreEstado] || "#dee2e6";
};

const CardReservas = ({ className = "" }) => {
    const navigate = useNavigate();
    const [ultimaReserva, setUltimaReserva] = useState(null);
    const [totalReservas, setTotalReservas] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarReservas = async () => {
            setLoading(false);
            try {
                const { data } = await api.get("/reservas/mis-reservas");
                setTotalReservas(data.length);
                setUltimaReserva(data.length > 0 ? data[0] : null);
            } catch (error) {
                console.error("Error al cargar reservas:", error);
            } finally {
                setLoading(false);
            }
        };

        cargarReservas();
    }, []);

    return (
        <Card className={`mp-card ${className}`}>
            <Card.Body className="mp-card-body">
                <div className="mp-card-head">
                    <h5 className="mp-card-h5">Reservas</h5>
                    {totalReservas > 0 && (
                        <button
                            type="button"
                            className="mp-text-action"
                            onClick={() => navigate("/mis-reservas")}
                            aria-label="Ver mis reservas"
                            title="Ver mis reservas"
                        >
                            Ver mis reservas
                        </button>
                    )}
                </div>

                <div className="mp-divider" />

                {loading ? (
                    <div className="mp-security-note mt-3">
                        <small className="text-muted">Cargando reservas...</small>
                    </div>
                ) : !ultimaReserva ? (
                    <div className="mp-security-note mt-3">
                        <small className="text-muted">
                            Todavía no tenés reservas.{" "}
                            <b>Explorá nuestros productos</b> y hacé tu primera compra.
                        </small>
                    </div>
                ) : (
                    <div
                        className="mp-security-note mt-3 p-2 rounded"
                        onClick={() => navigate(`/mis-reservas#reserva-${ultimaReserva.idReserva}`)}
                        style={{
                            borderLeft: `4px solid ${getBorderColor(ultimaReserva.nombreEstado)}`,
                            cursor: "pointer",
                            transition: "background-color 0.15s ease",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}
                        role="button"
                        aria-label={`Ver detalle de reserva #${ultimaReserva.idReserva}`}
                    >
                        <div className="d-flex align-items-start gap-2">
                            <FiShoppingBag size={16} className="text-muted mt-1 flex-shrink-0" />
                            <div className="flex-grow-1">
                                <div className="mb-1">
                                    <strong>Última reserva: #{ultimaReserva.idReserva}</strong>
                                </div>
                                <small className="text-muted d-flex align-items-center gap-1">
                                    <FiCalendar size={12} />
                                    {new Date(ultimaReserva.fechaReserva).toLocaleDateString("es-AR", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    })}
                                </small>
                                <small className="text-muted d-block mt-1">
                                    <Badge bg={getBadgeColor(ultimaReserva.nombreEstado)} className="me-2">
                                        {ultimaReserva.nombreEstado}
                                    </Badge>
                                </small>
                                <small className="text-muted d-block mt-1">
                                    <FiPackage size={12} className="me-1" />
                                    {ultimaReserva.productos.length}{" "}
                                    {ultimaReserva.productos.length === 1 ? "producto" : "productos"}
                                    {"  ·  "}
                                    <strong>${parseFloat(ultimaReserva.total).toFixed(2)}</strong>
                                </small>
                                {totalReservas > 1 && (
                                    <small className="text-muted fst-italic d-block mt-1">
                                        Tenés {totalReservas} reservas en total
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default CardReservas;