import { create } from "zustand";
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  toggleDestacadoProducto,
  toggleActivoProducto,
  moverProductoAPapelera,
  restaurarProductoDePapelera,
  getProductosPapelera,
} from "../api/productos.api.js";

export const useProductosStore = create((set, get) => ({
  productos: [],
  productoSeleccionado: null,
  isLoading: false,
  error: null,
  filtros: {
  texto: "",
  categoria: "todos",
  estado: "todos",
  sortKey: "idProducto",
  sortDir: "asc",
  },
  paginaActual: 1,
  productosPorPagina: 10,


  setPaginaActual: (pagina) => set({ paginaActual: pagina }),

  resetPaginacion: () => set({ paginaActual: 1 }),

  setFiltroTexto: (texto) =>
    set((state) => ({ filtros: { ...state.filtros, texto } })),

  setFiltroCategoria: (categoria) =>
    set((state) => ({ filtros: { ...state.filtros, categoria } })),

  setFiltroEstado: (estado) =>
    set((state) => ({ filtros: { ...state.filtros, estado } })),

  setOrden: (clave) =>
    set((state) => {
      const { sortKey, sortDir } = state.filtros;
        if (sortKey === clave) {
          return {
            filtros: {
              ...state.filtros,
              sortDir: sortDir === "asc" ? "desc" : "asc",
            },
          };
        }
      return {
        filtros: { ...state.filtros, sortKey: clave, sortDir: "asc" },
      };
    }
  ),

  resetFiltros: () =>
  set({
    filtros: {
      texto: "",
      categoria: "todos",
      estado: "todos",
      sortKey: "idProducto",
      sortDir: "asc",
    },
  }),

  clearProductoSeleccionado: () => set({productoSeleccionado: null}),

  fetchProductos: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await getProductos();
      set({ productos: data, isLoading: false });
    } catch (error) {
      console.error("Error al obtener productos:", error);
      set({
        error: "No se pudieron cargar los productos",
        isLoading: false,
      });
    }
  },

  addProducto: async (productoData) => {
    try {
      set({ isLoading: true, error: null });
      const nuevoProducto = await createProducto(productoData);
      const productosActuales = get().productos;
      set({
        productos: [...productosActuales, nuevoProducto],
        isLoading: false,
      });
    } catch (error) {
      console.error("Error al agregar el producto:", error);
      set({
        error: "No se pudo agregar el producto",
        isLoading: false,
      });
    }
  },

  updateProducto: async (idProducto, productoData) => {
    try {
      set({ isLoading: true, error: null });
      const productoActualizado = await updateProducto(idProducto, productoData);

      const productosActuales = get().productos;
      const productoValido =
        productoActualizado && productoActualizado.idProducto
          ? productoActualizado
          : { ...productoData, idProducto: Number(idProducto) };

      const productosActualizados = productosActuales.map((prod) =>
        Number(prod.idProducto) === Number(idProducto) ? productoValido : prod
      );

      set({ productos: productosActualizados, isLoading: false });
    } catch (error) {
      console.error("Error al editar el producto:", error);
      set({
        error: "No se pudo editar el producto",
        isLoading: false,
      });
    }
  },

  deleteProducto: async (idProducto) => {
    try {
      set({ isLoading: true, error: null });
      await deleteProducto(idProducto);

      set((state) => ({
        productos: state.productos.filter(
          (prod) => Number(prod.idProducto) !== Number(idProducto)
        ),
        isLoading: false,
      }));

      console.log(`🗑️ Producto ${idProducto} eliminado del store`);
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      set({
        error: "No se pudo eliminar el producto",
        isLoading: false,
      });
    }
  },

  moverAPapelera: async (idProducto) => {
  try {
    set({ isLoading: true, error: null });
    await moverProductoAPapelera(idProducto);
    set((state) => ({
      productos: state.productos.filter(
        (prod) => Number(prod.idProducto) !== Number(idProducto)
      ),
      isLoading: false,
    }));
  } catch (error) {
    console.error("Error al mover a papelera:", error);
    set({ error: "No se pudo mover el producto a papelera", isLoading: false });
    throw error;
  }
},

restaurarProducto: async (idProducto) => {
  try {
    set({ isLoading: true, error: null });
    await restaurarProductoDePapelera(idProducto);
    set({ isLoading: false });
  } catch (error) {
    console.error("Error al restaurar producto:", error);
    set({ error: "No se pudo restaurar el producto", isLoading: false });
    throw error;
  }
},

fetchPapelera: async () => {
  try {
    set({ isLoading: true, error: null });
    const data = await getProductosPapelera();
    set({ isLoading: false });
    return data;
  } catch (error) {
    console.error("Error al obtener papelera:", error);
    set({ error: "No se pudo cargar la papelera", isLoading: false });
    throw error;
  }
},

  toggleActivo: async (idProducto) => {
    try {
      set({ isLoading: true });
      const { productos } = get();

      const productoActual = productos.find((p) => p.idProducto === idProducto);
      if (!productoActual) {
        console.warn("Producto no encontrado en store");
        return;
      }

      const productoActualizado = await toggleActivoProducto(
        idProducto,
        productoActual.activo
      );

      const productosActuales = productos.map((p) =>
        p.idProducto === idProducto
          ? { ...p, activo: productoActualizado.activo }
          : p
      );

      set({ productos: productosActuales, isLoading: false });
      return productoActualizado;
    } catch (error) {
      console.error("Error al cambiar estado del producto:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  toggleDestacado: async (idProducto) => {
  try {
    set({ isLoading: true });
    const { productos } = get();

    const productoActual = productos.find((p) => p.idProducto === idProducto);
    if (!productoActual) return;

    const productoActualizado = await toggleDestacadoProducto(
      idProducto,
      productoActual.destacado
    );

    set({
      productos: productos.map((p) =>
        p.idProducto === idProducto
          ? { ...p, destacado: productoActualizado.destacado ? 1 : 0 }
          : p
      ),
      isLoading: false,
    });

    return productoActualizado;
  } catch (error) {
    console.error("Error al cambiar destacado:", error);
    set({ isLoading: false });
    throw error;
  }
},

  setProductoSeleccionado: (producto) => {
    set({ productoSeleccionado: producto });
  },
}));