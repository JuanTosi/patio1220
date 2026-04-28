import { Link, Outlet, useLocation } from "react-router-dom";
import "../../../styles/admin/admin.css";
import { MdNavigateNext } from "react-icons/md";

const LABELS = {
    admin: "Dashboard",
    productos: "Productos",
    papelera: "Productos archivados",
    servicios: "Servicios",
    pedidos: "Pedidos",
    usuarios: "Usuarios",
    reservas: "Reservas",
    reportes: "Reportes",
    nuevo: "Nuevo",
    editar: "Editar",
};

function humanize(segment) {
    const s = decodeURIComponent(segment).replaceAll("-", " ");

    if (/^\d+$/.test(segment)) {
        return `#${segment}`;
    }

    return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildCrumbs(pathname) {
    const segments = pathname.split("/").filter(Boolean);
    const adminIndex = segments.indexOf("admin");
    if (adminIndex === -1) return [];

    const relevant = segments.slice(adminIndex);
    const crumbs = [];
    let acc = "";

    for (const seg of relevant) {
        acc += `/${seg}`;
        const label = LABELS[seg] ?? humanize(seg);
        crumbs.push({ label, to: acc });
    }
    return crumbs;
}

const AdminLayout = () => {
    const { pathname } = useLocation();
    const crumbs = buildCrumbs(pathname);

    const isDashboard = pathname === "/admin";

    return (
        <div className="admin-shell">
            <header className="admin-header">
                <div className="admin-header__inner">
                    <div className="admin-header__left">
                        <nav className="admin-bcTitle" aria-label="Breadcrumb">
                            {crumbs.map((c, idx) => {
                                const isLast = idx === crumbs.length - 1;
                                return (
                                    <span className="admin-bcTitle__item" key={c.to}>
                                        {idx > 0 && <MdNavigateNext className="admin-bcTitle__sep" />}
                                        {isLast ? (
                                            <span className="admin-bcTitle__current">{c.label}</span>
                                        ) : (
                                            <Link className="admin-bcTitle__link" to={c.to}>
                                                {c.label}
                                            </Link>
                                        )}
                                    </span>
                                );
                            })}
                        </nav>
                        <div className="admin-subtitle">Panel de administración | gestión y control</div>
                    </div>
                </div>
            </header>

            <main className="admin-main">
                <div className={`admin-surface ${isDashboard ? "admin-surface--dashboard" : ""}`}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
