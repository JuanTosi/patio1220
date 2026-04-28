import axios from './axiosConfig';

// Obtener estados activos
export const obtenerEstadosActivosAPI = async () => {
  const response = await axios.get('/estados-reserva/activos');
  return response.data;
};

// Obtener todos los estados ADMIN
export const obtenerEstadosReservaAPI = async () => {
  const response = await axios.get('/estados-reserva');
  return response.data;
};

// Crear estado ADMIN
export const crearEstadoAPI = async (estadoData) => {
  const response = await axios.post('/estados-reserva', estadoData);
  return response.data;
};

// Editar estado ADMIN
export const editarEstadoAPI = async (id, estadoData) => {
  const response = await axios.put(`/estados-reserva/${id}`, estadoData);
  return response.data;
};

// Eliminar estado ADMIN
export const eliminarEstadoAPI = async (id) => {
  const response = await axios.delete(`/estados-reserva/${id}`);
  return response.data;
};