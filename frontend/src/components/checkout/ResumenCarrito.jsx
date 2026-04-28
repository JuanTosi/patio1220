import { Card, ListGroup, Badge } from "react-bootstrap";
import "../../styles/pages/checkout.css";

const ResumenCarrito = ({ carrito, total }) => {
    return (
        <Card className="checkout-card sticky-top">
            <Card.Header>
                <h5 className="mb-0">Resumen del pedido</h5>
            </Card.Header>
            <Card.Body className="p-0">
                <ListGroup variant="flush">
                    {carrito.map((item) => (
                        <ListGroup.Item key={item.key} className="checkout-item">
                            <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                    <h6 className="mb-1">{item.nombreProducto}</h6>
                                    {item.nombreTamanio && (
                                        <Badge bg="secondary" className="me-2">
                                            {item.dimension || item.nombreTamanio}
                                        </Badge>
                                    )}
                                    <small className="text-muted">Cantidad: {item.cantidad}</small>
                                </div>
                                <div className="text-end">
                                    <strong>${(item.precioUnitario * item.cantidad).toFixed(2)}</strong>
                                </div>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Card.Body>
            <Card.Footer>
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Total</h5>
                    <h4 className="mb-0 text-success">${total.toFixed(2)}</h4>
                </div>
                <small className="text-muted d-block mt-2">
                    {carrito.length} {carrito.length === 1 ? "producto" : "productos"}
                </small>
            </Card.Footer>
        </Card>
    );
};

export default ResumenCarrito;