import axios from './axiosConfig';

// Login
export const loginAPI = async (credentials) => {
  const response = await axios.post('/auth/login', credentials);
  return response.data;
};

// Register
export const registerAPI = async (userData) => {
  const response = await axios.post('/auth/register', userData);
  return response.data;
};

// Recuperar contraseña
export const recuperarPasswordAPI = async (email) => {
  const response = await axios.post('/auth/recuperar-password', { email });
  return response.data;
};

// Cambiar mi contraseña (usuario logeado)
export const cambiarMiPasswordAPI = async (passwordData) => {
  const response = await axios.put('/usuarios/me/password', passwordData);
  return response.data;
};