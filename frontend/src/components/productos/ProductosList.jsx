import { useState } from "react";
import { Row, Col } from "react-bootstrap";
import ProductoCard from "./ProductoCard.jsx";
import ProductoModal from "./ProductoModal.jsx";
import Carrito from "../carrito/Carrito.jsx";

const ProductosList = ({ productos }) => {
    const [productoModal, setProductoModal] = useState(null);
    const [showCarrito, setShowCarrito] = useState(false);

    const handleAgregado = () => {
        setProductoModal(null);
        setShowCarrito(true);
    };

    return (
        <div className="cards-container">
            <Carrito show={showCarrito} handleClose={() => setShowCarrito(false)} />

            <ProductoModal
                prod={productoModal}
                show={!!productoModal}
                onHide={() => setProductoModal(null)}
                onAgregado={handleAgregado}
            />

            <Row xs={2} sm={2} md={3} lg={4} className="g-4">
                {productos.map((prod) => (
                    <Col key={prod.idProducto}>
                        <ProductoCard prod={prod} onVerProducto={setProductoModal} />
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default ProductosList;