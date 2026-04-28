import { useEffect } from "react";
import { Form, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import AutocompleteInput from "../common/AutocompleteInput";
import { useDireccionForm } from "./useDireccionForm";

const DireccionForm = ({ initialData = null, onSuccess, onCancel, submitLabel }) => {
    const {
        formData,
        errors,
        submitting,
        esModoEdicion,
        esPrincipalOriginal,
        provincias,
        loadingProvincias,
        localidades,
        loadingLocalidades,
        cargarProvincias,
        cargarLocalidades,
        handleChange,
        handleProvinciaChange,
        handleLocalidadChange,
        handleSubmit,
        handleCancel,
    } = useDireccionForm({ initialData, onSuccess, onCancel });

    useEffect(() => {
        cargarProvincias();
    }, [cargarProvincias]);

    useEffect(() => {
        if (initialData?.provincia) {
            cargarLocalidades(initialData.provincia);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const labelGuardar = submitLabel
        ?? (esModoEdicion ? "Guardar cambios" : "Agregar dirección");

    return (
        <Form onSubmit={handleSubmit} noValidate>

            {errors.general && (
                <Alert variant="danger" className="mb-3">
                    {errors.general}
                </Alert>
            )}

            <Row className="g-3">

                <Col md={12}>
                    <Form.Group>
                        <Form.Label>
                            Alias <small className="text-muted">(opcional)</small>
                        </Form.Label>
                        <Form.Control
                            name="alias"
                            value={formData.alias}
                            onChange={handleChange}
                            placeholder="Ej: Casa, Trabajo, Casa de mamá"
                            maxLength={50}
                        />
                    </Form.Group>
                </Col>

                <Col md={8}>
                    <Form.Group>
                        <Form.Label>
                            Calle <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            name="calle"
                            value={formData.calle}
                            onChange={handleChange}
                            placeholder="Ej: San Martín"
                            isInvalid={!!errors.calle}
                            maxLength={100}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.calle}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={4}>
                    <Form.Group>
                        <Form.Label>
                            Número <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            name="numero"
                            value={formData.numero}
                            onChange={handleChange}
                            placeholder="Ej: 1234"
                            isInvalid={!!errors.numero}
                            maxLength={10}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.numero}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group>
                        <Form.Label>
                            Piso <small className="text-muted">(opcional)</small>
                        </Form.Label>
                        <Form.Control
                            name="piso"
                            value={formData.piso}
                            onChange={handleChange}
                            placeholder="Ej: 2"
                            maxLength={10}
                        />
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group>
                        <Form.Label>
                            Departamento <small className="text-muted">(opcional)</small>
                        </Form.Label>
                        <Form.Control
                            name="departamento"
                            value={formData.departamento}
                            onChange={handleChange}
                            placeholder="Ej: A"
                            maxLength={10}
                        />
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group>
                        <Form.Label>
                            Provincia <span className="text-danger">*</span>
                        </Form.Label>
                        {loadingProvincias ? (
                            <div className="d-flex align-items-center gap-2 mt-2">
                                <Spinner animation="border" size="sm" />
                                <small className="text-muted">Cargando provincias...</small>
                            </div>
                        ) : (
                            <Form.Select
                                name="provincia"
                                value={formData.provincia}
                                onChange={handleProvinciaChange}
                                isInvalid={!!errors.provincia}
                            >
                                <option value="">Seleccioná una provincia</option>
                                {provincias.map((prov) => (
                                    <option key={prov.id} value={prov.nombre}>
                                        {prov.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        )}
                        <Form.Control.Feedback type="invalid">
                            {errors.provincia}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <AutocompleteInput
                        label="Localidad"
                        required
                        value={formData.localidad}
                        onChange={handleLocalidadChange}
                        suggestions={localidades}
                        placeholder={
                            !formData.provincia
                                ? "Primero elegí una provincia"
                                : loadingLocalidades
                                    ? "Cargando localidades..."
                                    : "Escribir localidad..."
                        }
                        disabled={!formData.provincia || loadingLocalidades}
                        loading={loadingLocalidades}
                        error={errors.localidad}
                    />
                </Col>

                <Col md={6}>
                    <Form.Group>
                        <Form.Label>
                            Código Postal <small className="text-muted">(opcional)</small>
                        </Form.Label>
                        <Form.Control
                            name="codigoPostal"
                            value={formData.codigoPostal}
                            onChange={handleChange}
                            placeholder="Ej: 4000"
                            isInvalid={!!errors.codigoPostal}
                            maxLength={4}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.codigoPostal}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={12}>
                    <Form.Group>
                        <Form.Label>
                            Referencia <small className="text-muted">(opcional)</small>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            name="referencia"
                            value={formData.referencia}
                            onChange={handleChange}
                            placeholder="Ej: Casa de dos pisos, portón verde, timbre roto..."
                            maxLength={255}
                        />
                    </Form.Group>
                </Col>

                {!esPrincipalOriginal && (
                    <Col md={12}>
                        <Form.Check
                            type="checkbox"
                            name="esPrincipal"
                            id="check-es-principal"
                            checked={formData.esPrincipal}
                            onChange={handleChange}
                            label="Marcar como dirección principal"
                        />
                    </Col>
                )}
            </Row>

            <div className="d-flex gap-2 mt-4">
                <Button
                    variant="primary"
                    type="submit"
                    disabled={submitting}
                >
                    {submitting ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Guardando...
                        </>
                    ) : labelGuardar}
                </Button>
                <Button
                    variant="secondary"
                    type="button"
                    onClick={handleCancel}
                    disabled={submitting}
                >
                    Cancelar
                </Button>
            </div>
        </Form>
    );
};

export default DireccionForm;