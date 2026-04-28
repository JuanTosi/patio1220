import { useNavigate } from "react-router-dom";
import Carousel from "react-bootstrap/Carousel";
import "../../styles/components/carrusel.css";
// eslint-disable-next-line
import { motion } from "framer-motion";
import img1 from "../../assets/images/carrusel/imgcarrusel1.jpg";
import img2 from "../../assets/images/carrusel/imgcarrusel2.jpg";
import img3 from "../../assets/images/carrusel/imgcarrusel3.jpg";

const slides = [
    {
        src: img1,
        eyebrow: "Paisajismo & Diseño",
        title: "Creamos espacios verdes únicos",
        text: "Diseño, planificación y mantenimiento de jardines a medida.",
    },
    {
        src: img2,
        eyebrow: "Plantas de interior y exterior",
        title: "Naturaleza en cada rincón",
        text: "Selección curada de especies para tu hogar o jardín.",
    },
    {
        src: img3,
        eyebrow: "Asesoramiento profesional",
        title: "Jardinería con criterio",
        text: "Te acompañamos en cada etapa, desde la elección hasta el cuidado.",
    },
];

const Carrusel = () => {
    const navigate = useNavigate();

    return (
        <div className="home__carrusel">
            <Carousel fade interval={4000} pause={false} controls={false} indicators={true}>
                {slides.map((item, index) => (
                    <Carousel.Item key={index}>
                        <div className="home__carrusel-slide">
                            <img
                                className="home__carrusel-img"
                                src={item.src}
                                alt={item.title}
                            />
                            <div className="home__carrusel-slide-overlay" />
                        </div>
                        <div className="home__carrusel-caption">
                            <motion.span
                                className="home__carrusel-eyebrow"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.55, delay: 0.1 }}
                            >
                                {item.eyebrow}
                            </motion.span>
                            <motion.h2
                                className="home__carrusel-title"
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.22 }}
                            >
                                {item.title}
                            </motion.h2>
                            <motion.p
                                className="home__carrusel-text"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.55, delay: 0.36 }}
                            >
                                {item.text}
                            </motion.p>
                            <motion.div
                                className="home__carrusel-actions"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                <button
                                    className="home__carrusel-btn home__carrusel-btn--primary"
                                    onClick={() => navigate("/catalogo")}
                                >
                                    Ver catálogo
                                </button>
                                <button
                                    className="home__carrusel-btn home__carrusel-btn--ghost"
                                    onClick={() => navigate("/guia")}
                                >
                                    Conocer más
                                </button>
                            </motion.div>
                        </div>
                    </Carousel.Item>
                ))}
            </Carousel>
        </div>
    );
};

export default Carrusel;