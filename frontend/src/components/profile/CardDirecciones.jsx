import { useState, useEffect } from "react";
import { Card, Button, Badge, Spinner } from "react-bootstrap";
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiMapPin } from "react-icons/fi";
import Swal from "sweetalert2";
import { swalCustom } from "../../utils/customSwal";
import { useDireccionesStore } from "../../store/direccionesStore";
import DireccionForm from "../direcciones/DireccionForm";

const CardDirecciones = ({ className = "", isOpen, onEdit, onCancel }) => {
    const {
        direcciones,
        loading,
        fetchDirecciones,
        eliminarDireccion,
        marcarPrincipal,
    } = useDireccionesStore();

    const [modoFormulario, setModoFormulario] = useState(null);

    useEffect(() => {
        fetchDirecciones();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (!isOpen) setModoFormulario(null);
    }, [isOpen]);

    const handleSuccess = ({ created, updated }) => {
        if (created) {
            swalCustom.fire({ icon: "success", title: "Dirección agregada", timer: 1500, showConfirmButton: false });
        } else if (updated) {
            swalCustom.fire({ icon: "success", title: "Dirección actualizada", timer: 1500, showConfirmButton: false });
        } else {
            swalCustom.fire({ icon: "info", title: "Sin cambios", text: "No modificaste ningún dato.", timer: 1800, showConfirmButton: false });
        }
        setModoFormulario(null);
    };

    const handleCancel = ({ hayPendientes }) => {
        if (!hayPendientes) {
            setModoFormulario(null);
            return;
        }
        Swal.fire({
            title: "¿Descartar cambios?",
            text: "Los cambios que hiciste no se guardarán",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, descartar",
            cancelButtonText: "Seguir editando",
            confirmButtonColor: "#d33",
        }).then((result) => {
            if (result.isConfirmed) setModoFormulario(null);
        });
    };

    const handleEliminar = async (dir) => {
        if (direcciones.length === 1) {
            swalCustom.fire({
                icon: "info",
                title: "No se puede eliminar",
                text: "Necesitás tener al menos una dirección guardada",
            });
            return;
        }

        const esPrincipal = dir.esPrincipal === 1;
        const result = await Swal.fire({
            title: "¿Eliminar dirección?",
            text: esPrincipal
                ? "Esta es tu dirección principal. Si la eliminás, deberás asignar una nueva"
                : "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33",
        });

        if (!result.isConfirmed) return;

        const res = await eliminarDireccion(dir.idDireccion);
        if (res.ok) {
            swalCustom.fire({ icon: "success", title: "Dirección eliminada", timer: 1500, showConfirmButton: false });
        } else {
            swalCustom.fire({ icon: "error", title: "Error", text: res.error });
        }
    };

    const handleMarcarPrincipal = async (id) => {
        const res = await marcarPrincipal(id);
        if (res.ok) {
            swalCustom.fire({ icon: "success", title: "Dirección principal actualizada", timer: 1500, showConfirmButton: false });
        } else {
            swalCustom.fire({ icon: "error", title: "Error", text: res.error });
        }
    };

    const direccionPrincipal =
        direcciones.find((d) => d.esPrincipal === 1) || direcciones[0] || null;

    if (!isOpen) {
        return (
            <Card className={`mp-card ${className}`}>
                <Card.Body className="mp-card-body">
                    <div className="mp-card-head">
                        <h5 className="mp-card-h5">Direcciones</h5>
                        <button
                            type="button"
                            className="mp-text-action"
                            onClick={onEdit}
                        >
                            {direcciones.length === 0 ? "+ Agregar dirección" : "Ver mis direcciones"}
                        </button>
                    </div>

                    <div className="mp-divider" />

                    {loading ? (
                        <div className="mp-security-note mt-3">
                            <small className="text-muted">Cargando direcciones...</small>
                        </div>
                    ) : !direccionPrincipal ? (
                        <div className="mp-security-note mt-3">
                            <small className="text-muted">
                                No tenés direcciones guardadas.{" "}
                                <b>Agregá una dirección</b> para tus entregas.
                            </small>
                        </div>
                    ) : (
                        <div className="mp-security-note mt-3">
                            <div className="d-flex align-items-start gap-2">
                                <FiMapPin size={16} className="text-muted mt-1 flex-shrink-0" />
                                <div>
                                    {direccionPrincipal.alias && (
                                        <div className="mb-1">
                                            <strong>{direccionPrincipal.alias}</strong>
                                            <Badge bg="success" className="ms-2" style={{ fontSize: "0.7rem" }}>
                                                Principal
                                            </Badge>
                                        </div>
                                    )}
                                    <small className="text-muted d-block">
                                        {direccionPrincipal.calle} {direccionPrincipal.numero}
                                        {direccionPrincipal.piso && `, Piso ${direccionPrincipal.piso}`}
                                        {direccionPrincipal.departamento && ` Dpto "${direccionPrincipal.departamento}"`}
                                    </small>
                                    <small className="text-muted d-block">
                                        {direccionPrincipal.localidad}, {direccionPrincipal.provincia}
                                        {direccionPrincipal.codigoPostal && ` (CP: ${direccionPrincipal.codigoPostal})`}
                                    </small>
                                    {direcciones.length > 1 && (
                                        <small className="text-muted fst-italic d-block mt-1">
                                            + {direcciones.length - 1} dirección
                                            {direcciones.length - 1 > 1 ? "es" : ""} más
                                        </small>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </Card.Body>
            </Card>
        );
    }

    if (modoFormulario !== null) {
        const esEdicion = modoFormulario !== "agregar";
        const titulo = esEdicion ? "Editar dirección" : "Agregar dirección";
        const initialData = esEdicion ? modoFormulario : null;

        return (
            <Card className={`mp-card ${className}`}>
                <Card.Body className="mp-card-body">
                    <div className="mp-card-head">
                        <h5 className="mp-card-h5">{titulo}</h5>
                    </div>

                    <div className="mp-divider" />

                    <div className="mt-3">
                        <DireccionForm
                            initialData={initialData}
                            onSuccess={handleSuccess}
                            onCancel={handleCancel}
                        />
                    </div>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className={`mp-card ${className}`}>
            <Card.Body className="mp-card-body">
                <div className="mp-card-head">
                    <h5 className="mp-card-h5">Direcciones</h5>
                    <button
                        type="button"
                        className="mp-text-action"
                        onClick={onCancel}
                    >
                        Cerrar
                    </button>
                </div>

                <div className="mp-divider" />

                <div className="mt-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="mp-btn mb-3"
                        onClick={() => setModoFormulario("agregar")}
                    >
                        <FiPlus className="me-1" />
                        Agregar nueva dirección
                    </Button>

                    {loading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" size="sm" />
                            <p className="text-muted mt-2 mb-0">Cargando...</p>
                        </div>
                    ) : direcciones.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-muted">No tenés direcciones guardadas</p>
                        </div>
                    ) : (
                        <div className="direcciones-list">
                            {direcciones.map((dir) => (
                                <div
                                    key={dir.idDireccion}
                                    className="mb-3 p-3 border rounded"
                                    style={{
                                        backgroundColor: dir.esPrincipal === 1 ? "#f8f9fa" : "transparent",
                                    }}
                                >
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div className="flex-grow-1">
                                            {dir.alias && (
                                                <strong className="d-block mb-1">{dir.alias}</strong>
                                            )}
                                            {dir.esPrincipal === 1 && (
                                                <Badge bg="success" className="mb-2" style={{ fontSize: "0.7rem" }}>
                                                    <FiStar size={11} className="me-1" />
                                                    Principal
                                                </Badge>
                                            )}
                                            <small className="text-muted d-block">
                                                {dir.calle} {dir.numero}
                                                {dir.piso && `, Piso ${dir.piso}`}
                                                {dir.departamento && `, Dpto ${dir.departamento}`}
                                            </small>
                                            <small className="text-muted d-block">
                                                {dir.localidad}, {dir.provincia}
                                                {dir.codigoPostal && ` (CP: ${dir.codigoPostal})`}
                                            </small>
                                            {dir.referencia && (
                                                <small className="text-muted fst-italic d-block mt-1">
                                                    Ref: {dir.referencia}
                                                </small>
                                            )}
                                        </div>

                                        <div className="d-flex gap-2 flex-shrink-0">
                                            {dir.esPrincipal !== 1 && (
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    onClick={() => handleMarcarPrincipal(dir.idDireccion)}
                                                    title="Marcar como principal"
                                                >
                                                    <FiStar size={14} />
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => setModoFormulario(dir)}
                                                title="Editar"
                                            >
                                                <FiEdit2 size={14} />
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleEliminar(dir)}
                                                title="Eliminar"
                                            >
                                                <FiTrash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

export default CardDirecciones;