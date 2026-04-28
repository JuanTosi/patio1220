// export const BASE_URL = `http://localhost:3000/api`
// export const PRODUCTOS_URL = `${BASE_URL}/productos`
// export const USUARIOS_URL = `${BASE_URL}/usuarios`
// export const LOGIN_URL = `${BASE_URL}/auth/login`
// export const REGISTER_URL = `${BASE_URL}/auth/register`

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const BASE_URL = API_BASE;
export const PRODUCTOS_URL = `${API_BASE}/productos`;
export const USUARIOS_URL = `${API_BASE}/usuarios`;
export const LOGIN_URL = `${API_BASE}/auth/login`;
export const REGISTER_URL = `${API_BASE}/auth/register`;