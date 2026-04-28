import { useAuthStore } from '../store/authStore';
import { loginAPI, registerAPI } from '../api/auth.api';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, token, login, logout, isAuthenticated } = useAuthStore();

  const handleLogin = async (credentials) => {
    try {
      const data = await loginAPI(credentials);
      login(data.user, data.token);
      navigate('/');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al iniciar sesión' 
      };
    }
  };

  const handleRegister = async (userData) => {
    try {
      const data = await registerAPI(userData);
      login(data.user, data.token);
      navigate('/');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al registrarse' 
      };
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = () => {
    return user?.rol === 'admin';
  };

  const isAdminOrEmpleado = () => {
    return user?.rol === 'admin' || user?.rol === 'empleado';
  };

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isAdminOrEmpleado,
    handleLogin,
    handleRegister,
    handleLogout,
  };
};