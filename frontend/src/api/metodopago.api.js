import axios from './axiosConfig';

// Obtener métodos de pago activos
export const obtenerMetodosPagoActivosAPI = async () => {
  const response = await axios.get('/metodos-pago/activos');
  return response.data;
};

// Obtener todos los métodos de pago ADMIN
export const obtenerMetodosPagoAPI = async () => {
  const response = await axios.get('/metodos-pago');
  return response.data;
};

// Crear método de pago ADMIN
export const crearMetodoPagoAPI = async (metodoData) => {
  const response = await axios.post('/metodos-pago', metodoData);
  return response.data;
};

// Editar método de pago ADMIN
export const editarMetodoPagoAPI = async (id, metodoData) => {
  const response = await axios.put(`/metodos-pago/${id}`, metodoData);
  return response.data;
};

// Eliminar método de pago ADMIN
export const eliminarMetodoPagoAPI = async (id) => {
  const response = await axios.delete(`/metodos-pago/${id}`);
  return response.data;
};