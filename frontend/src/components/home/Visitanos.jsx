import { Container, Button } from "react-bootstrap";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import {
    fadeInUp,
    fadeDelayed,
    staggerContainer,
    scaleIn,
} from "../../animations/variants.js";
import "../../styles/components/visitanos.css";
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGES } from "../../utils/whatsappMensajes.js";

const Visitanos = () => {
    const handleWhatsAppClick = (mensaje = WHATSAPP_MESSAGES.contactoGeneral) => {
        const encodedMessage = encodeURIComponent(mensaje.trim());
        const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
        window.open(whatsappURL, "_blank");
    };

    return (
        <section className="home__visitanos text-center py-5">
            <Container>
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <motion.h2
                        className="home__visitanos-titulo mb-3"
                        variants={fadeInUp}
                    >
                        Visitá nuestro vivero y llevá naturaleza a casa
                    </motion.h2>

                    <motion.p
                        className="home__visitanos-texto mb-4"
                        variants={fadeDelayed(0.2)}
                    >
                        Te esperamos con la mejor atención, asesoramiento personalizado y
                        una gran variedad de plantas, macetas y artículos de jardinería.
                    </motion.p>

                    <motion.div variants={scaleIn}>
                        <button
                            className="home__visitanos-boton"
                            onClick={() => handleWhatsAppClick(WHATSAPP_MESSAGES.contactoGeneral)}
                        >
                            Contactanos <FaWhatsapp className="whatsapp-icon" />
                        </button>
                    </motion.div>
                </motion.div>
            </Container>
        </section>
    );
};

export default Visitanos;
