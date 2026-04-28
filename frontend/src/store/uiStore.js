import { create } from "zustand"

export const useUIStore = create((set) => ({
    showCarrito: false,
    abrirCarrito: () => set({showCarrito: true}),
    cerrarCarrito: () => set({showCarrito: false})
}))
