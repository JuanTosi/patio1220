import { Card, Form, Row, Col, Button } from "react-bootstrap";

const CardDatosUsuario = ({
    isOpen,
    onEdit,
    onCancel,
    onSubmit,
    formData,
    onChange,
    hasChanges,
    className = "",
}) => {
    return (
        <Card className={`mp-card ${className}`}>
            <Card.Body className="mp-card-body">
                <div className="mp-card-head">
                    <h5 className="mp-card-h5">Datos personales</h5>

                    {!isOpen && (
                        <button
                            type="button"
                            className="mp-text-action"
                            onClick={onEdit}
                            aria-label="Editar perfil"
                            title="Editar"
                        >
                            Editar
                        </button>
                    )}

                    {isOpen && (
                        <button
                            type="button"
                            className="mp-text-action"
                            onClick={onCancel}
                            aria-label="Cancelar"
                            title="Cancelar"
                        >
                            Cancelar
                        </button>
                    )}
                </div>

                <div className="mp-divider" />

                {!isOpen && (
                    <div className="mp-security-note mt-3">
                        <small className="text-muted">
                            Modifica tus <b> datos de usuario</b> aquí
                        </small>
                    </div>
                )}

                {isOpen && (
                    <Form onSubmit={onSubmit} className="mt-3">
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Nombre</Form.Label>
                                    <Form.Control
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={onChange}
                                        className="mp-control-readonly"
                                        placeholder="Nombre/s"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Apellido</Form.Label>
                                    <Form.Control
                                        name="apellido"
                                        value={formData.apellido}
                                        onChange={onChange}
                                        className="mp-control-readonly"
                                        placeholder="Apellido/s"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Teléfono</Form.Label>
                                    <Form.Control
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={onChange}
                                        className="mp-control-readonly"
                                        placeholder="Numero de teléfono (sin espacios)"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="mp-actions mt-3">
                            <Button
                                variant="primary"
                                type="submit"
                                className="mp-btn"
                                disabled={!hasChanges}
                            >
                                Guardar cambios
                            </Button>
                            <Button
                                variant="secondary"
                                type="button"
                                className="mp-btn"
                                onClick={onCancel}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </Form>
                )}
            </Card.Body>
        </Card>
    );
};

export default CardDatosUsuario;