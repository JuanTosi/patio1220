import { useState, useMemo, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaShoppingBag, FaCheck } from "react-icons/fa";
import { useCarritoStore } from "../../store/carritoStore.js";
import "../../styles/components/producto-modal.css";

const ProductoModal = ({ prod, show, onHide, onAgregado }) => {
    const { agregarAlCarrito, carrito } = useCarritoStore();

    const tamaniosActivos = useMemo(
        () => prod?.tamanios?.filter((t) => Number(t.activo) === 1) ?? [],
        [prod]
    );

    const tamanioDefault = useMemo(() => {
        const conStock = tamaniosActivos.filter((t) => Number(t.stock) > 0);
        if (conStock.length === 0) return tamaniosActivos[0] ?? null;
        return conStock.reduce((min, t) =>
            Number(t.precio) < Number(min.precio) ? t : min
        );
    }, [tamaniosActivos]);

    const [tamanioSeleccionado, setTamanioSeleccionado] = useState(tamanioDefault);
    const [cantidad, setCantidad] = useState(1);
    const [agregado, setAgregado] = useState(false);


    useEffect(() => {
        if (show && prod) {
            setTamanioSeleccionado(tamanioDefault);
            setCantidad(1);
            setAgregado(false);
        }
    }, [show, prod, tamanioDefault]);

    useEffect(() => {
        setCantidad(1);
    }, [tamanioSeleccionado]);

    const enCarrito = useMemo(() => {
        if (!prod || !tamanioSeleccionado) return null;
        const key = `${prod.idProducto}-${tamanioSeleccionado.nombreTamanio}`;
        return carrito.find((item) => item.key === key);
    }, [carrito, prod, tamanioSeleccionado]);

    const stockDisponible = tamanioSeleccionado
        ? Math.max(0, Number(tamanioSeleccionado.stock) - (enCarrito?.cantidad ?? 0))
        : 0;

    const precioActual = tamanioSeleccionado ? Number(tamanioSeleccionado.precio) : 0;
    const subtotal = precioActual * cantidad;

    const descripcion = prod?.descripcionProducto ?? "";

    const handleSeleccionarTamanio = (t) => {
        if (Number(t.stock) <= 0) return;
        setTamanioSeleccionado(t);
    };

    const cambiarCantidad = (tipo) => {
        if (tipo === "sumar" && cantidad < stockDisponible) setCantidad((c) => c + 1);
        if (tipo === "restar" && cantidad > 1) setCantidad((c) => c - 1);
    };

    const handleAgregar = () => {
        if (!tamanioSeleccionado || cantidad <= 0 || stockDisponible <= 0) return;
        agregarAlCarrito(
            {
                idProducto: prod.idProducto,
                nombreProducto: prod.nombreProducto,
                idTamanio: tamanioSeleccionado.idTamanio,
                nombreTamanio: tamanioSeleccionado.nombreTamanio,
                dimension: tamanioSeleccionado.dimension,
                precioUnitario: precioActual,
                stockDisponible: Number(tamanioSeleccionado.stock),
                imagenPrincipal: prod.imagenPrincipal,
            },
            cantidad
        );
        setAgregado(true);
        setTimeout(() => {
            onHide();
            if (onAgregado) onAgregado();
        }, 800);
    };

    if (!prod) return null;

    const soloUnTamanio = tamaniosActivos.length === 1;
    const sinStock = tamaniosActivos.every((t) => Number(t.stock) === 0);

    return (
        <Modal show={show} onHide={onHide} centered size="lg" className="producto-modal">
            <Modal.Header closeButton className="pm-header">
                {prod.categoriaNombre && (
                    <small className="pm-categoria">{prod.categoriaNombre}</small>
                )}
            </Modal.Header>

            <Modal.Body className="pm-body">
                <div className="pm-layout">

                    <div className="pm-zona-top">
                        <div className="pm-img-wrapper">
                            <img
                                src={prod.imagenPrincipal || "/placeholder.jpg"}
                                alt={prod.nombreProducto}
                                className="pm-img"
                            />
                        </div>

                        <div className="pm-header-info">
                            <h5 className="pm-nombre">{prod.nombreProducto}</h5>

                            {descripcion && (
                                <div className="pm-desc-wrapper">
                                    <p className="pm-desc">{descripcion}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pm-zona-bottom">

                        <div className="pm-seccion-variantes">
                            <div className="pm-precio-row">
                                <span className="pm-precio">${precioActual.toLocaleString("es-AR")}</span>
                                <small className="pm-por-unidad">por unidad</small>
                            </div>

                            <small className="pm-stock">
                                {stockDisponible > 0 && stockDisponible <= 5 && (
                                    <small className="pm-stock--alerta" style={{ display: "block" }}>
                                        ¡Últimas unidades!
                                    </small>
                                )}
                                Stock disponible:{" "}
                                <strong className={stockDisponible === 0 ? "pm-stock--agotado" : "pm-stock--ok"}>
                                    {stockDisponible}
                                </strong>
                                {enCarrito && enCarrito.cantidad > 0 && (
                                    <small className="pm-stock--info" style={{ display: "block" }}>
                                        Ya tenés {enCarrito.cantidad} unidad{enCarrito.cantidad > 1 ? "es" : ""} de este tamaño en tu carrito
                                    </small>
                                )}
                            </small>

                            {tamaniosActivos.length > 0 && (
                                <>
                                    <div className="pm-section-label">
                                        {soloUnTamanio ? "Tamaño" : "Seleccioná un tamaño"}
                                    </div>
                                    <div className="pm-chips">
                                        {tamaniosActivos.map((t) => {
                                            const sinStockT = Number(t.stock) <= 0;
                                            const isSelected = tamanioSeleccionado?.nombreTamanio === t.nombreTamanio;
                                            return (
                                                <button
                                                    key={t.nombreTamanio}
                                                    className={`pm-chip${isSelected ? " pm-chip--selected" : ""}${sinStockT ? " pm-chip--disabled" : ""}`}
                                                    onClick={() => handleSeleccionarTamanio(t)}
                                                    disabled={sinStockT}
                                                >
                                                    <span className="pm-chip-dim">{t.dimension || t.nombreTamanio}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="pm-seccion-accion">
                            {!sinStock && (
                                <div className="pm-cantidad-row">
                                    <div className="pm-cantidad">
                                        <span className="pm-section-label">Cantidad</span>
                                        {cantidad >= stockDisponible && stockDisponible > 0 && !agregado && cantidad > 1 && (
                                            <small className="pm-stock--info">¡Llegaste al límite de unidades disponibles!</small>
                                        )}
                                        <div className="cantidad-container">
                                            <Button variant="outline-secondary" size="sm"
                                                onClick={() => cambiarCantidad("restar")} disabled={cantidad <= 1}>−</Button>
                                            <Form.Control
                                                type="number" className="cantidad-input" value={cantidad}
                                                min={1} max={stockDisponible}
                                                onChange={(e) => {
                                                    let v = parseInt(e.target.value) || 1;
                                                    if (v > stockDisponible) v = stockDisponible;
                                                    if (v < 1) v = 1;
                                                    setCantidad(v);
                                                }}
                                            />
                                            <Button variant="outline-secondary" size="sm"
                                                onClick={() => cambiarCantidad("sumar")} disabled={cantidad >= stockDisponible}>+</Button>
                                        </div>
                                    </div>

                                    <div className="pm-subtotal">
                                        <span className="pm-subtotal-label">Subtotal</span>
                                        <span className="pm-subtotal-valor">
                                            ${subtotal.toLocaleString("es-AR")}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <button
                                className={`pm-btn-agregar${agregado ? " pm-btn-agregar--ok" : ""}`}
                                onClick={handleAgregar}
                                disabled={agregado || sinStock || stockDisponible <= 0 || !tamanioSeleccionado}
                            >
                                {agregado
                                    ? <><FaCheck /><span>¡Agregado!</span></>
                                    : sinStock
                                        ? <span>Sin stock disponible</span>
                                        : <><FaShoppingBag /><span>Agregar al carrito</span></>
                                }
                            </button>
                        </div>

                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ProductoModal;