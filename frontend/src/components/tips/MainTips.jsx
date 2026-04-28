import { useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "../../styles/pages/tips.css";

const MainTips = () => {
  const [openId, setOpenId] = useState(null);

  const tips = [
    {
      id: 1,
      titulo: "Riego adecuado",
      texto:
        "Evitá regar en exceso: tocá la tierra antes de hacerlo. Si está húmeda, esperá un poco más.",
      detalle: "Regar de más puede pudrir las raíces y dañar las hojas.",
      info:
        "La mayoría de las plantas de interior prefieren ciclos de riego: mojar bien y dejar secar parcialmente. El riego frecuente con poca agua suele empeorar el drenaje y compactar el sustrato.",
      recomendaciones: [
        "Probá la tierra a 2–3 cm de profundidad, no solo la superficie.",
        "Regá hasta que escurra por abajo y descartá el excedente del plato.",
        "En invierno, reducí frecuencia: la evaporación baja.",
      ],
      imagen:
        "https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      titulo: "Luz natural",
      texto:
        "Colocá tus plantas en lugares bien iluminados, pero evitá el sol directo en horas intensas.",
      detalle:
        "Un buen balance de luz mejora el crecimiento y color del follaje.",
      info:
        "La luz es el “combustible” de la planta. Si notas tallos largos, hojas pequeñas o inclinación marcada, suele ser falta de luz. El sol directo fuerte puede quemar bordes y decolorar hojas.",
      recomendaciones: [
        "Ubicá cerca de una ventana con luz filtrada (cortina fina).",
        "Si hay sol directo, que sea suave: temprano o al final de la tarde.",
        "Observá 7–10 días: la planta te “dice” si está cómoda.",
      ],
      imagen:
        "https://images.unsplash.com/photo-1760633331239-fd32e3244ab5?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      titulo: "Sustrato aireado",
      texto:
        "Usá tierra liviana y con buen drenaje. Una mezcla con perlita o corteza es ideal.",
      detalle:
        "El sustrato correcto permite que el agua circule sin encharcar.",
      info:
        "Un sustrato aireado mejora el oxígeno en raíces y reduce hongos. Si el agua tarda mucho en drenar o la maceta queda pesada días, probablemente el sustrato está muy compacto.",
      recomendaciones: [
        "Sumá material estructural: perlita, corteza o piedra pómez.",
        "Evitá tierra de jardín para interior: se compacta fácil.",
        "Renová sustrato si está “apelmazado” o con mal olor.",
      ],
      imagen:
        "https://images.unsplash.com/photo-1693414854278-6b3703411629?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      titulo: "Cuidados generales",
      texto:
        "Retirá hojas secas y limpialas con un paño húmedo para que respiren mejor.",
      detalle:
        "Pequeños cuidados hacen una gran diferencia a largo plazo.",
      info:
        "El polvo reduce la captación de luz. La limpieza periódica también ayuda a detectar plagas temprano. Podar lo seco evita que la planta gaste energía en tejido dañado.",
      recomendaciones: [
        "Limpiá hojas cada 2–3 semanas con paño apenas húmedo.",
        "Retirá hojas amarillas desde la base (sin desgarrar tallos).",
        "Revisá el envés: ahí aparecen primero varios insectos.",
      ],
      imagen:
        "https://plus.unsplash.com/premium_photo-1677756271467-e4394aeb315c?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 5,
      titulo: "Macetas con drenaje",
      texto:
        "Asegurate de que tus macetas tengan agujeros en la base para evitar acumulación de agua.",
      detalle:
        "Un buen drenaje previene enfermedades y raíces débiles.",
      info:
        "Sin drenaje, el agua queda estancada y baja el oxígeno en raíces. Incluso si regás poco, el problema es que el excedente no tiene salida y el sustrato se mantiene saturado.",
      recomendaciones: [
        "Si usás maceta decorativa, poné una interior con drenaje.",
        "No dejes agua en el plato más de 10–15 minutos.",
        "Elegí sustrato y maceta como un combo: ambos importan.",
      ],
      imagen:
        "https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 6,
      titulo: "Rotación de plantas",
      texto:
        "Girarlas cada cierto tiempo ayuda a que crezcan de manera uniforme hacia la luz.",
      detalle:
        "La rotación evita que se inclinen demasiado hacia un lado.",
      info:
        "La mayoría de las plantas se orientan hacia la fuente de luz. Rotar reduce deformaciones y también ayuda a que el crecimiento sea más parejo, especialmente en plantas de follaje.",
      recomendaciones: [
        "Girálas un cuarto de vuelta cada 7–14 días.",
        "Evita moverlas de lugar constantemente: pequeños ajustes bastan.",
        "Si la planta está débil, priorizá luz estable antes de rotar.",
      ],
      imagen:
        "https://images.unsplash.com/photo-1760633331239-fd32e3244ab5?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 7,
      titulo: "Fertilización moderada",
      texto:
        "Aplicá fertilizante en temporadas de crecimiento y respetá dosis recomendadas.",
      detalle:
        "Un exceso de fertilizante puede quemar raíces.",
      info:
        "Fertilizar no reemplaza la luz: es un complemento. Menos es más. Concentraciones altas dejan sales acumuladas y estresan raíces, sobre todo en macetas pequeñas.",
      recomendaciones: [
        "Aplicá en primavera/verano y bajá o pausá en invierno.",
        "Usá dosis baja y regular en vez de “golpes” fuertes.",
        "Si ves puntas quemadas, suspendé y regá profundo para lavar sales.",
      ],
      imagen:
        "https://images.unsplash.com/photo-1693414854278-6b3703411629?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 8,
      titulo: "Control de plagas",
      texto:
        "Revisá hojas y tallos para detectar insectos o manchas sospechosas.",
      detalle:
        "Actuar a tiempo evita que el problema se expanda.",
      info:
        "Las plagas suelen aparecer cuando hay estrés (poca luz, exceso de agua, aire muy seco). Detectarlas temprano evita tratamientos intensos y reduce contagio a otras plantas.",
      recomendaciones: [
        "Aislá la planta si ves signos sospechosos.",
        "Limpieza suave con agua y paño puede ayudar en casos leves.",
        "Revisá cada 3–4 días hasta estar seguro de que se resolvió.",
      ],
      imagen:
        "https://plus.unsplash.com/premium_photo-1677756271467-e4394aeb315c?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 9,
      titulo: "Ambiente ventilado",
      texto:
        "Mantené buena circulación de aire para prevenir hongos y enfermedades.",
      detalle:
        "La ventilación fortalece la salud general de la planta.",
      info:
        "El aire en movimiento reduce humedad estancada y baja el riesgo de hongos. También ayuda a que el sustrato se seque de forma más pareja y evita olores.",
      recomendaciones: [
        "Ventilá 10–15 minutos al día si el ambiente es cerrado.",
        "Evitá corrientes heladas directas: mejor brisa suave.",
        "Si hay hongos, combiná ventilación con riego más espaciado.",
      ],
      imagen:
        "https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 10,
      titulo: "Trasplante oportuno",
      texto:
        "Si las raíces ocupan toda la maceta, es momento de pasar a una más grande.",
      detalle:
        "Trasplantar permite que la planta continúe creciendo con fuerza.",
      info:
        "Trasplantar da espacio y renueva sustrato. Señales comunes: raíces por abajo, riego que se escurre rápido, crecimiento lento y sustrato que se seca en pocas horas.",
      recomendaciones: [
        "Subí solo un tamaño de maceta para evitar exceso de humedad.",
        "Trasplantá en época de crecimiento, si podés.",
        "Después del trasplante, regá y dejá 7–10 días sin fertilizar.",
      ],
      imagen:
        "https://images.unsplash.com/photo-1760633331239-fd32e3244ab5?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="tipsPro py-5">
      <Container>
        <Row className="g-4">
          {tips.map((tip) => {
            const isOpen = openId === tip.id;

            return (
              <Col key={tip.id} xs={12} lg={6}>
                <Card className="tipsPro__card border-0 shadow-sm">
                  <div
                    className="tipsPro__media"
                    style={{ backgroundImage: `url(${tip.imagen})` }}
                    role="img"
                    aria-label={tip.titulo}
                  >
                    <div className="tipsPro__shade" />

                    <h3 className="tipsPro__titleFixed">
                      {tip.titulo}
                    </h3>

                    <div
                      className={`tipsPro__panel ${isOpen ? "is-open" : ""
                        }`}
                    >
                      <div className="tipsPro__panelBody">
                        <div className="tipsPro__panelInfo">
                          <p className="tipsPro__panelInfoText">
                            {tip.info}
                          </p>
                        </div>

                        <div className="tipsPro__panelInfo">
                          <div className="tipsPro__panelLabel">
                            Recomendaciones:
                          </div>

                          <ul className="tipsPro__panelList">
                            {tip.recomendaciones.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="tipsPro__toggleFixed"
                      onClick={() => toggle(tip.id)}
                      aria-expanded={isOpen}
                    >
                      {isOpen ? "Ocultar" : "Ver info"}
                    </button>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </section>
  );
};

export default MainTips;
