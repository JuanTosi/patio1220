import { useState, useEffect } from "react";
import { Table, Button, Badge, Form, InputGroup } from "react-bootstrap";
import { FiSearch, FiEdit2, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import axios from "../../../api/axiosConfig";
import { swalCustom } from "../../../utils/customSwal";
import Swal from "sweetalert2";
import Paginador from "../../../components/common/Paginador";
import "../../../styles/admin/admin.css";

const AdminUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroTexto, setFiltroTexto] = useState("");
    const [filtroRol, setFiltroRol] = useState("todos");
    const [filtroEstado, setFiltroEstado] = useState("activo");
    const [paginaActual, setPaginaActual] = useState(1);
    const usuariosPorPagina = 10;

    const cargarUsuarios = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/usuarios");
            setUsuarios(data);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            swalCustom.fire({
                icon: "error",
                title: "Error",
                text: "No se pudieron cargar los usuarios",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const usuariosFiltrados = usuarios.filter((u) => {
        const textoMatch =
            u.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
            u.apellido.toLowerCase().includes(filtroTexto.toLowerCase()) ||
            u.email.toLowerCase().includes(filtroTexto.toLowerCase());

        const rolMatch = filtroRol === "todos" || u.rol === filtroRol;
        const estadoMatch =
            filtroEstado === "todos" ||
            (filtroEstado === "activo" && u.activo) ||
            (filtroEstado === "inactivo" && !u.activo);

        return textoMatch && rolMatch && estadoMatch;
    });

    const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
    const indiceInicio = (paginaActual - 1) * usuariosPorPagina;
    const indiceFin = indiceInicio + usuariosPorPagina;
    const usuariosPaginados = usuariosFiltrados.slice(indiceInicio, indiceFin);

    const handleFiltroChange = (setter) => (e) => {
        setter(e.target.value);
        setPaginaActual(1);
    };

    const handleToggleEstado = async (usuario) => {
        const nuevoEstado = !usuario.activo;
        const accion = nuevoEstado ? "activar" : "desactivar";

        const result = await Swal.fire({
            title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
            text: `${usuario.nombre} ${usuario.apellido} será ${accion}do`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: "Cancelar",
        });

        if (!result.isConfirmed) return;

        if (usuario.rol === "admin" && !nuevoEstado) {
            const adminsActivos = usuarios.filter(u => u.rol === "admin" && u.activo);
            if (adminsActivos.length <= 1) {
                swalCustom.fire({
                    icon: "error",
                    title: "Acción no permitida",
                    text: "No podés desactivar a este usuario porque es el único administrador activo del sistema.",
                });
                return;
            }
        }

        try {
            await axios.patch(`/usuarios/${usuario.idUsuario}/estado`, { activo: nuevoEstado });
            swalCustom.fire({ icon: "success", title: "Estado actualizado", timer: 1500 });
            cargarUsuarios();
        } catch (error) {
            console.error("Error al cambiar estado:", error);
            swalCustom.fire({ icon: "error", title: "Error", text: "No se pudo cambiar el estado" });
        }
    };

    const handleCambiarRol = async (usuario) => {
        const { value: nuevoRol } = await Swal.fire({
            title: "Cambiar rol",
            input: "select",
            inputOptions: {
                cliente: "Cliente",
                empleado: "Empleado",
                admin: "Administrador",
            },
            inputValue: usuario.rol,
            showCancelButton: true,
            confirmButtonText: "Cambiar",
            cancelButtonText: "Cancelar",
        });

        if (!nuevoRol || nuevoRol === usuario.rol) return;

        if (usuario.rol === "admin" && nuevoRol !== "admin") {
            const adminsActivos = usuarios.filter(u => u.rol === "admin" && u.activo);
            if (adminsActivos.length <= 1) {
                swalCustom.fire({
                    icon: "error",
                    title: "Acción no permitida",
                    text: "No podés cambiar el rol de este usuario porque es el único administrador activo del sistema.",
                });
                return;
            }
        }

        try {
            await axios.patch(`/usuarios/${usuario.idUsuario}/rol`, { rol: nuevoRol });
            swalCustom.fire({ icon: "success", title: "Rol actualizado", timer: 1500 });
            cargarUsuarios();
        } catch (error) {
            console.error("Error al cambiar rol:", error);
            swalCustom.fire({ icon: "error", title: "Error", text: "No se pudo cambiar el rol" });
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header-section">
                <h2>Gestión de Usuarios</h2>
                <p className="text-muted">Administrá roles, estados y accesos de los usuarios</p>
            </div>

            <div className="admin-filters mb-4">
                <InputGroup className="mb-3">
                    <InputGroup.Text>
                        <FiSearch />
                    </InputGroup.Text>
                    <Form.Control
                        placeholder="Buscar por nombre, apellido o email..."
                        value={filtroTexto}
                        onChange={handleFiltroChange(setFiltroTexto)}
                    />
                </InputGroup>

                <div className="d-flex gap-2">
                    <Form.Select
                        value={filtroRol}
                        onChange={handleFiltroChange(setFiltroRol)}
                        style={{ maxWidth: "200px" }}
                    >
                        <option value="todos">Todos los roles</option>
                        <option value="cliente">Cliente</option>
                        <option value="empleado">Empleado</option>
                        <option value="admin">Administrador</option>
                    </Form.Select>

                    <Form.Select
                        value={filtroEstado}
                        onChange={handleFiltroChange(setFiltroEstado)}
                        style={{ maxWidth: "200px" }}
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="activo">Activos</option>
                        <option value="inactivo">Inactivos</option>
                    </Form.Select>
                </div>
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
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Teléfono</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuariosPaginados.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-4">
                                            No se encontraron usuarios
                                        </td>
                                    </tr>
                                ) : (
                                    usuariosPaginados.map((usuario) => (
                                        <tr key={usuario.idUsuario}>
                                            <td>{usuario.idUsuario}</td>
                                            <td>
                                                {usuario.nombre} {usuario.apellido}
                                            </td>
                                            <td>{usuario.email}</td>
                                            <td>{usuario.telefono || "-"}</td>
                                            <td>
                                                <Badge
                                                    bg={
                                                        usuario.rol === "admin"
                                                            ? "danger"
                                                            : usuario.rol === "empleado"
                                                                ? "warning"
                                                                : "secondary"
                                                    }
                                                >
                                                    {usuario.rol}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge bg={usuario.activo ? "success" : "danger"}>
                                                    {usuario.activo ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleCambiarRol(usuario)}
                                                        title="Cambiar rol"
                                                    >
                                                        <FiEdit2 />
                                                    </Button>
                                                    <Button
                                                        variant={usuario.activo ? "outline-warning" : "outline-success"}
                                                        size="sm"
                                                        onClick={() => handleToggleEstado(usuario)}
                                                        title={usuario.activo ? "Desactivar" : "Activar"}
                                                    >
                                                        {usuario.activo ? <FiToggleRight /> : <FiToggleLeft />}
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
                            Mostrando {indiceInicio + 1} - {Math.min(indiceFin, usuariosFiltrados.length)} <br /> de {usuariosFiltrados.length} usuarios
                            {usuariosFiltrados.length !== usuarios.length && ` (${usuarios.length} totales)`}
                        </small>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminUsuarios;