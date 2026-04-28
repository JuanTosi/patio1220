import axios from './axiosConfig';

// Obtener servicios activos
export const obtenerServiciosActivosAPI = async () => {
  const response = await axios.get('/servicios/activos');
  return response.data;
};

// Obtener todos los servicios ADMIN
export const obtenerServiciosAPI = async () => {
  const response = await axios.get('/servicios');
  return response.data;
};

// Crear servicio ADMIN
export const crearServicioAPI = async (servicioData) => {
  const response = await axios.post('/servicios', servicioData);
  return response.data;
};

// Editar servicio ADMIN
export const editarServicioAPI = async (id, servicioData) => {
  const response = await axios.put(`/servicios/${id}`, servicioData);
  return response.data;
};

// Eliminar servicio ADMIN
export const eliminarServicioAPI = async (id) => {
  const response = await axios.delete(`/servicios/${id}`);
  return response.data;
};