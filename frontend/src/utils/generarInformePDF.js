import jsPDF from "jspdf";

const VERDE       = [26, 107, 60];
const GRIS_OSCURO = [45, 52, 54];
const GRIS_TEXTO  = [80, 80, 80];
const GRIS_LINEA  = [220, 220, 220];
const BLANCO      = [255, 255, 255];
const GRIS_FONDO  = [245, 247, 245];

const PAGE_WIDTH  = 210;
const PAGE_HEIGHT = 297;
const MARGIN      = 14;
const CONTENT_W   = PAGE_WIDTH - MARGIN * 2;

const formatPesos = (n) =>
  Number(n).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  });

const formatFecha = (fechaStr) => {
  const d = new Date(fechaStr + "T00:00:00");
  return d.toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
};

export const generarInformePDF = (datos, analisisIA = "", soloIA = false) => {
  const doc = new jsPDF();
  let y = 0;

  const nuevaPagina = () => {
    doc.addPage();
    doc.setFillColor(...VERDE);
    doc.rect(0, 0, PAGE_WIDTH, 14, "F");
    doc.setTextColor(...BLANCO);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Patio 1220 — Informe de período", MARGIN, 9);
    doc.text(
      `${formatFecha(datos.periodo.desde)} — ${formatFecha(datos.periodo.hasta)}`,
      PAGE_WIDTH - MARGIN, 9, { align: "right" }
    );
    return 24;
  };

  const checkPagina = (yActual, alturaNecesaria = 12) => {
    if (yActual + alturaNecesaria > PAGE_HEIGHT - 20) {
      return nuevaPagina();
    }
    return yActual;
  };

  const seccionTitulo = (titulo) => {
    y = checkPagina(y, 20);
    y += 4;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...VERDE);
    doc.text(titulo, MARGIN, y);
    y += 3;
    doc.setDrawColor(...VERDE);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    doc.setLineWidth(0.2);
    y += 7;
  };

  const filaDoble = (labelIzq, valorIzq, labelDer, valorDer, negrita = false) => {
    const colIzq = MARGIN + 6;
    const colDer = PAGE_WIDTH / 2 + 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GRIS_OSCURO);
    doc.text(`${labelIzq}:`, colIzq, y);
    doc.text(`${labelDer}:`, colDer, y);
    doc.setFont("helvetica", negrita ? "bold" : "normal");
    doc.setTextColor(...(negrita ? VERDE : GRIS_TEXTO));
    doc.text(String(valorIzq), colIzq + 52, y);
    doc.text(String(valorDer), colDer + 52, y);
    y += 8;
  };

  doc.setFillColor(...VERDE);
  doc.rect(0, 0, PAGE_WIDTH, 36, "F");

  doc.setTextColor(...BLANCO);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Patio 1220", MARGIN, 14);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(
    soloIA ? "Análisis ejecutivo — Asistente IA" : "Informe de gestión — período seleccionado",
    MARGIN, 23
  );

  doc.setFontSize(10);
  doc.text(
    `${formatFecha(datos.periodo.desde)} al ${formatFecha(datos.periodo.hasta)}`,
    MARGIN, 31
  );

  const fechaGeneracion = new Date().toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  doc.text(`Generado: ${fechaGeneracion}`, PAGE_WIDTH - MARGIN, 31, { align: "right" });

  y = 48;

  if (!soloIA) {

    seccionTitulo("Resumen financiero");

    const rf = datos.resumenFinanciero;

    doc.setFillColor(...GRIS_FONDO);
    doc.setDrawColor(...GRIS_LINEA);
    doc.roundedRect(MARGIN, y - 4, CONTENT_W, 52, 4, 4, "FD");

    filaDoble("Total de reservas",   rf.cantidadReservas,           "Reservas canceladas", rf.cantidadCanceladas);
    filaDoble("Total facturado",     formatPesos(rf.totalFacturado), "Total esperado",      formatPesos(rf.totalEsperado), true);
    filaDoble("Total cobrado",       formatPesos(rf.totalPagado),    "Pendiente de cobro",  formatPesos(rf.totalSinPagar));
    filaDoble("Tasa de cancelación", `${rf.tasaCancelacion}%`,       "Total general",       formatPesos(rf.totalGeneral), true);

    y += 8;

    seccionTitulo("Desglose por estado de reserva");

    doc.setFillColor(230, 240, 232);
    doc.rect(MARGIN, y - 5, CONTENT_W, 9, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GRIS_OSCURO);
    doc.text("Estado",   MARGIN + 3,              y + 1);
    doc.text("Cantidad", MARGIN + 90,             y + 1, { align: "right" });
    doc.text("Monto",    PAGE_WIDTH - MARGIN - 3, y + 1, { align: "right" });
    y += 10;

    datos.porEstado.forEach((estado, i) => {
      y = checkPagina(y, 9);
      if (i % 2 === 0) {
        doc.setFillColor(252, 252, 252);
        doc.rect(MARGIN, y - 5, CONTENT_W, 8, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...GRIS_TEXTO);
      doc.text(estado.nombreEstado,         MARGIN + 3,              y);
      doc.text(String(estado.cantidad),     MARGIN + 90,             y, { align: "right" });
      doc.text(formatPesos(estado.monto),   PAGE_WIDTH - MARGIN - 3, y, { align: "right" });
      y += 8;
    });

    y += 4;

    seccionTitulo("Productos más solicitados en el período");

    if (datos.productosDestacados.length === 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...GRIS_TEXTO);
      doc.text("No hay productos en el período seleccionado.", MARGIN, y);
      y += 10;
    } else {
      doc.setFillColor(230, 240, 232);
      doc.rect(MARGIN, y - 5, CONTENT_W, 9, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GRIS_OSCURO);
      doc.text("#",           MARGIN + 3,              y + 1);
      doc.text("Producto",    MARGIN + 12,             y + 1);
      doc.text("Unidades",    MARGIN + 120,            y + 1, { align: "right" });
      doc.text("Monto total", PAGE_WIDTH - MARGIN - 3, y + 1, { align: "right" });
      y += 10;

      datos.productosDestacados.forEach((prod, i) => {
        y = checkPagina(y, 9);
        if (i % 2 === 0) {
          doc.setFillColor(252, 252, 252);
          doc.rect(MARGIN, y - 5, CONTENT_W, 8, "F");
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...GRIS_TEXTO);
        const pos = i === 0 ? "1°" : i === 1 ? "2°" : i === 2 ? "3°" : `${i + 1}°`;
        doc.text(pos, MARGIN + 3, y);
        const nombreRecortado = doc.splitTextToSize(prod.nombreProducto, 100);
        doc.text(nombreRecortado[0], MARGIN + 12, y);
        doc.text(`${prod.cantidadVendida} u.`, MARGIN + 120,            y, { align: "right" });
        doc.text(formatPesos(prod.montoTotal),  PAGE_WIDTH - MARGIN - 3, y, { align: "right" });
        y += 8;
      });
    }

    y += 4;

    if (datos.evolucionSemanal.length > 0) {
      seccionTitulo("Evolución de reservas por semana");

      doc.setFillColor(230, 240, 232);
      doc.rect(MARGIN, y - 5, CONTENT_W, 9, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GRIS_OSCURO);
      doc.text("Semana",   MARGIN + 3,              y + 1);
      doc.text("Reservas", MARGIN + 90,             y + 1, { align: "right" });
      doc.text("Monto",    PAGE_WIDTH - MARGIN - 3, y + 1, { align: "right" });
      y += 10;

      datos.evolucionSemanal.forEach((sem, i) => {
        y = checkPagina(y, 9);
        if (i % 2 === 0) {
          doc.setFillColor(252, 252, 252);
          doc.rect(MARGIN, y - 5, CONTENT_W, 8, "F");
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...GRIS_TEXTO);
        doc.text(`Semana del ${sem.semana}`, MARGIN + 3,              y);
        doc.text(String(sem.cantidad),       MARGIN + 90,             y, { align: "right" });
        doc.text(formatPesos(sem.monto),     PAGE_WIDTH - MARGIN - 3, y, { align: "right" });
        y += 8;
      });

      y += 4;
    }
  }

  if (analisisIA) {
    seccionTitulo("Análisis ejecutivo — Asistente IA");

    const parrafos = analisisIA.split(/\n\n+/);

    parrafos.forEach((parrafo) => {
      const texto = parrafo.trim();
      if (!texto) return;

      const esTitulo = /^[A-ZÁÉÍÓÚ\s]+:/.test(texto) && texto.length < 60;

      if (esTitulo) {
        y = checkPagina(y, 10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...VERDE);
        doc.text(texto, MARGIN, y);
        y += 7;
      } else {
        const lineas = doc.splitTextToSize(texto, CONTENT_W - 4);
        lineas.forEach((linea) => {
          y = checkPagina(y, 7);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(...GRIS_TEXTO);
          doc.text(linea, MARGIN, y);
          y += 6;
        });
        y += 3;
      }
    });

    y += 4;
  }

  y = checkPagina(y, 20);
  y += 8;
  doc.setDrawColor(...GRIS_LINEA);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 6;

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Este informe fue generado automáticamente por el sistema de gestión de Patio 1220.",
    MARGIN, y
  );
  doc.text(
    "Los datos reflejan el período seleccionado al momento de la generación.",
    MARGIN, y + 5
  );

  const nombreArchivo = soloIA
    ? `analisis-ia-patio1220-${datos.periodo.desde}-${datos.periodo.hasta}.pdf`
    : `informe-patio1220-${datos.periodo.desde}-${datos.periodo.hasta}.pdf`;

  doc.save(nombreArchivo);
};