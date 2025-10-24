// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Tipos para las respuestas de la API
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

// Crear instancia de Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests - agregar token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log de requests en desarrollo
    if (import.meta.env.DEV) {
      console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejo de errores centralizados
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log de responses exitosas en desarrollo
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    
    return response;
  },
  (error) => {
    // Manejo centralizado de errores
    const apiError: ApiError = {
      message: 'Error de conexión',
      status: 0,
    };

    if (error.response) {
      // Error del servidor
      apiError.status = error.response.status;
      apiError.message = error.response.data?.detail || 
                        error.response.data?.message || 
                        `Error ${error.response.status}`;
      apiError.details = error.response.data;

      // Manejo específico de errores
      switch (error.response.status) {
        case 401:
          // Token expirado o inválido
          Cookies.remove('access_token');
          apiError.message = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          // Redirigir al login si no estamos ya ahí
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;
        
        case 403:
          apiError.message = 'No tienes permisos para realizar esta acción.';
          break;
        
        case 404:
          apiError.message = 'Recurso no encontrado.';
          break;
        
        case 422:
          apiError.message = 'Datos inválidos. Verifica la información enviada.';
          break;
        
        case 500:
          apiError.message = 'Error interno del servidor. Intenta más tarde.';
          break;
      }
    } else if (error.request) {
      // Error de red
      apiError.message = 'Error de conexión. Verifica tu conexión a internet.';
    }

    console.error('❌ API Error:', apiError);
    return Promise.reject(apiError);
  }
);

// Clase API para organizar los endpoints
class ApiService {
  
  // === AUTHENTICATION ===
  auth = {
    login: async (credentials: { username: string; password: string }) => {
      const formData = new FormData();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      
      const response = await apiClient.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // Guardar token en cookie
      if (response.data.access_token) {
        Cookies.set('access_token', response.data.access_token, { 
          expires: 1, // 1 día
          secure: true,
          sameSite: 'strict'
        });
      }
      
      return response.data;
    },

    register: async (userData: {
      username: string;
      email: string;
      password: string;
      full_name?: string;
    }) => {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    },

    logout: () => {
      Cookies.remove('access_token');
      window.location.href = '/login';
    },

    getCurrentUser: async () => {
      const response = await apiClient.get('/users/me/profile');
      return response.data;
    },
  };

  // === PRODUCTS ===
  products = {
    getAll: async (params?: {
      skip?: number;
      limit?: number;
      categoria?: string;
      vendedor?: string;
      buscar?: string;
      ordenar_por_rating?: boolean;
      min_rating?: number;
    }) => {
      const response = await apiClient.get('/products/', { params });
      return response.data;
    },

    getById: async (id: number, incluir_calificaciones = false) => {
      const response = await apiClient.get(`/products/${id}`, {
        params: { incluir_calificaciones }
      });
      return response.data;
    },

    create: async (productData: {
      nombre: string;
      descripcion?: string;
      precio: number;
      stock: number;
      categoria?: string;
    }) => {
      const response = await apiClient.post('/products/', productData);
      return response.data;
    },

    update: async (id: number, productData: Partial<{
      nombre: string;
      descripcion: string;
      precio: number;
      stock: number;
      categoria: string;
    }>) => {
      const response = await apiClient.put(`/products/${id}`, productData);
      return response.data;
    },

    delete: async (id: number) => {
      const response = await apiClient.delete(`/products/${id}`);
      return response.data;
    },

    getMine: async () => {
      const response = await apiClient.get('/products/mis-productos');
      return response.data;
    },
  };

  // === REVIEWS/CALIFICACIONES ===
  reviews = {
    create: async (productId: number, reviewData: {
      puntuacion: number;
      comentario?: string;
    }) => {
      const response = await apiClient.post(`/products/${productId}/reviews`, reviewData);
      return response.data;
    },

    getByProduct: async (productId: number, params?: {
      skip?: number;
      limit?: number;
    }) => {
      const response = await apiClient.get(`/products/${productId}/reviews`, { params });
      return response.data;
    },

    getStats: async (productId: number) => {
      const response = await apiClient.get(`/products/${productId}/reviews/stats`);
      return response.data;
    },

    deleteMine: async (productId: number) => {
      const response = await apiClient.delete(`/products/${productId}/reviews/mine`);
      return response.data;
    },

    getMine: async () => {
      const response = await apiClient.get('/products/users/me/reviews');
      return response.data;
    },
  };

  // === CONVERSATIONS ===
  conversations = {
    getAll: async () => {
      const response = await apiClient.get('/conversations/');
      return response.data;
    },

    create: async (otherUserId: number) => {
      const response = await apiClient.post('/conversations/', { 
        otro_usuario_id: otherUserId 
      });
      return response.data;
    },

    getMessages: async (conversationId: number) => {
      const response = await apiClient.get(`/conversations/${conversationId}/messages`);
      return response.data;
    },

    sendMessage: async (conversationId: number, content: string) => {
      const response = await apiClient.post(`/conversations/${conversationId}/messages`, {
        contenido: content
      });
      return response.data;
    },
  };

  // === USERS ===
  users = {
    getProfile: async (username: string) => {
      const response = await apiClient.get(`/users/${username}`);
      return response.data;
    },

    updateProfile: async (profileData: {
      email?: string;
      full_name?: string;
    }) => {
      const response = await apiClient.put('/users/me/profile', profileData);
      return response.data;
    },
  };
}

// Instancia singleton del servicio API
export const api = new ApiService();

// Función helper para verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  return !!Cookies.get('access_token');
};

// Función helper para obtener el token
export const getAuthToken = (): string | undefined => {
  return Cookies.get('access_token');
};

// Exportar cliente base para casos especiales
export { apiClient };

// Tipos útiles para TypeScript
export type Product = {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria?: string;
  activo: boolean;
  fecha_creacion: string;
  vendedor_id: number;
  vendedor_nombre: string;
  puntuacion_promedio?: number;
  total_calificaciones: number;
  calificaciones: Review[];
};

export type Review = {
  id: number;
  puntuacion: number;
  comentario?: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
  usuario_id: number;
  producto_id: number;
  usuario_nombre: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  fecha_creacion: string;
};

export type Conversation = {
  id: number;
  usuario1_id: number;
  usuario2_id: number;
  fecha_creacion: string;
  ultimo_mensaje?: string;
  mensajes_no_leidos: number;
  otro_usuario: string;
};

export type Message = {
  id: number;
  contenido: string;
  fecha_envio: string;
  leido: boolean;
  remitente_id: number;
  conversacion_id: number;
  remitente_nombre: string;
};
