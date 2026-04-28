import { useEffect, useState } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { FiMapPin, FiPlus, FiArrowLeft } from "react-icons/fi";
import { swalCustom } from "../../utils/customSwal";
import { useDireccionesStore } from "../../store/direccionesStore";
import DireccionForm from "../direcciones/DireccionForm";

const SeccionDireccion = ({ direccionSeleccionada, onSeleccionar }) => {
    const { direcciones, loading, fetchDirecciones } = useDireccionesStore();
    const [mostrarForm, setMostrarForm] = useState(false);

    useEffect(() => {
        const cargar = async () => {
            await fetchDirecciones();
        };
        cargar();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (direcciones.length === 0 || direccionSeleccionada) return;
        const principal = direcciones.find((d) => d.esPrincipal === 1) || direcciones[0];
        if (principal) onSeleccionar(principal);
    }, [direcciones, direccionSeleccionada, onSeleccionar]);

    const handleSuccess = ({ created, direccion }) => {
        swalCustom.fire({
            icon: "success",
            title: created ? "Dirección agregada" : "Dirección actualizada",
            timer: 1500,
            showConfirmButton: false,
        });

        const { direcciones: actualizadas } = useDireccionesStore.getState();
        const nueva = actualizadas.find(
            (d) => d.calle === direccion.calle && d.numero === direccion.numero
        ) || actualizadas[actualizadas.length - 1];

        if (nueva) onSeleccionar(nueva);
        setMostrarForm(false);
    };

    const handleCancel = ({ hayPendientes }) => {
        if (!hayPendientes) {
            setMostrarForm(false);
            return;
        }
        swalCustom.fire({
            title: "¿Descartar cambios?",
            text: "Los datos ingresados no se guardarán",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, descartar",
            cancelButtonText: "Seguir editando",
            confirmButtonColor: "#d33",
        }).then((result) => {
            if (result.isConfirmed) setMostrarForm(false);
        });
    };

    if (loading) {
        return (
            <div className="text-center py-3">
                <Spinner animation="border" size="sm" />
                <p className="mt-2 mb-0 text-muted">Cargando direcciones...</p>
            </div>
        );
    }

    return (
        <div className="seccion-direccion">
            <h5 className="mb-3">
                <FiMapPin className="me-2" />
                Dirección de entrega
            </h5>

            {mostrarForm ? (
                <>
                    <button
                        type="button"
                        className="btn btn-link p-0 mb-3 text-decoration-none"
                        onClick={() => handleCancel({ hayPendientes: true })}
                    >
                        <FiArrowLeft className="me-1" />
                        Volver a mis direcciones
                    </button>
                    <DireccionForm
                        initialData={null}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                        submitLabel="Guardar y usar esta dirección"
                    />
                </>
            ) : (
                <>
                    {direcciones.length === 0 && (
                        <Alert variant="info" className="mb-3">
                            No tenés direcciones guardadas. Agregá una para continuar.
                        </Alert>
                    )}

                    {direcciones.length > 0 && (
                        <div className="direcciones-list mb-3">
                            {direcciones.map((dir) => (
                                <div
                                    key={dir.idDireccion}
                                    className={`direccion-card ${direccionSeleccionada?.idDireccion === dir.idDireccion
                                        ? "selected"
                                        : ""
                                        }`}
                                    onClick={() => onSeleccionar(dir)}
                                >
                                    <Form.Check
                                        type="radio"
                                        name="direccion"
                                        id={`dir-${dir.idDireccion}`}
                                        checked={
                                            direccionSeleccionada?.idDireccion === dir.idDireccion
                                        }
                                        onChange={() => onSeleccionar(dir)}
                                        label={
                                            <div>
                                                <strong>{dir.alias || "Dirección"}</strong>
                                                <p className="mb-0 text-muted small">
                                                    {dir.calle} {dir.numero}
                                                    {dir.piso && `, Piso ${dir.piso}`}
                                                    {dir.departamento && ` Depto ${dir.departamento}`}
                                                </p>
                                                <p className="mb-0 text-muted small">
                                                    {dir.localidad}, {dir.provincia}
                                                </p>
                                            </div>
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setMostrarForm(true)}
                    >
                        <FiPlus className="me-1" />
                        Agregar nueva dirección
                    </Button>
                </>
            )}
        </div>
    );
};

export default SeccionDireccion;