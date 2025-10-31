import axios from 'axios';
import Cookies from 'js-cookie';

// URL base de la API (cambia según tu backend)
const API_BASE_URL = 'http://localhost:5173/api/v1';

// Cliente Axios configurado
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interfaces
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  fecha_creacion: string;
}

// Funciones de autenticación
export const api = {
  auth: {
    login: async (credentials: LoginRequest) => {
      const formData = new FormData();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      
      const response = await apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      // Guardar token en cookie
      Cookies.set('access_token', response.data.access_token, { 
        expires: 1, // 1 día
        secure: window.location.protocol === 'https:',
        sameSite: 'strict'
      });
      
      return response.data;
    },

    register: async (userData: RegisterRequest) => {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    },

    getCurrentUser: async (): Promise<User> => {
      const response = await apiClient.get('/users/me/profile');
      return response.data;
    },

    logout: () => {
      Cookies.remove('access_token');
      window.location.href = '/login';
    }
  }
};

// Función para verificar si está autenticado
export const isAuthenticated = (): boolean => {
  return !!Cookies.get('access_token');
};

export default api;
