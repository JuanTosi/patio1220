// Helper para obtener el precio a mostrar
export const getPrecioMostrar = (producto) => {
  if (!producto || !producto.tamanios || producto.tamanios.length === 0) {
    return null;
  }

  const tamaniosActivos = producto.tamanios.filter((t) => t.activo);

  if (tamaniosActivos.length === 0) return null;

  if (tamaniosActivos.length === 1) {
    const precio = parseFloat(tamaniosActivos[0].precio);
    return isNaN(precio) || precio <= 0 ? null : precio;
  }

  const precios = tamaniosActivos
    .map((t) => parseFloat(t.precio))
    .filter((p) => !isNaN(p) && p > 0);

  if (precios.length === 0) return null;

  const min = Math.min(...precios);
  const max = Math.max(...precios);

  if (min === max) return min;

  return {
    min,
    max,
    texto: `$${min.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / $${max.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  };
};

export const renderPrecio = (precio) => {
  if (precio === null || precio === undefined) return "N/A";

  if (typeof precio === "number") {
    return `$${precio.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  if (precio && precio.texto) {
    return precio.texto;
  }

  return "N/A";
};

export const getStockMostrar = (producto) => {
  if (!producto || !producto.tamanios || producto.tamanios.length === 0) {
    return 0;
  }

  return producto.tamanios
    .filter((t) => t.activo)
    .reduce((sum, t) => sum + (parseInt(t.stock) || 0), 0);
};

export const tieneTamaniosActivos = (producto) => {
  if (!producto || !producto.tamanios || producto.tamanios.length === 0) {
    return false;
  }
  return producto.tamanios.some((t) => t.activo);
};

export const getAlertaStock = (tamanios) => {
  const activos = tamanios?.filter((t) => Number(t.activo) === 1) ?? [];
  const stocks = activos.map((t) => Number(t.stock));
  if (stocks.some((s) => s <= 3)) return "critico";
  if (stocks.some((s) => s <= 9)) return "bajo";
  return null;
};