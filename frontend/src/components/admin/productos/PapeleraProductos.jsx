import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Table, Button, Spinner, Badge } from "react-bootstrap";
import { FiEye, FiRotateCcw, FiArrowLeft, FiArchive } from "react-icons/fi";
import { useProductosStore } from "../../../store/productosStore";
import { toast } from "../../../utils/alerts";
import Swal from "sweetalert2";
import "../../../styles/admin/admin.css";

const PapeleraProductos = () => {
    const navigate = useNavigate();
    const { fetchPapelera, restaurarProducto } = useProductosStore();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    const cargarPapelera = async () => {
        try {
            setLoading(true);
            const data = await fetchPapelera();
            setProductos(data);
        } catch (error) {
            console.error("Error al cargar papelera:", error);
            toast("error", "No se pudo cargar la papelera");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarPapelera();
        //eslint-disable-next-line
    }, []);

    const handleRestaurar = async (producto) => {
        const result = await Swal.fire({
            title: "¿Restaurar producto?",
            text: `"${producto.nombreProducto}" volverá a la lista de productos como inactivo`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, restaurar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#198754",
        });

        if (!result.isConfirmed) return;

        try {
            await restaurarProducto(producto.idProducto);
            toast("success", "Producto restaurado correctamente");
            cargarPapelera();
        } catch (error) {
            console.error("Error al restaurar el producto:", error);
            toast("error", "No se pudo restaurar el producto");
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" />
                <p className="mt-3">Cargando papelera...</p>
            </Container>
        );
    }

    return (
        <div className="admin-productos-page">
            <Container fluid className="py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2>Productos archivados</h2>
                        <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                            los productos que están aquí no aparecen en el catálogo ni en la lista principal
                        </p>
                    </div>
                    <Button variant="secondary" onClick={() => navigate("/admin/productos")}>
                        <FiArrowLeft className="me-2" />
                        Volver a Productos
                    </Button>
                </div>

                <Card>
                    <Card.Body className="p-0">
                        <Table hover responsive className="mb-0">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Producto</th>
                                    <th>Categoría</th>
                                    <th>Eliminado el</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            La papelera está vacía
                                        </td>
                                    </tr>
                                ) : (
                                    productos.map((producto) => (
                                        <tr key={producto.idProducto}>
                                            <td>#{producto.idProducto}</td>
                                            <td>
                                                <strong>{producto.nombreProducto}</strong>
                                            </td>
                                            <td>{producto.categoriaNombre || "-"}</td>
                                            <td>
                                                {producto.fechaEliminacion
                                                    ? new Date(producto.fechaEliminacion).toLocaleDateString("es-AR", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                    })
                                                    : "-"}
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        onClick={() => navigate(`/admin/productos/${producto.idProducto}`)}
                                                        title="Ver detalle"
                                                    >
                                                        <FiEye />
                                                    </Button>
                                                    <Button
                                                        variant="outline-warning"
                                                        size="sm"
                                                        onClick={() => handleRestaurar(producto)}
                                                        title="Restaurar producto"
                                                    >
                                                        <FiRotateCcw />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>

                {productos.length > 0 && (
                    <div className="mt-3 text-center text-muted">
                        <small>{productos.length} producto{productos.length !== 1 ? "s" : ""} en papelera</small>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default PapeleraProductos;