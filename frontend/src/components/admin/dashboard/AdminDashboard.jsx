import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import "../../../styles/admin/admin.css";
import { FiTag, FiClipboard, FiUsers, FiBarChart2 } from "react-icons/fi";

const CARDS = [
  {
    key: "productos",
    title: "Productos",
    Icon: FiTag,
    to: "/admin/productos",
    desc: "Gestionar catálogo",
    soloAdmin: false,
  },
  {
    key: "usuarios",
    title: "Usuarios",
    Icon: FiUsers,
    to: "/admin/usuarios",
    desc: "Roles y accesos",
    soloAdmin: true,
  },
  {
    key: "reservas",
    title: "Reservas",
    Icon: FiClipboard,
    to: "/admin/reservas",
    desc: "Gestionar reservas",
    soloAdmin: false,
  },
  {
    key: "reportes",
    title: "Reportes",
    Icon: FiBarChart2,
    to: "/admin/reportes",
    desc: "Métricas clave",
    soloAdmin: true,
  },
];

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const esAdmin = user?.rol === "admin";

  const cardsFiltradas = CARDS.filter((c) => !c.soloAdmin || esAdmin);

  return (
    <section className="admin-page">
      <div className="admin-cardsGrid">
        {cardsFiltradas.map((card) => {
          const { key, title, Icon, to, desc } = card;
          return (
            <button
              key={key}
              type="button"
              className="admin-squareCard"
              onClick={() => navigate(to)}
              title={`Ir a ${title}`}
            >
              <div className="admin-squareCard__iconWrap" aria-hidden="true">
                <Icon className="admin-squareCard__icon" />
              </div>
              <div className="admin-squareCard__title">{title}</div>
              <div className="admin-squareCard__desc">{desc}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default AdminDashboardPage;