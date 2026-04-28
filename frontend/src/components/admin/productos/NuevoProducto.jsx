import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Row, Col, Spinner, Alert, Table } from "react-bootstrap";
import { FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";
import axios from "../../../api/axiosConfig";
import { swalCustom } from "../../../utils/customSwal";
import { toast } from "../../../utils/alerts";
import { useProductosStore } from "../../../store/productosStore";
import "../../../styles/admin/formProducto.css";

const NuevoProducto = () => {
    const navigate = useNavigate();
    const { fetchProductos } = useProductosStore();

    const [guardando, setGuardando] = useState(false);
    const [formData, setFormData] = useState({
        nombreProducto: "",
        descripcionProducto: "",
        idCategoria: "",
        imagenPrincipal: "",
        destacado: false,
        activo: true,
    });

    const [tamanios, setTamanios] = useState([
        {
            id: Date.now(),
            nombreTamanio: "Único",
            dimension: "",
            precio: "",
            stock: "",
            activo: true,
        },
    ]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleChangeTamanio = (id, field, value) => {
        setTamanios((prev) =>
            prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
        );
    };

    const handleAgregarTamanio = () => {
        if (tamanios.length === 1 && tamanios[0].nombreTamanio === "Único") {
            setTamanios((prev) => prev.map((t) => ({ ...t, nombreTamanio: "" })));
        }
        setTamanios((prev) => [
            ...prev,
            { id: Date.now(), nombreTamanio: "", dimension: "", precio: "", stock: "", activo: true },
        ]);
    };

    const handleEliminarTamanio = (id) => {
        if (tamanios.length === 1) {
            toast("error", "Debe haber al menos un tamaño");
            return;
        }
        setTamanios((prev) => {
            const nuevos = prev.filter((t) => t.id !== id);
            if (nuevos.length === 1) {
                return nuevos.map((t) => ({ ...t, nombreTamanio: "Único" }));
            }
            return nuevos;
        });
    };

    const validarFormulario = () => {
        if (!formData.nombreProducto.trim()) {
            toast("error", "El nombre del producto es obligatorio");
            return false;
        }
        if (tamanios.length === 0) {
            toast("error", "Debe agregar al menos un tamaño");
            return false;
        }
        for (const tam of tamanios) {
            if (!tam.nombreTamanio.trim()) {
                toast("error", "Todos los tamaños deben tener nombre");
                return false;
            }
            if (!tam.precio || tam.precio <= 0) {
                toast("error", "Todos los tamaños deben tener precio mayor a 0");
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;
        setGuardando(true);
        try {
            const dataToSend = {
                ...formData,
                idCategoria: formData.idCategoria || null,
                tamanios: tamanios.map((t) => ({
                    nombreTamanio: t.nombreTamanio.trim(),
                    dimension: t.dimension || null,
                    precio: parseFloat(t.precio),
                    stock: parseInt(t.stock) || 0,
                    activo: t.activo,
                })),
            };
            const { data } = await axios.post("/productos", dataToSend);
            await swalCustom.fire({
                icon: "success",
                title: "Producto creado",
                text: `El producto "${formData.nombreProducto}" fue creado exitosamente`,
                timer: 1500,
            });
            fetchProductos();
            navigate(`/admin/productos/${data.idProducto}`);
        } catch (error) {
            console.error("Error al crear producto:", error);
            toast("error", error.response?.data?.error || "No se pudo crear el producto");
        } finally {
            setGuardando(false);
        }
    };

    const esPrimerTamanioUnico = tamanios.length === 1 && tamanios[0].nombreTamanio === "Único";

    return (
        <div className="form-producto-page" style={{ backgroundColor: "transparent" }} >
            <Container className="py-4">

                <div className="mb-4">
                    <Button variant="secondary" onClick={() => navigate("/admin/productos")}>
                        <FiArrowLeft className="me-2" />
                        Volver
                    </Button>
                </div>

                <Card>
                    <Card.Header>
                        <h5 className="mb-0">Crear Nuevo Producto</h5>
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
                                            placeholder="Nombre del producto"
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
                                    <h6 className="mb-0 fw-semibold">Tamaños y Precios</h6>
                                    <Button variant="success" size="sm" onClick={handleAgregarTamanio}>
                                        <FiPlus className="me-1" />
                                        Nuevo Tamaño
                                    </Button>
                                </div>

                                <Table bordered responsive>
                                    <thead>
                                        <tr>
                                            <th>Nombre <span className="text-danger">*</span></th>
                                            <th>Dimensión</th>
                                            <th>Precio <span className="text-danger">*</span></th>
                                            <th>Stock</th>
                                            <th>Activo</th>
                                            <th>Eliminar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tamanios.map((tam, index) => (
                                            <tr key={tam.id}>
                                                <td>
                                                    <Form.Control
                                                        type="text"
                                                        value={tam.nombreTamanio}
                                                        onChange={(e) => handleChangeTamanio(tam.id, "nombreTamanio", e.target.value)}
                                                        placeholder="S, M, L ..."
                                                        required
                                                        readOnly={index === 0 && esPrimerTamanioUnico}
                                                        className={index === 0 && esPrimerTamanioUnico ? "bg-light" : ""}
                                                        size="sm"
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        type="text"
                                                        value={tam.dimension}
                                                        onChange={(e) => handleChangeTamanio(tam.id, "dimension", e.target.value)}
                                                        placeholder="Ej: 10cm"
                                                        size="sm"
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        type="number"
                                                        step="0.01"
                                                        value={tam.precio}
                                                        onChange={(e) => handleChangeTamanio(tam.id, "precio", e.target.value)}
                                                        placeholder="0.00"
                                                        required
                                                        size="sm"
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        type="number"
                                                        value={tam.stock}
                                                        onChange={(e) => handleChangeTamanio(tam.id, "stock", e.target.value)}
                                                        placeholder="0"
                                                        size="sm"
                                                    />
                                                </td>
                                                <td className="text-center align-middle">
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={tam.activo}
                                                        onChange={(e) => handleChangeTamanio(tam.id, "activo", e.target.checked)}
                                                    />
                                                </td>
                                                <td className="text-center align-middle">
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleEliminarTamanio(tam.id)}
                                                        disabled={tamanios.length === 1}
                                                        title={tamanios.length === 1 ? "Debe haber al menos 1 tamaño" : "Eliminar"}
                                                    >
                                                        <FiTrash2 />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
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
                                <Button variant="secondary" onClick={() => navigate("/admin/productos")} disabled={guardando}>
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="success" disabled={guardando}>
                                    {guardando ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Creando...
                                        </>
                                    ) : (
                                        <>
                                            <FiPlus className="me-2" />
                                            Crear Producto
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

export default NuevoProducto;