import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Badge, Table, Button, Spinner, Alert } from "react-bootstrap";
import { FiArrowLeft, FiEdit2, FiDollarSign, FiStar } from "react-icons/fi";
import axios from "../../../api/axiosConfig";
import { swalCustom } from "../../../utils/customSwal";
import { getPrecioMostrar, renderPrecio, getStockMostrar, getAlertaStock } from "../../../utils/productHelpers";
import "../../../styles/admin/detalleProducto.css";

const DetalleProducto = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [descripcionExpandida, setDescripcionExpandida] = useState(false);

    const cargarProducto = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/productos/${id}`);
            setProducto(data);
        } catch (error) {
            console.error("Error al cargar producto:", error);
            swalCustom.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo cargar el producto",
            });
            navigate("/admin/productos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarProducto();
        //eslint-disable-next-line
    }, [id]);

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" />
                <p className="mt-3">Cargando producto...</p>
            </Container>
        );
    }

    if (!producto) {
        return (
            <Container className="py-5">
                <Alert variant="danger">No se encontró el producto</Alert>
            </Container>
        );
    }

    const esTamanioUnico =
        producto.tamanios &&
        producto.tamanios.length === 1 &&
        producto.tamanios[0].nombreTamanio.toLowerCase() === "único";

    const precio = getPrecioMostrar(producto);
    const stockMostrar = getStockMostrar(producto);

    return (
        <div className="detalle-producto-page" style={{ backgroundColor: "transparent" }}>
            <Container className="py-4">

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <Button variant="secondary" onClick={() => navigate(producto.eliminado ? "/admin/productos/papelera" : "/admin/productos")}>
                        <FiArrowLeft className="me-2" />
                        Volver
                    </Button>

                    {!producto.eliminado && (
                        <Button variant="primary" onClick={() => navigate(`/admin/productos/${id}/editar`)}>
                            <FiEdit2 className="me-2" />
                            Editar
                        </Button>
                    )}
                </div>
                {!!producto.eliminado && (
                    <Alert variant="warning" className="mb-3">
                        Este producto se encuentra en la papelera. Para poder hacer cambios en él primero debes restaurarlo.
                    </Alert>
                )}

                <Row>
                    <Col lg={12}>

                        <Card className="mb-4">
                            <Card.Header>
                                <div className="m-1 d-flex justify-content-between align-items-center">
                                    <h5 className="m-0">
                                        <strong style={{ fontSize: 22 }}>
                                            #{producto.idProducto} | {producto.nombreProducto}
                                        </strong>
                                    </h5>

                                    <div className="d-flex flex-column align-items-end gap-1">
                                        <Badge bg={producto.activo ? "success" : "danger"}>
                                            {producto.activo ? "Activo" : "Inactivo"}
                                        </Badge>
                                        {!!producto.destacado && (
                                            <Badge bg="warning" text="dark">
                                                <FiStar />
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </Card.Header>

                            <Card.Body>
                                <Row>
                                    {producto.imagenPrincipal && (
                                        <Col md={12} className="mb-3 d-flex justify-content-center">
                                            <img
                                                src={producto.imagenPrincipal}
                                                alt={producto.nombreProducto}
                                                className="img-fluid rounded"
                                                style={{ maxHeight: "400px", objectFit: "contain" }}
                                            />
                                        </Col>

                                    )}
                                    <hr />
                                    <Col md={6} className="mb-3">
                                        <strong>Categoría:</strong>
                                        <p className="mb-0">{producto.categoriaProducto || `ID ${producto.idCategoria}` || "Sin categoría"}</p>
                                    </Col>
                                    <hr />
                                    <Col md={12} className="mb-3">
                                        <strong>Descripción:</strong>
                                        <p
                                            className="mb-0"
                                            style={
                                                !descripcionExpandida
                                                    ? {
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: "vertical",
                                                        overflow: "hidden",
                                                    }
                                                    : {}
                                            }
                                        >
                                            {producto.descripcionProducto || "-"}
                                        </p>
                                        {producto.descripcionProducto && (
                                            <button
                                                className="btn btn-link p-0 mt-1"
                                                style={{ fontSize: "0.85rem", color: "#212529", textDecoration: "none" }}
                                                onClick={() => setDescripcionExpandida((prev) => !prev)}
                                            >
                                                {descripcionExpandida ? "Ver menos" : "Ver más"}
                                            </button>
                                        )}
                                    </Col>
                                    <hr />
                                    <Col md={6} className="mb-3">
                                        <strong>Fecha de creación:</strong>
                                        <p className="mb-0 text-muted">
                                            {producto.fechaCreacion
                                                ? new Date(producto.fechaCreacion).toLocaleDateString("es-AR")
                                                : "-"}
                                        </p>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <strong>Última actualización:</strong>
                                        <p className="mb-0 text-muted">
                                            {producto.fechaActualizacion
                                                ? new Date(producto.fechaActualizacion).toLocaleDateString("es-AR")
                                                : "-"}
                                        </p>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <Card className="">
                            <Card.Header>
                                <h5 className="mb-0">
                                    <FiDollarSign className="me-2" />
                                    {esTamanioUnico ? "Precio y Stock" : "Tamaños y Precios"}
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                {esTamanioUnico ? (
                                    <Row>
                                        <Col md={6}>
                                            <strong>Precio:</strong>
                                            <p className="mb-0 fs-5 text-success">{renderPrecio(precio)}</p>
                                        </Col>
                                        <Col md={6}>
                                            <strong>Stock:</strong>
                                            <p className="mb-0 fs-5">
                                                {stockMostrar} unidades
                                                {(() => {
                                                    const alerta = getAlertaStock(producto.tamanios);
                                                    if (alerta === "critico") return <span title="Stock crítico" style={{ color: "#dc3545", marginLeft: 6 }}>⚠ Crítico</span>;
                                                    if (alerta === "bajo") return <span title="Stock bajo" style={{ color: "#ffc107", marginLeft: 6 }}>⚠ Bajo</span>;
                                                    return null;
                                                })()}
                                            </p>
                                        </Col>
                                        {producto.tamanios[0].dimension && (
                                            <Col md={12} className="mt-3">
                                                <strong>Dimensión:</strong>
                                                <p className="mb-0">{producto.tamanios[0].dimension}</p>
                                            </Col>
                                        )}
                                    </Row>
                                ) : (
                                    <>
                                        {producto.tamanios && producto.tamanios.length > 0 ? (
                                            <>
                                                <div className="mb-3">
                                                    <Row>
                                                        <Col md={6}>
                                                            <strong>Precio:</strong>
                                                            <p className="mb-0 fs-5 text-success">{renderPrecio(precio)}</p>
                                                        </Col>
                                                        <Col md={6}>
                                                            <strong>Stock total:</strong>
                                                            <p className="mb-0 fs-5">{stockMostrar} unidades</p>
                                                        </Col>
                                                    </Row>
                                                </div>
                                                <hr />
                                                <strong className="d-block mb-2">Detalle por tamaño:</strong>
                                                <Table bordered hover responsive size="sm">
                                                    <thead>
                                                        <tr>
                                                            <th>Tamaño</th>
                                                            <th>Dimensión</th>
                                                            <th>Precio</th>
                                                            <th>Stock</th>
                                                            <th>Estado</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {producto.tamanios.map((tamanio, idx) => (
                                                            <tr key={idx}>
                                                                <td><strong>{tamanio.nombreTamanio}</strong></td>
                                                                <td>{tamanio.dimension || "-"}</td>
                                                                <td className="text-success"><strong>${tamanio.precio}</strong></td>
                                                                <td>
                                                                    {tamanio.stock || 0} unidades
                                                                    {Number(tamanio.stock) <= 3 && <span style={{ color: "#dc3545", marginLeft: 6 }}>⚠ Crítico</span>}
                                                                    {Number(tamanio.stock) > 3 && Number(tamanio.stock) <= 9 && <span style={{ color: "#ffc107", marginLeft: 6 }}>⚠ Bajo</span>}
                                                                </td>                                                                <td>
                                                                    <Badge bg={tamanio.activo ? "success" : "secondary"}>
                                                                        {tamanio.activo ? "Activo" : "Inactivo"}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </>
                                        ) : (
                                            <Alert variant="warning">No hay tamaños configurados para este producto.</Alert>
                                        )}
                                    </>
                                )}
                            </Card.Body>
                        </Card>

                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default DetalleProducto;