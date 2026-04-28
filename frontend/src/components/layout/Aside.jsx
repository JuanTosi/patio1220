import { useState, useMemo } from "react";
import { Form, Button, InputGroup, Row, Col, Container } from "react-bootstrap";
import { FaTimesCircle } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import AutocompleteInput from "../common/AutocompleteInput";
import "../../styles/components/aside.css";

const CATEGORIAS = {
  1: "Plantas",
  2: "Macetas",
  3: "Fertilizantes",
  4: "Herramientas",
  5: "Otros",
};

const Aside = ({ filtros, setFiltros, productos = [], setPaginaActual }) => {
  const sugerencias = useMemo(() => {
    return productos
      .filter((p) => p.activo === 1 || p.activo === true)
      .map((p) => ({
        id: p.idProducto,
        nombre: p.nombreProducto,
        categoria: CATEGORIAS[String(p.idCategoria)] || "",
      }));
  }, [productos]);
  const [busquedaLocal, setBusquedaLocal] = useState(filtros.busqueda);

  const hayFiltrosActivos =
    filtros.busqueda || filtros.categoria || filtros.orden;

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
    setPaginaActual(1);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      categoria: "",
      orden: "",
      soloDisponibles: false,
    });
    setBusquedaLocal("");
    setPaginaActual(1);
  };

  return (
    <Container fluid className="aside-topbar-container">
      <div
        id="filtros-collapse"
        className="aside-topbar shadow-sm bg-light rounded py-3 px-4 mt-2"
      >
        <Row className="gy-3 gx-3 align-items-start justify-content-between">
          <Col xs={12} md={4} lg={3}>
            <div style={{ display: "flex", alignItems: "stretch" }}>
              <div style={{ flex: 1 }}>
                <AutocompleteInput
                  className="autocomplete-con-boton"
                  value={busquedaLocal}
                  onChange={(value) => setBusquedaLocal(value)}
                  onSelect={(sugerencia) => {
                    setBusquedaLocal(sugerencia.nombre);
                    handleFiltroChange("busqueda", sugerencia.nombre);
                  }}
                  onConfirm={(value) => {
                    handleFiltroChange("busqueda", value);
                  }}
                  suggestions={sugerencias}
                  placeholder="Buscar producto..."
                  renderSuggestion={(sugerencia) => (
                    <div className="d-flex justify-content-between align-items-center w-100">
                      <span>{sugerencia.nombre}</span>
                      {sugerencia.categoria && (
                        <small className="text-muted ms-2">{sugerencia.categoria}</small>
                      )}
                    </div>
                  )}
                />
              </div>
              <Button
                variant="outline-secondary"
                onClick={() => handleFiltroChange("busqueda", busquedaLocal)}
                title="Buscar"
                style={{
                  borderRadius: "0 8px 8px 0",
                  borderLeft: "none",
                  marginTop: "0",
                  height: "36px",
                  width: "36px",
                  alignSelf: "flex-end",
                }}
              >
                <FiSearch style={{ marginTop: "-10px", marginLeft: "-8px" }} />
              </Button>
            </div>
          </Col>

          <Col xs={6} md={3} lg={2}>
            <Form.Select
              value={filtros.categoria}
              onChange={(e) => handleFiltroChange("categoria", e.target.value)}
            >
              <option value="">Todas las categorías</option>
              <option value="1">Plantas</option>
              <option value="2">Macetas</option>
              <option value="3">Fertilizantes</option>
              <option value="4">Herramientas</option>
              <option value="5">Otros</option>
            </Form.Select>
          </Col>

          <Col xs={6} md={3} lg={2}>
            <Form.Select
              value={filtros.orden}
              onChange={(e) => handleFiltroChange("orden", e.target.value)}
            >
              <option value="">Ordenar por...</option>
              <option value="az">A-Z</option>
              <option value="precioAsc">Menor precio</option>
              <option value="precioDesc">Mayor precio</option>
            </Form.Select>
          </Col>

          <Col xs={12} md={3} lg={2}>
            <Form.Check
              type="checkbox"
              id="soloDisponibles"
              label="Ocultar productos sin stock"
              checked={filtros.soloDisponibles}
              onChange={(e) =>
                handleFiltroChange("soloDisponibles", e.target.checked)
              }
            />
          </Col>

          <Col xs={12} md={5} lg={4}>
            <div className="d-flex justify-content-end">
              <Button
                variant="outline-primary"
                className="btn-limpiar"
                disabled={!hayFiltrosActivos}
                onClick={handleLimpiarFiltros}
              >
                Limpiar filtros
              </Button>
            </div>
          </Col>
        </Row>

        {hayFiltrosActivos && (
          <div className="filtros-activos mt-3 px-4">
            <p className="mb-2 fw-semibold text-muted">Filtros activos:</p>
            <div className="d-flex flex-wrap align-items-center gap-2">
              {filtros.busqueda && (
                <span className="chip-filtro">
                  {filtros.busqueda}
                  <button
                    onClick={() => {
                      setBusquedaLocal("");
                      handleFiltroChange("busqueda", "");
                    }}
                  >
                    <FaTimesCircle />
                  </button>
                </span>
              )}

              {filtros.categoria && (
                <span className="chip-filtro">
                  {CATEGORIAS[filtros.categoria]}
                  <button onClick={() => handleFiltroChange("categoria", "")}>
                    <FaTimesCircle />
                  </button>
                </span>
              )}

              {filtros.orden && (
                <span className="chip-filtro">
                  {filtros.orden === "az"
                    ? "A-Z"
                    : filtros.orden === "precioAsc"
                      ? "Menor precio"
                      : "Mayor precio"}
                  <button onClick={() => handleFiltroChange("orden", "")}>
                    <FaTimesCircle />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Aside;
