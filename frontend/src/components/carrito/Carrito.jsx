import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Offcanvas, Button, Row, Col, Image, Form } from "react-bootstrap";
import {
  FaRegTrashAlt,
  FaCheck,
  FaShoppingBag,
  FaArrowLeft,
} from "react-icons/fa";
import { useCarritoStore } from "../../store/carritoStore";
import "../../styles/components/carrito.css";
import { useAuthStore } from "../../store/authStore";
import { swalCustom } from "../../utils/customSwal";

const Carrito = ({ show, handleClose }) => {
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);
  const navigate = useNavigate();

  const {
    carrito,
    eliminarDelCarrito,
    vaciarCarrito,
    disminuirCantidad,
    aumentarCantidad,
  } = useCarritoStore();

  const user = useAuthStore((state) => state.user);

  const total = carrito.reduce(
    (acc, item) => acc + item.precioUnitario * item.cantidad,
    0,
  );

  useEffect(() => {
    const handleClickOutside = () => setConfirmarEliminar(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleFinalizarCompra = () => {
    if (!user) {
      swalCustom.fire({
        icon: "warning",
        title: "Atención",
        text: "Debes iniciar sesión para poder reservar los productos",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    handleClose();
    navigate("/checkout");
  };

  return (
    <Offcanvas show={show} onHide={handleClose} placement="end">
      <Offcanvas.Header>
        <Offcanvas.Title>
          <button onClick={handleClose}>
            <FaArrowLeft />
          </button>
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        {carrito.length === 0 ? (
          <div className="carrito-vacio text-center mt-5">
            <FaShoppingBag size={50} className="mb-3 text-muted" />
            <h5 className="fw-semibold text-muted mb-3">
              ¡Tu carrito está vacío!
            </h5>
            <p className="text-secondary mb-4">
              Descubrí nuestras plantas y productos para llenar tu espacio de
              vida.
            </p>

            <button
              className="btn-volver"
              onClick={() => {
                handleClose();
                setTimeout(() => navigate("/catalogo"), 300);
              }}
            >
              Visita la tienda
            </button>
          </div>
        ) : (
          <>
            {carrito.map((item) => (
              <div
                key={item.key}
                className="carrito-item mb-3 p-2 rounded shadow-sm"
              >
                <Row className="align-items-center">
                  <Col xs={3} className="text-center">
                    <Image
                      src={item.imagenPrincipal}
                      alt={item.nombreProducto}
                      fluid
                      rounded
                      className="carrito-item-img"
                    />
                  </Col>

                  <Col xs={9}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="mb-1 fw-semibold nombre-prod">
                          {item.nombreProducto}
                        </p>

                        <small className="text-muted d-block">
                          Tamaño: {item.dimension || item.nombreTamanio}
                        </small>

                        <small className="text-muted d-block">
                          Precio por unidad: ${item.precioUnitario}
                        </small>
                      </div>

                      <Button
                        variant="link"
                        className="p-0 text-danger btn-eliminar"
                        onClick={() =>
                          eliminarDelCarrito(
                            item.idProducto,
                            item.nombreTamanio,
                          )
                        }
                      >
                        <FaRegTrashAlt />
                      </Button>
                    </div>
                    {item.cantidad >= item.stockDisponible && (
                      <small style={{ color: "#b8860b", fontSize: "0.75rem", marginTop: 4, display: "block" }}>
                        ¡Límite de unidades alcanzado!
                      </small>
                    )}
                    <div className="d-flex align-items-center justify-content-between mt-2">
                      <div className="d-flex align-items-center gap-2">
                        <Button
                          variant={
                            confirmarEliminar === item.key
                              ? "danger"
                              : "outline-secondary"
                          }
                          size="sm"
                          style={{
                            minWidth:
                              confirmarEliminar === item.key
                                ? "70px"
                                : "32px",
                            transition: "all 0.25s ease",
                          }}
                          className="btn-cantidad"
                          onClick={(e) => {
                            e.stopPropagation();

                            if (item.cantidad > 1) {
                              disminuirCantidad(
                                item.idProducto,
                                item.nombreTamanio,
                                1,
                              );
                            } else if (confirmarEliminar === item.key) {
                              eliminarDelCarrito(
                                item.idProducto,
                                item.nombreTamanio,
                              );
                              setConfirmarEliminar(null);
                            } else {
                              setConfirmarEliminar(item.key);
                            }
                          }}
                        >
                          {confirmarEliminar === item.key ? "Eliminar" : "-"}
                        </Button>

                        <Form.Control
                          type="number"
                          value={item.cantidad}
                          min="1"
                          readOnly
                          className="text-center cantidad-input"
                        />

                        <Button
                          variant="outline-secondary"
                          size="sm"
                          style={{ minWidth: "32px" }}
                          className="btn-cantidad"
                          onClick={() =>
                            aumentarCantidad(
                              item.idProducto,
                              item.nombreTamanio,
                              1,
                            )
                          }
                          disabled={item.cantidad >= item.stockDisponible}
                        >
                          +
                        </Button>
                      </div>

                      <p className="fw-bold mb-0 precio-item">
                        ${(item.precioUnitario * item.cantidad).toFixed(2)}
                      </p>
                    </div>
                  </Col>
                </Row>
              </div>
            ))}

            <hr />
            <div className="mt-3">
              <h5 className="text-end fw-bold mb-3">
                Total: ${total.toFixed(2)}
              </h5>

              <Button
                variant="secondary d-flex align-items-center justify-content-center gap-2 mb-2"
                className="w-100"
                onClick={vaciarCarrito}
              >
                <span>Vaciar carrito</span> <FaRegTrashAlt />
              </Button>

              <Button
                variant="success d-flex align-items-center justify-content-center gap-2"
                className="w-100"
                onClick={handleFinalizarCompra}
                disabled={carrito.length === 0}
              >
                <span>Finalizar Reserva</span> <FaCheck />
              </Button>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default Carrito;