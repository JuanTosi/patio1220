import axios from './axiosConfig';

// Obtener todos los tamaños
export const obtenerTamaniosAPI = async () => {
  const response = await axios.get('/tamanios');
  return response.data;
};

// Obtener tamaños activos
export const obtenerTamaniosActivosAPI = async () => {
  const response = await axios.get('/tamanios/activos');
  return response.data;
};

// Crear tamaño ADMIN
export const crearTamanioAPI = async (tamanioData) => {
  const response = await axios.post('/tamanios', tamanioData);
  return response.data;
};

// Editar tamaño ADMIN
export const editarTamanioAPI = async (id, tamanioData) => {
  const response = await axios.put(`/tamanios/${id}`, tamanioData);
  return response.data;
};

// Eliminar tamaño ADMIN
export const eliminarTamanioAPI = async (id) => {
  const response = await axios.delete(`/tamanios/${id}`);
  return response.data;
};