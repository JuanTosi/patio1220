import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCarritoStore = create(
  persist(
    (set, get) => ({
      carrito: [],

      agregarAlCarrito: (producto, cantidad = 1) => {
        if (cantidad <= 0) return;

        const { carrito } = get();

        const key = `${producto.idProducto}-${producto.nombreTamanio}`;

        const existente = carrito.find((p) => p.key === key);

        const stockDisponible = producto.stockDisponible;

        if (existente) {
          const nuevaCantidad = existente.cantidad + cantidad;

          if (nuevaCantidad > stockDisponible) return;

          const actualizado = carrito.map((p) =>
            p.key === key ? { ...p, cantidad: nuevaCantidad } : p
          );

          return set({ carrito: actualizado });
        }

        if (cantidad > stockDisponible) cantidad = stockDisponible;

        const nuevoItem = {
          key,
          ...producto,
          cantidad,
        };

        set({ carrito: [...carrito, nuevoItem] });
      },

      disminuirCantidad: (idProducto, nombreTamanio, cantidad = 1) => {
        const { carrito } = get();
        const key = `${idProducto}-${nombreTamanio}`;

        const actualizado = carrito
          .map((p) =>
            p.key === key ? { ...p, cantidad: p.cantidad - cantidad } : p
          )
          .filter((p) => p.cantidad > 0);

        set({ carrito: actualizado });
      },

      aumentarCantidad: (idProducto, nombreTamanio, cantidad = 1) => {
        const { carrito } = get();
        const key = `${idProducto}-${nombreTamanio}`;

        const actualizado = carrito.map((p) =>
          p.key === key ? { ...p, cantidad: p.cantidad + cantidad } : p
        );

        set({ carrito: actualizado });
      },

      eliminarDelCarrito: (idProducto, nombreTamanio) => {
        const key = `${idProducto}-${nombreTamanio}`;

        set((state) => ({
          carrito: state.carrito.filter((p) => p.key !== key),
        }));
      },

      vaciarCarrito: () => set({ carrito: [] }),
      totalCarrito: () => {
        const { carrito } = get();
        return carrito.reduce(
          (total, p) => total + p.precioUnitario * p.cantidad,
          0
        );
      },

      totalItems: () => {
        const { carrito } = get();
        return carrito.reduce((acc, item) => acc + item.cantidad, 0);
      },
    }),
    {
      name: "carrito-storage",
      getStorage: () => localStorage,
    }
  )
);