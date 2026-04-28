import { create } from "zustand";
import api from "../api/axiosConfig";

export const useDireccionesStore = create((set, get) => ({
  direcciones: [],
  loading: false,
  error: null,

  fetchDirecciones: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get("/direcciones");
      set({ direcciones: data, loading: false });
    } catch (error) {
      console.error("Error al cargar direcciones:", error);
      set({
        error: error.response?.data?.error || "Error al cargar direcciones",
        loading: false,
      });
    }
  },

  agregarDireccion: async (nuevaDireccion) => {
    try {
      const { data } = await api.post("/direcciones", nuevaDireccion);
      if (data.success) {
        await get().fetchDirecciones();
        return { ok: true };
      }
      return { ok: false, error: "Respuesta inesperada del servidor" };
    } catch (error) {
      console.error("Error al agregar dirección:", error);
      return {
        ok: false,
        error: error.response?.data?.error || "No se pudo agregar la dirección",
      };
    }
  },

  editarDireccion: async (id, datosActualizados) => {
    try {
      const { data } = await api.put(`/direcciones/${id}`, datosActualizados);
      if (data.success) {
        await get().fetchDirecciones();
        return { ok: true };
      }
      return { ok: false, error: "Respuesta inesperada del servidor" };
    } catch (error) {
      console.error("Error al actualizar dirección:", error);
      return {
        ok: false,
        error: error.response?.data?.error || "No se pudo actualizar la dirección",
      };
    }
  },

  eliminarDireccion: async (id) => {
    try {
      const { data } = await api.delete(`/direcciones/${id}`);
      if (data.success) {
        await get().fetchDirecciones();
        return { ok: true };
      }
      return { ok: false, error: "Respuesta inesperada del servidor" };
    } catch (error) {
      console.error("Error al eliminar dirección:", error);
      return {
        ok: false,
        error: error.response?.data?.error || "No se pudo eliminar la dirección",
      };
    }
  },

  marcarPrincipal: async (id) => {
    try {
      const { data } = await api.patch(`/direcciones/${id}/principal`);
      if (data.success) {
        await get().fetchDirecciones();
        return { ok: true };
      }
      return { ok: false, error: "Respuesta inesperada del servidor" };
    } catch (error) {
      console.error("Error al marcar como principal:", error);
      return {
        ok: false,
        error: error.response?.data?.error || "No se pudo marcar como principal",
      };
    }
  },

  getDireccionPrincipal: () => {
    const { direcciones } = get();
    return direcciones.find((d) => d.esPrincipal === 1) || direcciones[0] || null;
  },

  limpiarDirecciones: () => set({ direcciones: [], loading: false, error: null }),
}));