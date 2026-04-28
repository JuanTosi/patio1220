import { Card, Form, Row, Col, Button } from "react-bootstrap";
import { useState } from "react";
import { PASSWORD_RULES } from "../../utils/passwordRules";
import { getPasswordStrength } from "../../utils/passwordStrength";
import { BsEye, BsEyeSlash } from "react-icons/bs";

function PasswordRuleList({ password }) {
  if (!password) return null;

  return (
    <ul className="mp-pass-rules-list">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);

        return (
          <li
            key={rule.id}
            className={`mp-pass-rule-item ${passed ? "mp-rule-ok" : "mp-rule-fail"}`}
          >
            <span className="mp-rule-icon">{passed ? "✓" : "✗"}</span>

            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

const CardModificarPassword = ({
  isOpen,
  onEdit,
  onCancel,
  onSubmit,
  security,
  onChange,
  className = "",
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = getPasswordStrength(security.nuevaPassword);

  return (
    <Card className={`mp-card ${className}`}>
      <Card.Body className="mp-card-body">
        <div className="mp-card-head">
          <h5 className="mp-card-h5">Cambio de contraseña</h5>

          {!isOpen ? (
            <button type="button" className="mp-text-action" onClick={onEdit}>
              Editar
            </button>
          ) : (
            <button type="button" className="mp-text-action" onClick={onCancel}>
              Cancelar
            </button>
          )}
        </div>

        <div className="mp-divider" />

        {!isOpen && (
          <div className="mp-security-note mt-3">
            <small className="text-muted">
              Cambia tu <b>contraseña</b> aqui
            </small>
          </div>
        )}

        {isOpen && (
          <Form onSubmit={onSubmit} className="mt-3">
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Contraseña actual</Form.Label>
                  <div className="password-input">
                    <Form.Control
                      type={showCurrentPassword ? "text" : "password"}
                      name="passwordActual"
                      value={security.passwordActual}
                      onChange={onChange}
                      required
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? <BsEyeSlash /> : <BsEye />}
                    </button>
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Nueva contraseña</Form.Label>
                  <div className="password-input">
                    <Form.Control
                      type={showNewPassword ? "text" : "password"}
                      name="nuevaPassword"
                      value={security.nuevaPassword}
                      onChange={onChange}
                      required
                      minLength={6}
                      maxLength={30}
                      pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{6,30}$"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <BsEyeSlash /> : <BsEye />}
                    </button>
                  </div>
                  <PasswordRuleList password={security.nuevaPassword} />

                  {strength && (
                    <div
                      className={`mp-password-strength strength-${strength}`}
                    >
                      Seguridad: {strength}
                    </div>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Repetir nueva contraseña</Form.Label>
                  <div className="password-input">
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmarNuevaPassword"
                      value={security.confirmarNuevaPassword}
                      onChange={onChange}
                      required
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <BsEyeSlash /> : <BsEye />}
                    </button>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <div className="mp-actions mt-3">
              <Button variant="primary" type="submit" className="mp-btn">
                Actualizar contraseña
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

export default CardModificarPassword;
