import { Form } from "react-bootstrap";
import { FiHome, FiTruck } from "react-icons/fi";
import "../../styles/pages/checkout.css";

const SeccionTipoEntrega = ({ tipoEntrega, onSeleccionar }) => {
    return (
        <div className="seccion-tipo-entrega">
            <h5 className="mb-3">Tipo de entrega</h5>

            <div className="tipos-entrega-list">
                <div
                    className={`tipo-entrega-card ${tipoEntrega === "retiro_local" ? "selected" : ""
                        }`}
                    onClick={() => onSeleccionar("retiro_local")}
                >
                    <Form.Check
                        type="radio"
                        name="tipoEntrega"
                        checked={tipoEntrega === "retiro_local"}
                        onChange={() => onSeleccionar("retiro_local")}
                        label={
                            <div className="d-flex align-items-start">
                                <FiHome size={24} className="me-3 mt-1" />
                                <div>
                                    <strong>Retiro en local</strong>
                                    <p className="mb-0 text-muted small">
                                        Retirá tu pedido en nuestro vivero
                                    </p>
                                    <p className="mb-0 text-muted small">
                                        Santa Fé 4600, Yerba Buena
                                    </p>
                                </div>
                            </div>
                        }
                    />
                </div>

                <div
                    className={`tipo-entrega-card ${tipoEntrega === "envio_domicilio" ? "selected" : ""
                        }`}
                    onClick={() => onSeleccionar("envio_domicilio")}
                >
                    <Form.Check
                        type="radio"
                        name="tipoEntrega"
                        checked={tipoEntrega === "envio_domicilio"}
                        onChange={() => onSeleccionar("envio_domicilio")}
                        label={
                            <div className="d-flex align-items-start">
                                <FiTruck size={24} className="me-3 mt-1" />
                                <div>
                                    <strong>Envío a domicilio</strong>
                                    <p className="mb-0 text-muted small">
                                        Recibí tu pedido en tu domicilio
                                    </p>
                                </div>
                            </div>
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default SeccionTipoEntrega;