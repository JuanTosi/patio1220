import jsPDF from "jspdf";

export const generarComprobantePDF = (idReserva, productos, total, tipoEntrega, metodoPago, user) => {
    const doc = new jsPDF();

    const PAGE_WIDTH   = 210;
    const PAGE_HEIGHT  = 297;
    const MARGIN       = 14;
    const CONTENT_W    = PAGE_WIDTH - MARGIN * 2;

    const COL = {
        producto:    MARGIN,
        cantidad:    MARGIN + 87,
        precio:      MARGIN + 112,
        subtotal:    PAGE_WIDTH - MARGIN,
    };

    const VERDE       = [40, 167, 69];
    const GRIS_OSCURO = [51, 51, 51];
    const GRIS_TEXTO  = [80, 80, 80];
    const GRIS_LINEA  = [220, 220, 220];
    const BLANCO      = [255, 255, 255];

    const nuevaPagina = () => {
        doc.addPage();

        doc.setFillColor(...VERDE);
        doc.rect(0, 0, PAGE_WIDTH, 14, "F");

        doc.setTextColor(...BLANCO);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Patio 1220", MARGIN, 9);
        doc.text(`Reserva #${idReserva} — continuación`, PAGE_WIDTH - MARGIN, 9, { align: "right" });

        return 24;
    };

    const checkPagina = (y, alturaNecesaria = 10) => {
        if (y + alturaNecesaria > PAGE_HEIGHT - 20) {
            return nuevaPagina();
        }
        return y;
    };

    doc.setFillColor(...VERDE);
    doc.rect(0, 0, PAGE_WIDTH, 28, "F");

    doc.setTextColor(...BLANCO);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Patio 1220", MARGIN, 13);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Comprobante de Reserva", MARGIN, 22);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(`#${idReserva}`, PAGE_WIDTH - MARGIN, 18, { align: "right" });

    let y = 40;

    doc.setTextColor(...GRIS_OSCURO);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Datos de la reserva", MARGIN, y);

    y += 8;
    doc.setDrawColor(...GRIS_LINEA);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 7;

    const fechaHoy = new Date().toLocaleDateString("es-AR", {
        day:    "2-digit",
        month:  "2-digit",
        year:   "numeric",
        hour:   "2-digit",
        minute: "2-digit",
    });

    const entregaTexto = tipoEntrega === "retiro_local" ? "Retiro en local" : "Envío a domicilio";

    const imprimirFila = (label, valor) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...GRIS_OSCURO);
        doc.text(`${label}:`, MARGIN, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GRIS_TEXTO);
        doc.text(String(valor), 70, y);

        y += 7;
    };

    imprimirFila("Cliente",          `${user.nombre} ${user.apellido}`);
    imprimirFila("Email",            user.email);
    imprimirFila("Fecha de reserva", fechaHoy);
    imprimirFila("Tipo de entrega",  entregaTexto);
    imprimirFila("Método de pago",   metodoPago);
    
    y += 6;
    y = checkPagina(y, 30);

    doc.setTextColor(...GRIS_OSCURO);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Detalle de productos", MARGIN, y);

    y += 6;
    doc.setDrawColor(...GRIS_LINEA);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 6;

    const HEADER_H = 8;
    doc.setFillColor(245, 245, 245);
    doc.rect(MARGIN, y - 4, CONTENT_W, HEADER_H, "F");

    doc.setFontSize(9);
    doc.setTextColor(...GRIS_OSCURO);
    doc.setFont("helvetica", "bold");
    doc.text("Producto",     COL.producto + 2, y + 1);
    doc.text("Cant.",        COL.cantidad,     y + 1);
    doc.text("Precio unit.", COL.precio,       y + 1);
    doc.text("Subtotal",     COL.subtotal,     y + 1, { align: "right" });

    y += HEADER_H + 2;

    const FILA_H = 9;

    productos.forEach((item, index) => {
        y = checkPagina(y, FILA_H + 35);

        if (index % 2 === 0) {
            doc.setFillColor(252, 252, 252);
            doc.rect(MARGIN, y - 5, CONTENT_W, FILA_H, "F");
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...GRIS_TEXTO);

        const nombreCompleto = item.nombreTamanio && item.nombreTamanio
            ? `${item.nombreProducto} (${item.dimension})`
            : item.dimension;

        const nombreRecortado = doc.splitTextToSize(nombreCompleto, 83);
        doc.text(nombreRecortado[0], COL.producto + 2, y);
        doc.text(
            String(item.cantidad),
            COL.cantidad + 8,
            y
        );

        doc.text(
            `$${Number(item.precioUnitario).toFixed(2)}`,
            COL.precio + 38,
            y,
            { align: "right" }
        );

        const subtotal = item.subtotal ?? item.precioUnitario * item.cantidad;
        doc.text(
            `$${Number(subtotal).toFixed(2)}`,
            COL.subtotal,
            y,
            { align: "right" }
        );

        y += FILA_H;

        doc.setDrawColor(240, 240, 240);
        doc.line(MARGIN, y - 2, PAGE_WIDTH - MARGIN, y - 2);
    });

    y = checkPagina(y, 24);

    y += 4;
    doc.setDrawColor(...GRIS_LINEA);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 8;

    doc.setFillColor(...VERDE);
    doc.rect(125, y - 6, PAGE_WIDTH - MARGIN - 125, 11, "F");
    doc.setTextColor(...BLANCO);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("TOTAL:",                              129, y + 1);
    doc.text(`$${Number(total).toFixed(2)}`, COL.subtotal, y + 1, { align: "right" });

    y += 20;
    y = checkPagina(y, 16);

    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text("Este comprobante es válido como constancia de reserva.", MARGIN, y);
    doc.text("El pago se realizará en el momento del retiro o entrega.", MARGIN, y + 5);
    doc.save(`comprobante-reserva-${idReserva}.pdf`);
};