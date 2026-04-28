import "../../styles/components/footer.css";
import { FaInstagram, FaFacebook, FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section footer-about">
                    <h2 className="footer-logo">Patio 1220</h2>
                    <p>
                        Espacio verde y diseño natural. <br />
                        Plantas, macetas y decoración para transformar tu hogar.
                    </p>
                </div>

                <div className="footer-section footer-contact">
                    <ul>
                        <li><FaMapMarkerAlt className="footer-icon" /> Santa Fe 4600 · San Miguel de Tucumán</li>
                        <li><FaEnvelope className="footer-icon" /> contacto@patio1220.com</li>
                        <li><FaWhatsapp className="footer-icon" /> +54 381 650 5000</li>
                    </ul>
                </div>

                <div className="footer-section footer-social">
                    <h3>Seguinos</h3>
                    <div className="social-icons">
                        <a href="https://www.instagram.com/patio.1220/" aria-label="Instagram" target="blank"><FaInstagram /></a>
                        <a href="https://www.facebook.com/people/Patio-1220/100083043053405/?locale=hi_IN" aria-label="Facebook" target="blank"><FaFacebook /></a>
                        <a href="" aria-label="Whatsapp"><FaWhatsapp /></a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Patio 1220 — Todos los derechos reservados.</p>
            </div>
        </footer>
    );
};

export default Footer;
