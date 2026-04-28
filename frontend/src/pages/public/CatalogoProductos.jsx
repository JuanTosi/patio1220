import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useProductosStore } from "../../store/productosStore.js";
import "../../styles/components/producto-card.css";
import Aside from "../../components/layout/Aside.jsx";
import ProductosList from "../../components/productos/ProductosList.jsx";
import Paginador from "../../components/common/Paginador.jsx";

const CatalogoProductos = () => {
  const { productos, fetchProductos } = useProductosStore();

  const [paginaActual, setPaginaActual] = useState(1);
  const [filtros, setFiltros] = useState({
    busqueda: "",
    categoria: "",
    orden: "",
    soloDisponibles: false,
  });

  const location = useLocation();
  const productosPorPagina = 12;

  const getStockTotal = (prod) => {
    if (Array.isArray(prod.tamanios) && prod.tamanios.length > 0) {
      return prod.tamanios
        .filter((t) => Number(t.activo) === 1)
        .reduce((acc, t) => acc + Number(t.stock || 0), 0);
    }
    return Number(prod.stock || 0);
  };

  const getPrecioBaseOrden = (prod) => {
    if (Array.isArray(prod.tamanios) && prod.tamanios.length > 0) {
      const precios = prod.tamanios
        .filter((t) => Number(t.activo) === 1)
        .map((t) => Number(t.precio))
        .filter((p) => !isNaN(p) && p > 0);

      if (precios.length > 0) return Math.min(...precios);
    }

    return Number(prod.stock) || 0;
  };

  const productosFiltrados = useMemo(() => {
    return productos.filter((prod) => {
      const activo = prod.activo === 1 || prod.activo === true;

      const coincideBusqueda = filtros.busqueda
        ? prod.nombreProducto
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(
            filtros.busqueda
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, ""),
          )
        : true;

      const coincideCategoria = filtros.categoria
        ? String(prod.idCategoria) === filtros.categoria
        : true;

      const coincideDisponibilidad = filtros.soloDisponibles
        ? getStockTotal(prod) > 0
        : true;

      return (
        activo &&
        coincideBusqueda &&
        coincideCategoria &&
        coincideDisponibilidad
      );
    });
  }, [productos, filtros]);

  const productosOrdenados = useMemo(() => {
    const arr = [...productosFiltrados];

    if (filtros.orden === "az") {
      arr.sort((a, b) => a.nombreProducto.localeCompare(b.nombreProducto));
    } else if (filtros.orden === "precioAsc") {
      arr.sort((a, b) => getPrecioBaseOrden(a) - getPrecioBaseOrden(b));
    } else if (filtros.orden === "precioDesc") {
      arr.sort((a, b) => getPrecioBaseOrden(b) - getPrecioBaseOrden(a));
    }

    return arr;
  }, [productosFiltrados, filtros.orden]);

  const indiceUltimo = paginaActual * productosPorPagina;
  const indicePrimero = indiceUltimo - productosPorPagina;
  const totalPaginas = Math.ceil(
    productosOrdenados.length / productosPorPagina,
  );
  const productosVisibles = productosOrdenados.slice(
    indicePrimero,
    indiceUltimo,
  );

  useEffect(() => {
    fetchProductos();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (location.state?.categoria) {
      setFiltros((prev) => ({ ...prev, categoria: location.state.categoria }));
      setPaginaActual(1);
    }
  }, [location.state]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="productos-layout">
      <Aside
        filtros={filtros}
        setFiltros={setFiltros}
        productos={productos}
        setPaginaActual={setPaginaActual}
        totalResultados={productosOrdenados.length}
        cargando={productos.length === 0}
      />

      <div className="productos-main">
        {productosVisibles.length > 0 ? (
          <ProductosList productos={productosVisibles} />
        ) : (
          <div className="no-resultados">
            <h5>No se encontraron resultados para tu búsqueda</h5>
            <p>Intentá ajustar tu búsqueda usando los filtros</p>
          </div>
        )}

        <Paginador
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onChangePagina={setPaginaActual}
        />
      </div>
    </div>
  );
};

export default CatalogoProductos;
