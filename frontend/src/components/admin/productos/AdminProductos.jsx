import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Table, Button, Form, Row, Col, Badge, Spinner } from "react-bootstrap";
import { FiEye, FiEdit2, FiToggleLeft, FiToggleRight, FiPlus, FiArchive, FiStar } from "react-icons/fi";
import { useProductosStore } from "../../../store/productosStore";
import { getPrecioMostrar, renderPrecio, getStockMostrar, getAlertaStock } from "../../../utils/productHelpers";
import { toast } from "../../../utils/alerts";
import Swal from "sweetalert2";
import Paginador from "../../../components/common/Paginador";
import "../../../styles/admin/admin.css";
import { useAuthStore } from "../../../store/authStore";

const AdminProductos = () => {
    const navigate = useNavigate();
    const { productos, loading, fetchProductos, toggleActivo, moverAPapelera, toggleDestacado } = useProductosStore();
    const { user } = useAuthStore();
    const esAdmin = user.rol === "admin";

    const [filtros, setFiltros] = useState({
        texto: "",
        categoria: "",
        estado: "activo",
        stock: "",
        destacado: "",
    });

    const [paginaActual, setPaginaActual] = useState(1);
    const productosPorPagina = 10;

    useEffect(() => {
        fetchProductos();
    }, [fetchProductos]);

    const categorias = useMemo(() => {
        const mapa = new Map();
        productos.forEach((p) => {
            if (p.idCategoria && p.categoriaNombre) {
                mapa.set(p.idCategoria, p.categoriaNombre);
            }
        });
        return Array.from(mapa.entries()).sort((a, b) => a[1].localeCompare(b[1]));
    }, [productos]);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros((prev) => ({ ...prev, [name]: value }));
        setPaginaActual(1);
    };

    const productosFiltrados = useMemo(() => {
        return productos.filter((producto) => {
            const coincideTexto =
                !filtros.texto ||
                producto.nombreProducto.toLowerCase().includes(filtros.texto.toLowerCase()) ||
                producto.idProducto.toString().includes(filtros.texto);

            const coincideCategoria =
                !filtros.categoria || producto.idCategoria?.toString() === filtros.categoria;

            const coincideEstado =
                filtros.estado === "" ||
                (filtros.estado === "activo" && producto.activo) ||
                (filtros.estado === "inactivo" && !producto.activo);

            const coincideStock =
                filtros.stock === "" ||
                (filtros.stock === "critico" && producto.tamanios?.some(t => Number(t.activo) === 1 && Number(t.stock) <= 3)) ||
                (filtros.stock === "bajo" && producto.tamanios?.some(t => Number(t.activo) === 1 && Number(t.stock) > 3 && Number(t.stock) <= 9)) ||
                (filtros.stock === "alerta" && getAlertaStock(producto.tamanios) !== null);

            const conincideDestacado =
                filtros.destacado === "" ||
                (filtros.destacado === "si" && Number(producto.destacado) === 1) ||
                (filtros.destacado === "no" && Number(producto.destacado) !== 1)


            return coincideTexto && coincideCategoria && coincideEstado && coincideStock && conincideDestacado;
        });
    }, [productos, filtros]);

    const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
    const indiceInicio = (paginaActual - 1) * productosPorPagina;
    const indiceFin = indiceInicio + productosPorPagina;
    const productosPaginados = productosFiltrados.slice(indiceInicio, indiceFin);

    const handleToggle = async (producto) => {
        const accion = producto.activo ? "desactivar" : "activar";
        const result = await Swal.fire({
            title: `¿${producto.activo ? "Desactivar" : "Activar"} producto?`,
            text: `¿Confirmás que querés ${accion} "${producto.nombreProducto}"?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: "Cancelar",
            confirmButtonColor: producto.activo ? "#e0a800" : "#198754",
        });

        if (!result.isConfirmed) return;

        try {
            await toggleActivo(producto.idProducto);
            toast(
                !producto.activo ? "success" : "warning",
                !producto.activo ? "Producto activado" : "Producto desactivado"
            );
        } catch (error) {
            console.error("Error al cambiar estado:", error);
            toast("error", "Error al cambiar estado del producto");
        }
    };

    const handleToggleDestacado = async (producto) => {
        const accion = producto.destacado ? "quitar de destacados" : "marcar como destacado";
        const result = await Swal.fire({
            title: producto.destacado ? "¿Quitar de destacados?" : "¿Marcar como destacado?",
            text: `¿Confirmás que querés ${accion} "${producto.nombreProducto}"?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, confirmar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#e0a800",
        });

        if (!result.isConfirmed) return;

        try {
            await toggleDestacado(producto.idProducto);
            toast(
                producto.destacado ? "warning" : "success",
                producto.destacado ? "Producto quitado de destacados" : "Producto marcado como destacado"
            );
        } catch (error) {
            console.error("Error al cambiar destacado:", error);
            toast("error", "Error al cambiar destacado del producto");
        }
    };

    // el siguiente comentaruio es la funcion que eliminaba logicamente los productos
    // const handleEliminar = async (producto) => {
    //     const result = await Swal.fire({
    //         title: "¿Eliminar producto?",
    //         text: `Se eliminará "${producto.nombreProducto}" y todos sus tamaños`,
    //         icon: "warning",
    //         showCancelButton: true,
    //         confirmButtonText: "Sí, eliminar",
    //         cancelButtonText: "Cancelar",
    //         confirmButtonColor: "#d33",
    //     });

    //     if (!result.isConfirmed) return;

    //     try {
    //         await deleteProducto(producto.idProducto);
    //         toast("success", "Producto eliminado correctamente");
    //     } catch (error) {
    //         console.error("Error al eliminar producto:", error);
    //         toast("error", "No se pudo eliminar el producto");
    //     }
    // };

    const handleEliminar = async (producto) => {
        const result = await Swal.fire({
            title: "¿Archivar producto?",
            text: `"${producto.nombreProducto}" se moverá a productos archivados y no será visible en el catálogo ni en esta lista.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, archivar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33",
        });

        if (!result.isConfirmed) return;

        try {
            await moverAPapelera(producto.idProducto);
            toast("success", "Producto archivado");
        } catch (error) {
            console.error("Error al archivar:", error);
            toast("error", "No se pudo archivar el producto");
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" />
                <p className="mt-3">Cargando productos...</p>
            </Container>
        );
    }

    return (
        <div className="admin-productos-page">
            <Container fluid className="py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Gestión de Productos</h2>
                    <div className="d-flex gap-2">
                        {esAdmin && (
                            <Button variant="secondary" onClick={() => navigate("/admin/productos/papelera")}>
                                <FiArchive className="me-2" />
                                Productos archivados
                            </Button>
                        )}
                        <Button variant="success" onClick={() => navigate("/admin/productos/nuevo")}>
                            <FiPlus className="me-2" />
                            Nuevo Producto
                        </Button>
                    </div>
                </div>

                <Card className="mb-4">
                    <Card.Body>
                        <Row>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label>Buscar</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="texto"
                                        value={filtros.texto}
                                        onChange={handleFiltroChange}
                                        placeholder="Nombre o ID..."
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label>Categoría</Form.Label>
                                    <Form.Select name="categoria" value={filtros.categoria} onChange={handleFiltroChange}>
                                        <option value="">Todas</option>
                                        {categorias.map(([id, nombre]) => (
                                            <option key={id} value={id}>{nombre}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label>Estado</Form.Label>
                                    <Form.Select name="estado" value={filtros.estado} onChange={handleFiltroChange}>
                                        <option value="">Todos</option>
                                        <option value="activo">Activos</option>
                                        <option value="inactivo">Inactivos</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label>Stock</Form.Label>
                                    <Form.Select name="stock" value={filtros.stock} onChange={handleFiltroChange}>
                                        <option value="">Todos</option>
                                        <option value="alerta">Bajo o crítico</option>
                                        <option value="bajo">Stock bajo</option>
                                        <option value="critico">Stock crítico</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label>Destacado</Form.Label>
                                    <Form.Select name="destacado" value={filtros.destacado} onChange={handleFiltroChange}>
                                        <option value="">Todos</option>
                                        <option value="si">Destacados</option>
                                        <option value="no">No destacados</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card>
                    <Card.Body className="p-0">
                        <Table hover responsive className="mb-0">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Producto</th>
                                    <th>Precio</th>
                                    <th>Stock</th>
                                    <th>Categoría</th>
                                    <th>Tamaños</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productosPaginados.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4 text-muted">
                                            No hay productos que coincidan con los filtros
                                        </td>
                                    </tr>
                                ) : (
                                    productosPaginados.map((producto) => (
                                        <tr key={producto.idProducto}>
                                            <td>#{producto.idProducto}</td>
                                            <td>
                                                <strong>{producto.nombreProducto}</strong>
                                            </td>
                                            <td className="text-success">
                                                <strong>{renderPrecio(getPrecioMostrar(producto))}</strong>
                                            </td>
                                            <td>
                                                {getStockMostrar(producto)}
                                                {producto.tamanios?.some(t => Number(t.activo) === 1 && Number(t.stock) <= 3) && (
                                                    <span title="Stock crítico" style={{ color: "#dc3545", marginLeft: 6 }}>⚠</span>
                                                )}
                                                {producto.tamanios?.some(t => Number(t.activo) === 1 && Number(t.stock) > 3 && Number(t.stock) <= 9) && (
                                                    <span title="Stock bajo" style={{ color: "#ffc107", marginLeft: 6 }}>⚠</span>
                                                )}
                                            </td>
                                            <td>{producto.categoriaNombre || "-"}</td>
                                            <td>
                                                {producto.tamanios?.length > 0 ? (
                                                    <span>
                                                        {producto.tamanios.length === 1
                                                            ? producto.tamanios[0].nombreTamanio
                                                            : `${producto.tamanios.length} tamaños`}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <Badge bg={producto.activo ? "success" : "danger"}>
                                                    {producto.activo ? "Activo" : "Inactivo"}
                                                </Badge>
                                                <br />
                                                <Badge bg={"warning"}>
                                                    {producto.destacado ? <FiStar style={{ color: "black" }} /> : ""}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        onClick={() => navigate(`/admin/productos/${producto.idProducto}`)}
                                                        title="Ver detalle"
                                                    >
                                                        <FiEye />
                                                    </Button>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => navigate(`/admin/productos/${producto.idProducto}/editar`)}
                                                        title="Editar"
                                                    >
                                                        <FiEdit2 />
                                                    </Button>
                                                    <Button
                                                        variant="outline-dark"
                                                        size="sm"
                                                        onClick={() => handleToggle(producto)}
                                                        title={producto.activo ? "Desactivar" : "Activar"}
                                                    >
                                                        {producto.activo ? <FiToggleRight /> : <FiToggleLeft />}
                                                    </Button>
                                                    <Button
                                                        variant={producto.destacado ? "warning" : "outline-warning"}
                                                        size="sm"
                                                        onClick={() => handleToggleDestacado(producto)}
                                                        title={producto.destacado ? "Quitar de destacados" : "Marcar como destacado"}
                                                    >
                                                        <FiStar />
                                                    </Button>
                                                    {esAdmin && (
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => handleEliminar(producto)}
                                                            title="Archivar"
                                                        >
                                                            <FiArchive />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>

                <Paginador
                    paginaActual={paginaActual}
                    totalPaginas={totalPaginas}
                    onChangePagina={setPaginaActual}
                />

                <div className="mt-3 text-center text-muted">
                    <small>
                        {productosFiltrados.length === 0
                            ? "Sin resultados"
                            : <>
                                Mostrando {indiceInicio + 1} - {Math.min(indiceFin, productosFiltrados.length)} de {productosFiltrados.length} productos
                                {productosFiltrados.length !== productos.length && ` (${productos.length} totales)`}
                            </>
                        }
                    </small>
                </div>
            </Container>
        </div>
    );
};

export default AdminProductos;