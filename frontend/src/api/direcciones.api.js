import axios from './axiosConfig';

// Obtener mis direcciones
export const obtenerMisDireccionesAPI = async () => {
  const response = await axios.get('/direcciones');
  return response.data;
};

// Obtener dirección por ID
export const obtenerDireccionPorIdAPI = async (id) => {
  const response = await axios.get(`/direcciones/${id}`);
  return response.data;
};

// Agregar nueva dirección
export const agregarDireccionAPI = async (direccionData) => {
  const response = await axios.post('/direcciones', direccionData);
  return response.data;
};

// Editar dirección
export const editarDireccionAPI = async (id, direccionData) => {
  const response = await axios.put(`/direcciones/${id}`, direccionData);
  return response.data;
};

// Marcar dirección como principal
export const marcarDireccionPrincipalAPI = async (id) => {
  const response = await axios.patch(`/direcciones/${id}/principal`);
  return response.data;
};

// Eliminar dirección
export const eliminarDireccionAPI = async (id) => {
  const response = await axios.delete(`/direcciones/${id}`);
  return response.data;
};