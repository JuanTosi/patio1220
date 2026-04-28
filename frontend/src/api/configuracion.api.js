import axios from './axiosConfig';

// Obtener configuración pública
export const obtenerConfiguracionPublicaAPI = async () => {
  const response = await axios.get('/configuracion/publica');
  return response.data;
};

// Obtener toda la configuración ADMIN
export const obtenerConfiguracionAPI = async () => {
  const response = await axios.get('/configuracion');
  return response.data;
};

// Actualizar configuración por clave ADMIN
export const actualizarConfiguracionPorClaveAPI = async (clave, valor) => {
  const response = await axios.put(`/configuracion/clave/${clave}`, { valor });
  return response.data;
};

// Actualizar múltiples configuraciones ADMIN
export const actualizarConfiguracionMasivaAPI = async (configuraciones) => {
  const response = await axios.put('/configuracion/masiva', { configuraciones });
  return response.data;
};