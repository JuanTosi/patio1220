import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
//eslint-disable-next-line
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../animations/variants";
import { FiTruck, FiUserCheck, FiBookOpen } from "react-icons/fi";
import { GiSprout, GiGardeningShears, GiPlantWatering } from "react-icons/gi";
import { WHATSAPP_NUMBER } from "../../utils/whatsappMensajes.js";
import "../../styles/pages/main-home.css";

const beneficios = [
    { titulo: "Atención personalizada", icono: <FiUserCheck size={20} /> },
    { titulo: "Envíos a domicilio", icono: <FiTruck size={20} /> },
    { titulo: "Asesoramiento experto", icono: <GiSprout size={20} /> },
];

const servicios = [
    {
        id: "paisajismo",
        titulo: "Paisajismo",
        descripcion: "Diseño y planificación de espacios verdes estéticos y funcionales, adaptados a cada ambiente.",
        icono: <GiGardeningShears size={26} />,
        imagen: "https://plus.unsplash.com/premium_photo-1664299231556-57f570023f87?auto=format&fit=crop&w=800&q=80",
        whatsapp: "Hola! Me interesa saber más sobre el servicio de Paisajismo.",
    },
    {
        id: "jardineria",
        titulo: "Jardinería",
        descripcion: "Mantenimiento integral, podas y cuidado profesional de jardines en toda su dimensión.",
        icono: <GiPlantWatering size={26} />,
        imagen: "https://images.unsplash.com/photo-1734079692160-fcbe4be6ab96?auto=format&fit=crop&w=800&q=80",
        whatsapp: "Hola! Me interesa saber más sobre el servicio de Jardinería.",
    },
    {
        id: "talleres",
        titulo: "Talleres",
        descripcion: "Actividades educativas y prácticas para aprender sobre plantas, cultivo y naturaleza.",
        icono: <GiSprout size={26} />,
        imagen: "https://images.unsplash.com/photo-1549448046-b89e7214060d?auto=format&fit=crop&w=800&q=80",
        whatsapp: "Hola! Me interesa saber más sobre los Talleres que ofrecen.",
    },
    {
        id: "capacitaciones",
        titulo: "Capacitaciones",
        descripcion: "Formaciones especializadas para profundizar en botánica, huerta urbana y cuidado vegetal.",
        icono: <FiBookOpen size={26} />,
        imagen: "https://plus.unsplash.com/premium_photo-1664299228258-8890ef6dc22c?auto=format&fit=crop&w=800&q=80",
        whatsapp: "Hola! Me interesa saber más sobre las Capacitaciones que ofrecen.",
    },
];

const categorias = [
    { nombre: "Plantas", categoria: "1", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRip7IjQ47SH4_AP2wW8n4LycLV7FmGtODduw&s" },
    { nombre: "Macetas", categoria: "2", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTU02NOrRTmSRVAVDq5fXPhQ2XVoqeOmhH4w&s" },
    { nombre: "Fertilizantes", categoria: "3", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4nr1XsOX2GSXp4G24UwjJQM4bjTFul-IuGw&s" },
    { nombre: "Herramientas", categoria: "4", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpMKE07ZrQ2slIfG6Wd0XXpsa0gIWD--vSYA&s" },
    { nombre: "Explorar todo", categoria: null, img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80", esExplorar: true },
];

const MainHome = () => {
    const navigate = useNavigate();
    const [flippedCard, setFlippedCard] = useState(null);

    return (
        <main className="home__main">

            <div className="home__franja">
                <Container>
                    <div className="home__franja-inner">
                        {beneficios.map((b, i) => (
                            <div key={i} className="home__franja-item">
                                <span className="home__franja-icono">{b.icono}</span>
                                <span className="home__franja-texto">{b.titulo}</span>
                            </div>
                        ))}
                    </div>
                </Container>
            </div>

            <section className="home__categorias">
                <Container>
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <motion.div className="home__section-head" variants={fadeInUp}>
                            <span className="home__eyebrow">Explorá el catálogo</span>
                            <h2 className="home__section-title">Encontrá lo que buscás</h2>
                        </motion.div>

                        <div className="home__cats-grid">
                            {categorias.map((cat, i) => (
                                <motion.div
                                    key={i}
                                    className={`home__cat-card ${i === 0 ? "home__cat-card--featured" : ""} ${cat.esExplorar ? "home__cat-card--explorar" : ""}`}
                                    variants={fadeInUp}
                                    onClick={() => {
                                        if (cat.esExplorar) {
                                            navigate("/catalogo");
                                        } else {
                                            navigate("/catalogo", { state: { categoria: cat.categoria } });
                                        }
                                    }}
                                    style={!cat.esExplorar ? { backgroundImage: `url(${cat.img})` } : {}}
                                >
                                    {!cat.esExplorar && <div className="home__cat-overlay" />}
                                    <span className="home__cat-nombre">{cat.nombre}</span>
                                    {cat.esExplorar && (
                                        <span className="home__cat-explorar-sub">Ver todos los productos</span>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </Container>
            </section>

            <section className="home__servicios">
                <Container>
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <motion.div className="home__section-head" variants={fadeInUp}>
                            <span className="home__eyebrow">Más que un vivero</span>
                            <h2 className="home__section-title">Lo que hacemos</h2>
                            <p className="home__section-sub">
                                Un espacio para aprender, diseñar y conectar con la naturaleza.
                            </p>
                        </motion.div>

                        <Row className="g-4">
                            {servicios.map((serv, i) => (
                                <Col xs={12} sm={6} lg={3} key={serv.id}>
                                    <motion.div
                                        className={`home__servicio-flip ${flippedCard === serv.id ? "is-flipped" : ""}`}
                                        variants={fadeInUp}
                                        custom={i}
                                        onClick={() => setFlippedCard(flippedCard === serv.id ? null : serv.id)}
                                    >
                                        <div className="home__servicio-flip-inner">

                                            <div
                                                className="home__servicio-front"
                                                style={{ backgroundImage: `url(${serv.imagen})` }}
                                            >
                                                <div className="home__servicio-front-overlay" />
                                                <div className="home__servicio-front-content">
                                                    <span className="home__servicio-front-icono">{serv.icono}</span>
                                                    <h5 className="home__servicio-front-titulo">{serv.titulo}</h5>
                                                </div>
                                            </div>

                                            <div className="home__servicio-back">
                                                <div className="home__servicio-back-icono">{serv.icono}</div>
                                                <h5 className="home__servicio-back-titulo">{serv.titulo}</h5>
                                                <p className="home__servicio-back-desc">{serv.descripcion}</p>
                                                <button
                                                    className="home__servicio-back-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(serv.whatsapp)}`;
                                                        window.open(url, "_blank");
                                                    }}
                                                >
                                                    + Info por WhatsApp
                                                </button>
                                            </div>

                                        </div>
                                    </motion.div>
                                </Col>
                            ))}
                        </Row>
                    </motion.div>
                </Container>
            </section>

        </main>
    );
};

export default MainHome;