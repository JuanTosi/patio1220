import axios from './axiosConfig';

// Obtener todas las categorías
export const obtenerCategoriasAPI = async () => {
  const response = await axios.get('/categorias');
  return response.data;
};

// Obtener categorías activas
export const obtenerCategoriasActivasAPI = async () => {
  const response = await axios.get('/categorias/activas');
  return response.data;
};

// Obtener categoría por ID
export const obtenerCategoriaPorIdAPI = async (id) => {
  const response = await axios.get(`/categorias/${id}`);
  return response.data;
};

// Crear categoría ADMIN
export const crearCategoriaAPI = async (categoriaData) => {
  const response = await axios.post('/categorias', categoriaData);
  return response.data;
};

// Editar categoría ADMIN
export const editarCategoriaAPI = async (id, categoriaData) => {
  const response = await axios.put(`/categorias/${id}`, categoriaData);
  return response.data;
};

// Eliminar categoría ADMIN
export const eliminarCategoriaAPI = async (id) => {
  const response = await axios.delete(`/categorias/${id}`);
  return response.data;
};