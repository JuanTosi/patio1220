import { useState, useEffect, useRef } from "react";
import { Container, Row, Col } from "react-bootstrap";
//eslint-disable-next-line
import { motion, AnimatePresence } from "framer-motion";
import {
    FiShoppingBag, FiPackage, FiTruck, FiCreditCard, FiUser,
    FiPlus, FiMinus, FiDroplet, FiSun, FiWind, FiAlertTriangle,
    FiFeather, FiRefreshCw
} from "react-icons/fi";
import "../../styles/pages/guia-vivero.css";
import Visitanos from '../../components/home/Visitanos';

const faqData = [
    {
        categoria: "Reservas",
        icono: <FiShoppingBag size={18} />,
        preguntas: [
            { q: "¿Cómo hago una reserva?", a: "Navegá al catálogo, elegí el producto y el tamaño, agregalo al carrito y completá el proceso. Necesitás estar registrado para finalizar." },
            { q: "¿Qué diferencia hay entre reservar y comprar?", a: "En Patio 1220 trabajamos con reservas: separás el producto y lo retirás o recibís una vez confirmado. Un encargado revisará tu pedido y te contactará para coordinar." },
            { q: "¿Cuánto tiempo tiene validez mi reserva?", a: "Tu reserva se mantiene activa mientras esté pendiente de confirmación. Si hay algún problema con el stock, te contactaremos directamente." },
            { q: "¿Puedo cancelar una reserva?", a: "Sí. Podés hacerlo desde 'Mis reservas' en tu perfil, siempre que no haya sido confirmada ni despachada todavía." },
            { q: "¿Cómo sé si mi reserva fue confirmada?", a: "Vas a recibir un mail de confirmación. También podés ver el estado actualizado en cualquier momento desde 'Mis reservas'." },
        ],
    },
    {
        categoria: "Productos",
        icono: <FiPackage size={18} />,
        preguntas: [
            { q: "¿Qué significa que un producto aparece como 'no disponible'?", a: "Ese producto o variante de tamaño no tiene stock en este momento. Podés consultar más adelante o contactarnos por WhatsApp para saber cuándo reponemos." },
            { q: "¿El stock que veo es en tiempo real?", a: "Sí, el stock refleja las unidades disponibles al momento de consultar. Puede haber diferencias mínimas si hay movimiento simultáneo de pedidos." },
            { q: "¿Qué pasa si reservo un producto y no hay stock?", a: "Un encargado te contactará para ofrecerte una alternativa similar, esperar la reposición, o cancelar la reserva sin cargo." },
            { q: "¿Puedo ver el stock de cada variante de tamaño?", a: "Sí. Al abrir un producto y seleccionar un tamaño, verás el stock disponible para esa variante específica." },
        ],
    },
    {
        categoria: "Retiro y envío",
        icono: <FiTruck size={18} />,
        preguntas: [
            { q: "¿Puedo retirar mi pedido en el vivero?", a: "Sí. Una vez confirmada tu reserva, te avisaremos que el pedido está listo para retirar en el local." },
            { q: "¿Hacen envíos a domicilio?", a: "Sí. El costo y tiempo de entrega dependen de la zona. Un encargado coordinará los detalles una vez confirmada la reserva." },
            { q: "¿Cuáles son los horarios de retiro?", a: "Podés retirar en nuestro horario de atención habitual. Te confirmaremos el detalle cuando tu reserva esté lista." },
            { q: "¿Cómo me avisan que el pedido está listo?", a: "Te llegará un mail. También podés consultar el estado desde 'Mis reservas' en tu perfil." },
        ],
    },
    {
        categoria: "Pagos",
        icono: <FiCreditCard size={18} />,
        preguntas: [
            { q: "¿Cuándo se realiza el pago?", a: "El pago se coordina al momento del retiro o la entrega, no al hacer la reserva online." },
            { q: "¿Qué medios de pago aceptan?", a: "Aceptamos efectivo, tarjetas de débito y crédito, transferencia bancaria y Mercado Pago." },
            { q: "¿Los precios incluyen IVA?", a: "Sí, todos los precios publicados incluyen IVA y están expresados en pesos argentinos." },
        ],
    },
    {
        categoria: "Mi cuenta",
        icono: <FiUser size={18} />,
        preguntas: [
            { q: "¿Necesito una cuenta para reservar?", a: "Sí. Necesitás estar registrado e iniciar sesión. Registrarte es rápido y gratuito." },
            { q: "¿Dónde veo el historial de mis reservas?", a: "En 'Mis reservas' de tu perfil podés ver todas tus reservas, sus estados y el detalle de cada una." },
            { q: "¿Puedo actualizar mis datos personales?", a: "Sí, desde 'Mi perfil' podés editar tu información en cualquier momento." },
        ],
    },
];

const tipsData = [
    {
        id: 1, numero: "01", titulo: "Riego adecuado",
        bajada: "Menos es más: entender los ciclos de la planta evita el error más común.",
        info: "La mayoría de las plantas de interior prefieren ciclos de riego: mojar bien y dejar secar parcialmente. El riego frecuente con poca agua compacta el sustrato y pudre raíces.",
        recomendaciones: ["Probá la tierra a 2–3 cm de profundidad antes de regar.", "Regá hasta que escurra por abajo y descartá el excedente del plato.", "En invierno reducí la frecuencia: la evaporación baja notablemente."],
        imagen: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=900&q=80",
        icono: <FiDroplet size={20} />,
    },
    {
        id: 2, numero: "02", titulo: "Luz natural",
        bajada: "El combustible invisible que determina si tu planta crece o solo sobrevive.",
        info: "La luz es esencial. Tallos largos, hojas pequeñas o inclinación marcada suelen ser señales de falta de luz. El sol directo fuerte puede quemar bordes y decolorar hojas.",
        recomendaciones: ["Ubicá cerca de una ventana con luz filtrada.", "Si hay sol directo, que sea suave: temprano o al final de la tarde.", "Observá 7–10 días para ver cómo reacciona la planta al nuevo lugar."],
        imagen: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80",
        icono: <FiSun size={20} />,
    },
    {
        id: 3, numero: "03", titulo: "Sustrato aireado",
        bajada: "La tierra correcta hace la diferencia entre una raíz sana y una podrida.",
        info: "Un sustrato aireado mejora el oxígeno en raíces y reduce hongos. Si el agua tarda mucho en drenar o la maceta queda pesada días después, el sustrato está muy compacto.",
        recomendaciones: ["Sumá perlita, corteza o piedra pómez a tu mezcla base.", "Evitá tierra de jardín para interior: se compacta con facilidad.", "Renová sustrato si está apelmazado o con mal olor."],
        imagen: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=900&q=80",
        icono: <FiFeather size={20} />,
    },
    {
        id: 4, numero: "04", titulo: "Control de plagas",
        bajada: "Detectar a tiempo es la diferencia entre un tratamiento leve y uno intensivo.",
        info: "Las plagas aparecen cuando hay estrés: poca luz, exceso de agua o aire seco. Detectarlas temprano evita el contagio a otras plantas y tratamientos más agresivos.",
        recomendaciones: ["Revisá el envés de las hojas cada semana.", "Aislá la planta ante cualquier signo sospechoso de inmediato.", "Limpieza suave con agua y paño puede resolver casos leves."],
        imagen: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=900&q=80",
        icono: <FiAlertTriangle size={20} />,
    },
    {
        id: 5, numero: "05", titulo: "Fertilización",
        bajada: "Un complemento, no un reemplazo: la dosis justa hace toda la diferencia.",
        info: "Fertilizar no reemplaza la luz. Concentraciones altas dejan sales acumuladas y estresan raíces, especialmente en macetas pequeñas. Menos y regular, siempre mejor.",
        recomendaciones: ["Aplicá en primavera y verano; pausá completamente en invierno.", "Usá dosis baja y regular en vez de aplicaciones fuertes esporádicas.", "Si ves puntas quemadas, suspendé y regá profundo para lavar sales."],
        imagen: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80",
        icono: <FiRefreshCw size={20} />,
    },
    {
        id: 6, numero: "06", titulo: "Ventilación",
        bajada: "El aire en movimiento fortalece tallos y previene enfermedades fúngicas.",
        info: "El aire circulante reduce la humedad estancada y baja el riesgo de hongos. También ayuda a que el sustrato se seque de forma pareja y evita olores en ambientes cerrados.",
        recomendaciones: ["Ventilá 10–15 minutos al día si el ambiente es muy cerrado.", "Evitá corrientes heladas directas: mejor brisa suave e indirecta.", "Si hay hongos, combiná ventilación con riego más espaciado."],
        imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80",
        icono: <FiWind size={20} />,
    },
];

const FaqItem = ({ pregunta, respuesta, isOpen, onToggle }) => (
    <div className={`gv-faq__item ${isOpen ? "is-open" : ""}`} onClick={onToggle}>
        <div className="gv-faq__question">
            <span>{pregunta}</span>
            <span className="gv-faq__icon">
                {isOpen ? <FiMinus size={15} /> : <FiPlus size={15} />}
            </span>
        </div>
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    className="gv-faq__answer-wrap"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.26, ease: "easeInOut" }}
                >
                    <p className="gv-faq__answer-text">{respuesta}</p>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const TipRow = ({ tip, index }) => {
    const [open, setOpen] = useState(false);
    const isEven = index % 2 === 0;

    return (
        <motion.div
            className="gv-tip__row"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <div className={`gv-tip__inner ${isEven ? "" : "gv-tip__inner--reverse"}`}>
                <div className="gv-tip__img-wrap">
                    <img src={tip.imagen} alt={tip.titulo} className="gv-tip__img" loading="lazy" />
                    <div className="gv-tip__img-overlay" />
                    <span className="gv-tip__numero">{tip.numero}</span>
                </div>

                <div className="gv-tip__content">
                    <div className="gv-tip__content-top">
                        <div className="gv-tip__icono">{tip.icono}</div>
                        <h3 className="gv-tip__titulo">{tip.titulo}</h3>
                        <p className="gv-tip__bajada">{tip.bajada}</p>
                    </div>

                    <div className={`gv-tip__detalle ${open ? "is-open" : ""}`}>
                        <p className="gv-tip__info">{tip.info}</p>
                        <ul className="gv-tip__list">
                            {tip.recomendaciones.map((r, i) => (
                                <li key={i}>{r}</li>
                            ))}
                        </ul>
                    </div>

                    <button
                        className={`gv-tip__toggle ${open ? "is-open" : ""}`}
                        onClick={() => setOpen(!open)}
                    >
                        <span>{open ? "Cerrar" : "Ver recomendaciones"}</span>
                        {open ? <FiMinus size={13} /> : <FiPlus size={13} />}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const GuiaVivero = () => {
    const [seccionActiva, setSeccionActiva] = useState("faq");
    const [catActiva, setCatActiva] = useState(0);
    const [openFaq, setOpenFaq] = useState(null);
    const [navSticky, setNavSticky] = useState(false);
    const navRef = useRef(null);

    useEffect(() => {
        const onScroll = () => {
            if (navRef.current) {
                setNavSticky(window.scrollY > navRef.current.offsetTop - 70);
            }
        };
        window.addEventListener("scroll", onScroll);

        const faqEl = document.getElementById("faq");
        const tipsEl = document.getElementById("tips");
        if (!faqEl || !tipsEl) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setSeccionActiva(entry.target.id);
                    }
                });
            },
            { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
        );

        observer.observe(faqEl);
        observer.observe(tipsEl);

        return () => {
            window.removeEventListener("scroll", onScroll);
            observer.disconnect();
        };
    }, []);

    const scrollTo = (id) => {
        setSeccionActiva(id);
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 64 - 48;
        window.scrollTo({ top, behavior: "smooth" });
    };

    return (
        <div className="gv">

            <div className="gv__hero">
                <div className="gv__hero-texture" />
                <Container>
                    <motion.div
                        className="gv__hero-content"
                        initial={{ opacity: 0, y: 35 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.75, ease: "easeOut" }}
                    >
                        <h1 className="gv__hero-title">
                            Guía<br /><em>del vivero</em>
                        </h1>
                        <p className="gv__hero-sub">
                            Todo lo que necesitás saber para reservar, cuidar tus plantas y sacarle el máximo provecho a nuestra tienda.
                        </p>
                    </motion.div>
                </Container>
            </div>

            <div ref={navRef} className={`gv__nav ${navSticky ? "is-sticky" : ""}`}>
                <Container>
                    <div className="gv__nav-inner">
                        <button
                            className={`gv__nav-btn ${seccionActiva === "faq" ? "is-active" : ""}`}
                            onClick={() => scrollTo("faq")}
                        >
                            <FiShoppingBag size={15} />
                            Preguntas frecuentes
                        </button>
                        <button
                            className={`gv__nav-btn ${seccionActiva === "tips" ? "is-active" : ""}`}
                            onClick={() => scrollTo("tips")}
                        >
                            <FiDroplet size={15} />
                            Tips y cuidados
                        </button>
                    </div>
                </Container>
            </div>

            <section id="faq" className="gv__section gv__section--faq">
                <Container>
                    <div className="gv__section-head">
                        <motion.span className="gv__eyebrow" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                            Resolvé tus dudas
                        </motion.span>
                        <motion.h2 className="gv__section-title" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                            Preguntas frecuentes
                        </motion.h2>
                        <motion.p className="gv__section-sub" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                            Las consultas más comunes sobre reservas, productos y envíos, respondidas de forma clara.
                        </motion.p>
                    </div>

                    <Row>
                        <Col lg={3} className="mb-4 mb-lg-0">
                            <div className="gv__faq-cats">
                                {faqData.map((cat, i) => (
                                    <button
                                        key={i}
                                        className={`gv__faq-cat ${catActiva === i ? "is-active" : ""}`}
                                        onClick={() => { setCatActiva(i); setOpenFaq(null); }}
                                    >
                                        <span className="gv__faq-cat-icon">{cat.icono}</span>
                                        <span className="gv__faq-cat-label">{cat.categoria}</span>
                                    </button>
                                ))}
                            </div>
                        </Col>

                        <Col lg={9}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={catActiva}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.22 }}
                                >
                                    <h3 className="gv__faq-cat-titulo">{faqData[catActiva].categoria}</h3>
                                    <div className="gv__faq-list">
                                        {faqData[catActiva].preguntas.map((item, i) => (
                                            <FaqItem
                                                key={i}
                                                pregunta={item.q}
                                                respuesta={item.a}
                                                isOpen={openFaq === i}
                                                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </Col>
                    </Row>
                </Container>
            </section>

            <section id="tips" className="gv__section gv__section--tips">
                <Container>
                    <div className="gv__section-head">
                        <motion.span className="gv__eyebrow" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                            Cuidado vegetal
                        </motion.span>
                        <motion.h2 className="gv__section-title" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                            Tips y cuidados
                        </motion.h2>
                        <motion.p className="gv__section-sub" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                            Consejos concretos para que tus plantas vivan más y mejor.
                        </motion.p>
                    </div>

                    <div className="gv__tips-list">
                        {tipsData.map((tip, i) => (
                            <TipRow key={tip.id} tip={tip} index={i} />
                        ))}
                    </div>
                </Container>
            </section>
            <Visitanos />
        </div>
    );
};

export default GuiaVivero;