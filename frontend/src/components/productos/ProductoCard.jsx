import { useMemo } from "react";
import { Card, Button } from "react-bootstrap";
import { FaShoppingBag } from "react-icons/fa";
import "../../styles/components/producto-card.css";

const ProductoCard = ({ prod, onVerProducto }) => {
    const tamaniosActivos = useMemo(
        () => prod.tamanios?.filter((t) => Number(t.activo) === 1) ?? [],
        [prod]
    );

    const tamaniosConStock = useMemo(
        () => tamaniosActivos.filter((t) => Number(t.stock) > 0),
        [tamaniosActivos]
    );

    const sinStock = tamaniosConStock.length === 0;

    const precioDisplay = useMemo(() => {
        if (tamaniosConStock.length > 1) {
            const min = Math.min(...tamaniosConStock.map((t) => Number(t.precio)));
            return { desde: true, valor: min };
        }
        if (tamaniosConStock.length === 1) {
            return { desde: false, valor: Number(tamaniosConStock[0].precio) };
        }
        if (tamaniosActivos.length > 0) {
            const min = Math.min(...tamaniosActivos.map((t) => Number(t.precio)));
            return { desde: tamaniosActivos.length > 1, valor: min };
        }
        return { desde: false, valor: 0 };
    }, [tamaniosActivos, tamaniosConStock]);

    return (
        <Card
            className={`producto-card shadow-sm h-100 d-flex flex-column justify-content-between ${sinStock ? "sin-stock" : ""
                }`}
        >
            <Card.Img
                variant="top"
                src={prod.imagenPrincipal || "/placeholder.jpg"}
                alt={prod.nombreProducto}
                className="card-img-top"
                style={{ cursor: "pointer" }}
                onClick={() => onVerProducto(prod)}
            />

            <Card.Body className="producto-body text-center">
                <div className="zona-superior-flex d-flex flex-column align-items-center">
                    <Card.Title className="fw-semibold nombre-producto">
                        {prod.nombreProducto}
                    </Card.Title>

                    <p className="fw-bold precio-producto">
                        {precioDisplay.desde && (
                            <span style={{ fontSize: "0.78rem", fontWeight: 400, color: "var(--color-gris-medio)" }}>
                                Desde{" "}
                            </span>
                        )}
                        ${precioDisplay.valor.toLocaleString("es-AR")}
                    </p>

                    <div className="espacio-reservado-select" />
                </div>

                <div className="zona-inferior">
                    <Button
                        className="btn-agregar d-flex align-items-center justify-content-center gap-2"
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onVerProducto(prod)}
                        disabled={false}
                    >
                        <span>{sinStock ? "Ver producto" : "Agregar"}</span>
                        {sinStock ? "" : <FaShoppingBag />}
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductoCard;