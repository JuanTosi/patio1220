import "../../styles/pages/servicio.css";
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGES } from "../../utils/whatsappMensajes";

const MainServicio = () => {
  const servicios = [
    {
      id: "paisajismo",
      titulo: "Paisajismo",
      descripcion:
        "Diseño y planificación de espacios verdes estéticos y funcionales.",
      imagen:
        "https://plus.unsplash.com/premium_photo-1664299231556-57f570023f87?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cGFpc2FqaXNtb3xlbnwwfHwwfHx8MA%3D%3D&fm=jpg&q=60&w=3000",
    },
    {
      id: "jardineria",
      titulo: "Jardinería",
      descripcion: "Mantenimiento, podas y cuidado integral de tus jardines.",
      imagen:
        "https://images.unsplash.com/photo-1734079692160-fcbe4be6ab96?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: "talleres",
      titulo: "Talleres",
      descripcion:
        "Actividades educativas para aprender sobre plantas y naturaleza.",
      imagen:
        "https://images.unsplash.com/photo-1549448046-b89e7214060d?q=80&w=1033&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: "capacitaciones",
      titulo: "Capacitaciones",
      descripcion: "Formaciones más completas para ampliar tus conocimientos.",
      imagen:
        "https://plus.unsplash.com/premium_photo-1664299228258-8890ef6dc22c?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGES.servicio
  )}`;

  return (
    <section className="servicio-section">
      <h2 className="servicio-title">Conocé todo lo que ofrecemos para acompañar tus espacios verdes.</h2>

      <br />

      <div className="servicio-grid">
        {servicios.map((serv) => (
          <div key={serv.id} className="servicio-card-no-link">
            <div
              className="servicio-img"
              style={{ backgroundImage: `url(${serv.imagen})` }}
            >
              <div className="servicio-overlay"></div>
            </div>
            <h3 className="servicio-titulo">{serv.titulo}</h3>
            <p className="servicio-descripcion">{serv.descripcion}</p>
          </div>
        ))}
      </div>
      <br />
      <h3 className="servicio-turno-titulo">
        Agendá tu turno{" "}
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
          aquí
        </a>
      </h3>
    </section>
  );
};

export default MainServicio;
