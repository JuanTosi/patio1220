import { api } from "./api";

export const usuariosService = {
  getById: async (idUsuario) => {
    const { data } = await api.get(`/usuarios/${idUsuario}`);
    return data;
  },
};
