import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Row, Col, Spinner, Alert, Table } from "react-bootstrap";
import { FiArrowLeft, FiSave, FiPlus, FiTrash2, FiX, FiCheck } from "react-icons/fi";
import axios from "../../../api/axiosConfig";
import { swalCustom } from "../../../utils/customSwal";
import { toast } from "../../../utils/alerts";
import { useProductosStore } from "../../../store/productosStore";
import Swal from "sweetalert2";
import "../../../styles/admin/formProducto.css";
import { getPrecioMostrar, renderPrecio } from "../../../utils/productHelpers";

const EditarProducto = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchProductos } = useProductosStore();

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [formData, setFormData] = useState({
        nombreProducto: "",
        descripcionProducto: "",
        idCategoria: "",
        imagenPrincipal: "",
        destacado: false,
        activo: true,
    });

    const [tamanios, setTamanios] = useState([]);
    const [tamaniosOriginales, setTamaniosOriginales] = useState([]);
    const [nuevosTamanios, setNuevosTamanios] = useState([]);
    const [hayCambiosPendientes, setHayCambiosPendientes] = useState(false);
    const [modoEdicionTamanios, setModoEdicionTamanios] = useState(false);

    const cargarProducto = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/productos/${id}`);
            setFormData({
                nombreProducto: data.nombreProducto || "",
                descripcionProducto: data.descripcionProducto || "",
                idCategoria: data.idCategoria || "",
                imagenPrincipal: data.imagenPrincipal || "",
                destacado: data.destacado || false,
                activo: data.activo !== undefined ? data.activo : true,
            });
            cargarTamanios();
        } catch (error) {
            console.error("Error al cargar producto:", error);
            swalCustom.fire({ icon: "error", title: "Error", text: "No se pudo cargar el producto" });
            navigate("/admin/productos");
        } finally {
            setLoading(false);
        }
    };

    const cargarTamanios = async () => {
        try {
            const { data } = await axios.get(`/productos/${id}/tamanios`);
            setTamanios(data);
            setTamaniosOriginales(JSON.parse(JSON.stringify(data)));
            setHayCambiosPendientes(false);
        } catch (error) {
            console.error("Error al cargar tamaños:", error);
        }
    };

    useEffect(() => {
        cargarProducto();
        //eslint-disable-next-line
    }, [id]);

    const precioReferencia = tamanios.length > 0 ? getPrecioMostrar({ tamanios }) : null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const validarFormulario = () => {
        if (!formData.nombreProducto.trim()) {
            toast("error", "El nombre del producto es obligatorio");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;

        if (hayCambiosPendientes) {
            const result = await Swal.fire({
                title: "Cambios sin guardar",
                text: "Tenés cambios pendientes en los tamaños. ¿Querés guardarlos antes de continuar?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Guardar todo",
                cancelButtonText: "Solo guardar producto",
                showDenyButton: true,
                denyButtonText: "Cancelar",
            });
            if (result.isDenied) return;
            if (result.isConfirmed) await handleGuardarCambiosTamanios();
        }

        setGuardando(true);
        try {
            await axios.put(`/productos/${id}`, { ...formData, idCategoria: formData.idCategoria || null });
            await swalCustom.fire({ icon: "success", title: "Producto actualizado", text: "Los cambios se guardaron correctamente", timer: 1500 });
            fetchProductos();
            navigate(`/admin/productos/${id}`);
        } catch (error) {
            console.error("Error al actualizar producto:", error);
            toast("error", error.response?.data?.error || "No se pudo actualizar el producto");
        } finally {
            setGuardando(false);
        }
    };

    const handleAgregarTamanio = () => {
        setNuevosTamanios((prev) => [
            ...prev,
            { id: `nuevo-${Date.now()}`, nombreTamanio: "", dimension: "", precio: "", stock: "", activo: true },
        ]);
        setHayCambiosPendientes(true);
    };

    const handleCancelarNuevoTamanio = (id) => {
        setNuevosTamanios((prev) => {
            const nuevos = prev.filter((t) => t.id !== id);
            if (nuevos.length === 0 && !tamanios.some((_, i) => i !== tamanios.indexOf(_))) {
                setHayCambiosPendientes(false);
            }
            return nuevos;
        });
    };

    const handleChangeNuevoTamanio = (id, field, value) => {
        setNuevosTamanios((prev) => prev.map((t) => t.id === id ? { ...t, [field]: value } : t));
    };

    const handleChangeTamanioInline = (idTamanio, field, value) => {
        setTamanios((prev) => prev.map((t) => t.idTamanio === idTamanio ? { ...t, [field]: value } : t));
        setHayCambiosPendientes(true);
    };

    const handleGuardarCambiosTamanios = async () => {
        try {
            const nuevosFiltrados = nuevosTamanios.filter(
                (t) => t.nombreTamanio.trim() || t.precio || t.dimension || t.stock
            );

            for (const t of nuevosFiltrados) {
                if (!t.nombreTamanio.trim()) {
                    toast("error", "Todos los tamaños nuevos deben tener nombre");
                    return;
                }
                if (!t.precio || t.precio <= 0) {
                    toast("error", "Todos los tamaños nuevos deben tener precio mayor a 0");
                    return;
                }
            }

            for (const t of tamanios) {
                if (!t.nombreTamanio.trim()) {
                    toast("error", "Todos los tamaños deben tener nombre");
                    return;
                }
                if (!t.precio || t.precio <= 0) {
                    toast("error", "Todos los tamaños deben tener precio mayor a 0");
                    return;
                }
            }

            for (const t of tamanios) {
                const original = tamaniosOriginales.find((o) => o.idTamanio === t.idTamanio);
                const cambio =
                    !original ||
                    original.nombreTamanio !== t.nombreTamanio ||
                    original.dimension !== t.dimension ||
                    original.precio !== t.precio ||
                    original.stock !== t.stock ||
                    original.activo !== t.activo;

                if (cambio) {
                    await axios.put(`/productos/${id}/tamanios/${t.idTamanio}`, {
                        nombreTamanio: t.nombreTamanio.trim(),
                        dimension: t.dimension || null,
                        precio: parseFloat(t.precio),
                        stock: parseInt(t.stock) || 0,
                        activo: t.activo,
                    });
                }
            }

            for (const t of nuevosFiltrados) {
                await axios.post(`/productos/${id}/tamanios`, {
                    nombreTamanio: t.nombreTamanio.trim(),
                    dimension: t.dimension || null,
                    precio: parseFloat(t.precio),
                    stock: parseInt(t.stock) || 0,
                    activo: t.activo,
                });
            }

            toast("success", "Cambios guardados correctamente");
            setNuevosTamanios([]);
            setHayCambiosPendientes(false);
            setModoEdicionTamanios(false);
            cargarTamanios();
        } catch (error) {
            console.error("Error al guardar cambios:", error);
            toast("error", error.response?.data?.error || "No se pudieron guardar los cambios");
        }
    };

    const handleCancelarTodosCambios = async () => {
        const result = await Swal.fire({
            title: "¿Cancelar cambios?",
            text: "Se perderán todos los cambios sin guardar",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, cancelar",
            cancelButtonText: "No",
            confirmButtonColor: "#d33",
        });
        if (!result.isConfirmed) return;
        setTamanios(JSON.parse(JSON.stringify(tamaniosOriginales)));
        setNuevosTamanios([]);
        setHayCambiosPendientes(false);
        toast("info", "Cambios cancelados");
    };

    const handleCancelarModoEdicion = async () => {
        if (hayCambiosPendientes) {
            const result = await Swal.fire({
                title: "¿Cancelar edición?",
                text: "Se perderán los cambios sin guardar en los tamaños",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, cancelar",
                cancelButtonText: "No",
                confirmButtonColor: "#d33",
            });
            if (!result.isConfirmed) return;
        }
        setTamanios(JSON.parse(JSON.stringify(tamaniosOriginales)));
        setNuevosTamanios([]);
        setHayCambiosPendientes(false);
        setModoEdicionTamanios(false);
    };

    const handleEliminarTamanio = async (tamanio) => {
        if (tamanios.length === 1) { toast("error", "No se puede eliminar el último tamaño"); return; }
        const result = await Swal.fire({
            title: "¿Eliminar tamaño?",
            text: `Se eliminará "${tamanio.nombreTamanio}" de este producto`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33",
        });
        if (!result.isConfirmed) return;
        try {
            const response = await axios.delete(`/productos/${id}/tamanios/${tamanio.idTamanio}`);
            if (response.data.productoDesactivado) {
                await swalCustom.fire({ icon: "warning", title: "Producto desactivado", text: "El producto se desactivó porque no tiene tamaños activos" });
            }
            toast("success", "Tamaño eliminado");
            cargarTamanios();
            cargarProducto();
        } catch (error) {
            console.error("Error al eliminar tamaño:", error);
            toast("error", error.response?.data?.error || "No se pudo eliminar el tamaño");
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" />
                <p className="mt-3">Cargando producto...</p>
            </Container>
        );
    }

    return (
        <div className="form-producto-page" style={{ backgroundColor: "transparent" }} >
            <Container className="py-4">

                <div className="mb-4">
                    <Button variant="secondary" onClick={() => navigate(`/admin/productos/${id}`)}>
                        <FiArrowLeft className="me-2" />
                        Volver
                    </Button>
                </div>

                <Card>
                    <Card.Header>
                        <h5 className="mb-0">Editar Producto #{id}</h5>
                    </Card.Header>
                    <Card.Body>
                        <Form onSubmit={handleSubmit}>

                            <Row>
                                <Col md={8} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>
                                            Nombre del Producto <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="nombreProducto"
                                            value={formData.nombreProducto}
                                            onChange={handleChange}
                                            placeholder="Ej: Rosa Roja"
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={4} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>Categoría</Form.Label>
                                        <Form.Select name="idCategoria" value={formData.idCategoria} onChange={handleChange}>
                                            <option value="">Sin categoría</option>
                                            <option value="1">Plantas</option>
                                            <option value="2">Macetas</option>
                                            <option value="3">Fertilizantes</option>
                                            <option value="4">Herramientas</option>
                                            <option value="5">Otros</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={12} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>Descripción</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            name="descripcionProducto"
                                            value={formData.descripcionProducto}
                                            onChange={handleChange}
                                            placeholder="Describe el producto..."
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={12} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>URL de Imagen Principal</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="imagenPrincipal"
                                            value={formData.imagenPrincipal}
                                            onChange={handleChange}
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr className="my-4" />

                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h6 className="mb-0 fw-semibold">Tamaños y Precios</h6>
                                        {precioReferencia && (
                                            <small className="text-muted">Precio: {renderPrecio(precioReferencia)}</small>
                                        )}
                                    </div>
                                    <div className="d-flex gap-2">
                                        {modoEdicionTamanios ? (
                                            <>
                                                <Button variant="success" size="sm" onClick={handleAgregarTamanio}>
                                                    <FiPlus className="me-1" />
                                                    Agregar Tamaño
                                                </Button>
                                                <Button variant="secondary" size="sm" onClick={handleCancelarModoEdicion}>
                                                    Cancelar edición
                                                </Button>
                                            </>
                                        ) : (
                                            <Button variant="primary" size="sm" onClick={() => setModoEdicionTamanios(true)}>
                                                Editar tamaños
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {tamanios.length === 0 && nuevosTamanios.length === 0 ? (
                                    <Alert variant="info">
                                        No hay tamaños configurados. Activá la edición para comenzar.
                                    </Alert>
                                ) : (
                                    <>
                                        <Table bordered responsive>
                                            <thead>
                                                <tr>
                                                    <th>Nombre <span className="text-danger">*</span></th>
                                                    <th>Dimensión</th>
                                                    <th>Precio <span className="text-danger">*</span></th>
                                                    <th>Stock</th>
                                                    <th>Activo</th>
                                                    {modoEdicionTamanios && <th></th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tamanios.map((tamanio) => (
                                                    <tr key={tamanio.idTamanio}>
                                                        <td>
                                                            {modoEdicionTamanios ? (
                                                                <Form.Control
                                                                    type="text"
                                                                    value={tamanio.nombreTamanio}
                                                                    onChange={(e) => handleChangeTamanioInline(tamanio.idTamanio, "nombreTamanio", e.target.value)}
                                                                    placeholder="Ej: Pequeño"
                                                                    size="sm"
                                                                />
                                                            ) : (
                                                                <strong>{tamanio.nombreTamanio}</strong>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {modoEdicionTamanios ? (
                                                                <Form.Control
                                                                    type="text"
                                                                    value={tamanio.dimension || ""}
                                                                    onChange={(e) => handleChangeTamanioInline(tamanio.idTamanio, "dimension", e.target.value)}
                                                                    placeholder="10cm"
                                                                    size="sm"
                                                                />
                                                            ) : (
                                                                tamanio.dimension || "-"
                                                            )}
                                                        </td>
                                                        <td>
                                                            {modoEdicionTamanios ? (
                                                                <Form.Control
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={tamanio.precio}
                                                                    onChange={(e) => handleChangeTamanioInline(tamanio.idTamanio, "precio", e.target.value)}
                                                                    placeholder="0.00"
                                                                    size="sm"
                                                                />
                                                            ) : (
                                                                <span className="text-success"><strong>${tamanio.precio}</strong></span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {modoEdicionTamanios ? (
                                                                <Form.Control
                                                                    type="number"
                                                                    value={tamanio.stock}
                                                                    onChange={(e) => handleChangeTamanioInline(tamanio.idTamanio, "stock", e.target.value)}
                                                                    placeholder="0"
                                                                    size="sm"
                                                                />
                                                            ) : (
                                                                <>
                                                                    {tamanio.stock} unid.
                                                                    {Number(tamanio.stock) <= 3 && <span style={{ color: "#dc3545", marginLeft: 6 }}>⚠</span>}
                                                                    {Number(tamanio.stock) > 3 && Number(tamanio.stock) <= 9 && <span style={{ color: "#ffc107", marginLeft: 6 }}>⚠</span>}
                                                                </>
                                                            )}
                                                        </td>
                                                        <td className="text-center align-middle">
                                                            {modoEdicionTamanios ? (
                                                                <Form.Check
                                                                    type="checkbox"
                                                                    checked={tamanio.activo}
                                                                    onChange={(e) => handleChangeTamanioInline(tamanio.idTamanio, "activo", e.target.checked)}
                                                                />
                                                            ) : (
                                                                <span className={`badge ${tamanio.activo ? "bg-success" : "bg-secondary"}`}>
                                                                    {tamanio.activo ? "Sí" : "No"}
                                                                </span>
                                                            )}
                                                        </td>
                                                        {modoEdicionTamanios && (
                                                            <td className="text-center align-middle">
                                                                <Button
                                                                    variant="danger"
                                                                    size="sm"
                                                                    onClick={() => handleEliminarTamanio(tamanio)}
                                                                    disabled={tamanios.length === 1 && nuevosTamanios.length === 0}
                                                                    title={tamanios.length === 1 && nuevosTamanios.length === 0 ? "No se puede eliminar el único tamaño" : "Eliminar"}
                                                                >
                                                                    <FiTrash2 />
                                                                </Button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}

                                                {nuevosTamanios.map((t) => (
                                                    <tr key={t.id} className="table-success">
                                                        <td>
                                                            <Form.Control
                                                                type="text"
                                                                value={t.nombreTamanio}
                                                                onChange={(e) => handleChangeNuevoTamanio(t.id, "nombreTamanio", e.target.value)}
                                                                placeholder="Ej: Pequeño, Mediano"
                                                                size="sm"
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="text"
                                                                value={t.dimension}
                                                                onChange={(e) => handleChangeNuevoTamanio(t.id, "dimension", e.target.value)}
                                                                placeholder="10cm"
                                                                size="sm"
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="number"
                                                                step="0.01"
                                                                value={t.precio}
                                                                onChange={(e) => handleChangeNuevoTamanio(t.id, "precio", e.target.value)}
                                                                placeholder="0.00"
                                                                size="sm"
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="number"
                                                                value={t.stock}
                                                                onChange={(e) => handleChangeNuevoTamanio(t.id, "stock", e.target.value)}
                                                                placeholder="0"
                                                                size="sm"
                                                            />
                                                        </td>
                                                        <td className="text-center align-middle">
                                                            <Form.Check
                                                                type="checkbox"
                                                                checked={t.activo}
                                                                onChange={(e) => handleChangeNuevoTamanio(t.id, "activo", e.target.checked)}
                                                            />
                                                        </td>
                                                        <td className="text-center align-middle">
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => handleCancelarNuevoTamanio(t.id)}
                                                                title="Quitar fila"
                                                            >
                                                                <FiX />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>

                                        {hayCambiosPendientes && (
                                            <Alert variant="warning" className="mt-3">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span>⚠️ Tenés cambios sin guardar en los tamaños</span>
                                                    <div className="d-flex gap-2">
                                                        <Button variant="secondary" size="sm" onClick={handleCancelarTodosCambios}>
                                                            Cancelar cambios
                                                        </Button>
                                                        <Button variant="success" size="sm" onClick={handleGuardarCambiosTamanios}>
                                                            <FiCheck className="me-1" />
                                                            Guardar cambios
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Alert>
                                        )}

                                        {tamanios.length === 1 && nuevosTamanios.length === 0 && !modoEdicionTamanios && (
                                            <Alert variant="info" className="mt-3 mb-0">
                                                <small>Producto con tamaño único. Activá la edición para agregar variantes.</small>
                                            </Alert>
                                        )}
                                    </>
                                )}
                            </div>

                            <hr className="my-4" />

                            <div className="mb-4">
                                <h6 className="mb-3 fw-semibold">Opciones</h6>
                                <Form.Check
                                    type="checkbox"
                                    name="destacado"
                                    label="Producto destacado"
                                    checked={formData.destacado}
                                    onChange={handleChange}
                                    className="mb-2"
                                />
                                <Form.Check
                                    type="checkbox"
                                    name="activo"
                                    label="Producto activo"
                                    checked={formData.activo}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="d-flex gap-2 justify-content-end">
                                <Button variant="secondary" onClick={() => navigate(`/admin/productos/${id}`)} disabled={guardando}>
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="success" disabled={guardando}>
                                    {guardando ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave className="me-2" />
                                            Guardar Cambios
                                        </>
                                    )}
                                </Button>
                            </div>

                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default EditarProducto;