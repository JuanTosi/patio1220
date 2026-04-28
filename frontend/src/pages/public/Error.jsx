import { useNavigate } from "react-router-dom";

const Error = () => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: "55vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
            <div style={{ textAlign: "center", maxWidth: 480 }}>
                <p style={{ fontSize: 96, fontWeight: 700, color: "var(--color-verde-bosque)", lineHeight: 1, margin: "0 0 0.5rem", fontFamily: "var(--fuente-titulos)" }}>
                    404
                </p>
                <h1 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
                    Página no encontrada
                </h1>
                <p style={{ color: "#6b7280", marginBottom: "2rem", lineHeight: 1.6 }}>
                    La dirección que ingresaste no existe o fue movida. Revisá el enlace o volvé al inicio.
                </p>
                <button
                    onClick={() => navigate("/")}
                    style={{
                        padding: "10px 28px",
                        background: "var(--color-verde-bosque)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--radio)",
                        fontSize: "0.95rem",
                        fontFamily: "inherit",
                        cursor: "pointer",
                    }}
                >
                    Ir al inicio
                </button>
            </div>
        </div>
    );
};

export default Error;