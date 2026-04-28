import axios from './axiosConfig';

// Obtener mis reservas
export const obtenerMisReservasAPI = async () => {
  const response = await axios.get('/reservas/mis-reservas');
  return response.data;
};

// Obtener detalle de mi reserva
export const obtenerDetalleReservaAPI = async (id) => {
  const response = await axios.get(`/reservas/mis-reservas/${id}`);
  return response.data;
};

// Crear nueva reserva
export const crearReservaAPI = async (reservaData) => {
  const response = await axios.post('/reservas', reservaData);
  return response.data;
};

// Cancelar mi reserva
export const cancelarReservaAPI = async (id) => {
  const response = await axios.patch(`/reservas/${id}/cancelar`);
  return response.data;
};

// Obtener todas las reservas ADMIN
export const obtenerTodasReservasAPI = async () => {
  const response = await axios.get('/reservas');
  return response.data;
};

// Cambiar estado de reserva ADMIN
export const cambiarEstadoReservaAPI = async (id, idEstado) => {
  const response = await axios.patch(`/reservas/${id}/estado`, { idEstado });
  return response.data;
};

// Marcar reserva como pagada ADMIN
export const marcarReservaPagadaAPI = async (id, pagado) => {
  const response = await axios.patch(`/reservas/${id}/pagado`, { pagado });
  return response.data;
};

// Obtener estadísticas ADMIN
export const obtenerEstadisticasReservasAPI = async () => {
  const response = await axios.get('/reservas/estadisticas');
  return response.data;
};