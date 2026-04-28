import { useState, useEffect } from "react";
import { Form, Spinner, Alert } from "react-bootstrap";
import { FiCreditCard } from "react-icons/fi";
import axios from "../../api/axiosConfig";
import "../../styles/pages/checkout.css";

const SeccionPago = ({ metodoPagoSeleccionado, onSeleccionar }) => {
    const [metodosPago, setMetodosPago] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarMetodosPago();
        //eslint-disable-next-line
    }, []);

    const cargarMetodosPago = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/metodos-pago/activos");
            setMetodosPago(data);

            if (data.length > 0 && !metodoPagoSeleccionado) {
                onSeleccionar(data[0]);
            }
        } catch (error) {
            console.error("Error al cargar métodos de pago:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-3">
                <Spinner animation="border" size="sm" />
                <p className="mt-2 mb-0">Cargando métodos de pago...</p>
            </div>
        );
    }

    if (metodosPago.length === 0) {
        return (
            <Alert variant="warning">
                No hay métodos de pago disponibles en este momento.
            </Alert>
        );
    }

    return (
        <div className="seccion-pago">
            <h5 className="mb-3">
                <FiCreditCard className="me-2" />
                Método de pago
            </h5>

            <div className="metodos-pago-list">
                {metodosPago.map((metodo) => (
                    <div
                        key={metodo.idMetodoPago}
                        className={`metodo-pago-card ${metodoPagoSeleccionado?.idMetodoPago === metodo.idMetodoPago
                            ? "selected"
                            : ""
                            }`}
                        onClick={() => onSeleccionar(metodo)}
                    >
                        <Form.Check
                            type="radio"
                            name="metodoPago"
                            checked={metodoPagoSeleccionado?.idMetodoPago === metodo.idMetodoPago}
                            onChange={() => onSeleccionar(metodo)}
                            label={
                                <div>
                                    <strong>{metodo.nombreMetodo}</strong>
                                    {metodo.descripcion && (
                                        <p className="mb-0 text-muted small">{metodo.descripcion}</p>
                                    )}
                                </div>
                            }
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SeccionPago;