import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Badge, Form, InputGroup, Button } from "react-bootstrap";
import { FiSearch, FiEdit2, FiCheckCircle, FiEye } from "react-icons/fi";
import axios from "../../../api/axiosConfig";
import { swalCustom } from "../../../utils/customSwal";
import Swal from "sweetalert2";
import Paginador from "../../../components/common/Paginador";
import "../../../styles/admin/admin.css";

const AdminReservas = () => {
    const navigate = useNavigate();
    const [reservas, setReservas] = useState([]);
    const [estados, setEstados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroTexto, setFiltroTexto] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("activas");
    const [paginaActual, setPaginaActual] = useState(1);
    const reservasPorPagina = 10;

    const ESTADOS_FINALES = [5, 6];

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [resReservas, resEstados] = await Promise.all([
                axios.get("/reservas"),
                axios.get("/estados-reserva"),
            ]);
            setReservas(resReservas.data);
            setEstados(resEstados.data);
        } catch (error) {
            console.error("Error al cargar datos:", error);
            swalCustom.fire({
                icon: "error",
                title: "Error",
                text: "No se pudieron cargar las reservas",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const reservasFiltradas = reservas.filter((r) => {
        const textoMatch =
            r.idReserva.toString().includes(filtroTexto) ||
            (r.nombreCliente && r.nombreCliente.toLowerCase().includes(filtroTexto.toLowerCase())) ||
            (r.emailCliente && r.emailCliente.toLowerCase().includes(filtroTexto.toLowerCase()));

        const estadoMatch =
            filtroEstado === "todos" ||
            (filtroEstado === "activas" && !ESTADOS_FINALES.includes(r.idEstado)) ||
            r.idEstado.toString() === filtroEstado;
        return textoMatch && estadoMatch;
    });

    const totalPaginas = Math.ceil(reservasFiltradas.length / reservasPorPagina);
    const indiceInicio = (paginaActual - 1) * reservasPorPagina;
    const indiceFin = indiceInicio + reservasPorPagina;
    const reservasPaginadas = reservasFiltradas.slice(indiceInicio, indiceFin);

    const handleFiltroTextoChange = (e) => {
        setFiltroTexto(e.target.value);
        setPaginaActual(1);
    };

    const handleFiltroEstadoChange = (e) => {
        setFiltroEstado(e.target.value);
        setPaginaActual(1);
    };

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
            .filter(est => est.idEstado >= estadoActual || est.idEstado === 6)
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

    const handleTogglePagado = async (reserva) => {
        const nuevoPagado = !reserva.pagado;
        const accion = nuevoPagado ? "pagada" : "no pagada";

        const result = await Swal.fire({
            title: `¿Marcar como ${accion}?`,
            text: `Reserva #${reserva.idReserva}`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, confirmar",
            cancelButtonText: "Cancelar",
        });

        if (!result.isConfirmed) return;

        try {
            await axios.patch(`/reservas/${reserva.idReserva}/pagado`, {
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

    return (
        <div className="admin-page">
            <div className="admin-header-section">
                <h2>Gestión de Reservas</h2>
                <p className="text-muted">Administrá el estado y pagos de las reservas</p>
            </div>

            <div className="admin-filters mb-4">
                <InputGroup className="mb-3">
                    <InputGroup.Text>
                        <FiSearch />
                    </InputGroup.Text>
                    <Form.Control
                        placeholder="Buscar por ID, cliente o email..."
                        value={filtroTexto}
                        onChange={handleFiltroTextoChange}
                    />
                </InputGroup>

                <Form.Select value={filtroEstado} onChange={handleFiltroEstadoChange} style={{ maxWidth: "250px" }}>
                    <option value="activas">En proceso</option>
                    <option value="todos">Todos los estados</option>
                    {estados.map((est) => (
                        <option key={est.idEstado} value={est.idEstado}>
                            {est.nombreEstado}
                        </option>
                    ))}
                </Form.Select>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            ) : (
                <>
                    <div className="table-responsive">
                        <Table hover className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Fecha</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th>Pagado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservasPaginadas.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-4">
                                            No se encontraron reservas
                                        </td>
                                    </tr>
                                ) : (
                                    reservasPaginadas.map((reserva) => (
                                        <tr key={reserva.idReserva}>
                                            <td>#{reserva.idReserva}</td>
                                            <td>{reserva.nombreCliente || "-"}</td>
                                            <td>{new Date(reserva.fechaReserva).toLocaleDateString("es-AR")}</td>
                                            <td>${reserva.total}</td>
                                            <td>
                                                <Badge bg={getBadgeColor(reserva.idEstado)}>{reserva.nombreEstado}</Badge>
                                            </td>
                                            <td>
                                                <Badge bg={reserva.pagado ? "success" : "secondary"}>{reserva.pagado ? "Sí" : "No"}</Badge>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        variant="outline-info"
                                                        size="sm"
                                                        onClick={() => navigate(`/admin/reservas/${reserva.idReserva}`)}
                                                        title="Ver detalle"
                                                    >
                                                        <FiEye />
                                                    </Button>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleCambiarEstado(reserva)}
                                                        title="Cambiar estado"
                                                    >
                                                        <FiEdit2 />
                                                    </Button>
                                                    <Button
                                                        variant={reserva.pagado ? "outline-secondary" : "outline-success"}
                                                        size="sm"
                                                        onClick={() => handleTogglePagado(reserva)}
                                                        title={reserva.pagado ? "Marcar como no pagada" : "Marcar como pagada"}
                                                    >
                                                        <FiCheckCircle />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>

                    <Paginador paginaActual={paginaActual} totalPaginas={totalPaginas} onChangePagina={setPaginaActual} />

                    <div className="text-center text-muted mt-2">
                        <small>
                            {reservasFiltradas.length === 0
                                ? "Sin resultados"
                                : <>
                                    Mostrando {indiceInicio + 1} - {Math.min(indiceFin, reservasFiltradas.length)} de {reservasFiltradas.length} reservas
                                    {reservasFiltradas.length !== reservas.length && ` (${reservas.length} totales)`}
                                </>
                            }
                        </small>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminReservas;