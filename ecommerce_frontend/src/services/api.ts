import axios from 'axios';
import Cookies from 'js-cookie';

// URL base de la API
const API_BASE_URL = 'http://localhost:8000/api/v1';

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

// Interfaces actualizadas para coincidir con tu backend
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  codigo_postal?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  codigo_postal?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  // Campo calculado para compatibilidad
  full_name?: string;
}

export interface UserUpdate {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  codigo_postal?: string;
}

export interface Product {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria?: string;
  vendedor_id: number;
  vendedor_nombre?: string;
  fecha_creacion: string;
  puntuacion_promedio?: number;
  total_calificaciones?: number;
  stock?: number;
}

export interface Conversation {
  id: number;
  usuario1_id: number;
  usuario2_id: number;
  fecha_creacion: string;
  ultimo_mensaje?: string;
  mensajes_no_leidos: number;
  otro_usuario: string;
}

export interface Message {
  id: number;
  contenido: string;
  fecha_envio: string;
  leido: boolean;
  remitente_id: number;
  conversacion_id: number;
  remitente_nombre: string;
}

// Funciones de autenticación y API
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
      const response = await apiClient.get('/usuarios/me/profile'); // ← COMPATIBILIDAD: endpoint que funciona
      const user = response.data;
      // Calcular full_name si no existe
      if (!user.full_name && user.nombre && user.apellido) {
        user.full_name = `${user.nombre} ${user.apellido}`;
      }
      return user;
    },
    
    logout: () => {
      Cookies.remove('access_token');
      window.location.href = '/login';
    }
  },

  // Gestión de usuarios
  users: {
    // Obtener perfil del usuario actual
    getProfile: async (): Promise<User> => {
      const response = await apiClient.get('/usuarios/me');
      const user = response.data;
      // Calcular full_name
      if (!user.full_name && user.nombre && user.apellido) {
        user.full_name = `${user.nombre} ${user.apellido}`;
      }
      return user;
    },
    
    // Actualizar perfil del usuario actual
    updateProfile: async (userData: UserUpdate): Promise<User> => {
      const response = await apiClient.put('/usuarios/me', userData);
      const user = response.data;
      // Calcular full_name
      if (!user.full_name && user.nombre && user.apellido) {
        user.full_name = `${user.nombre} ${user.apellido}`;
      }
      return user;
    }
  },

  products: {
    getAll: async (params?: {
      skip?: number;
      limit?: number;
      categoria?: string;
      vendedor?: string;
      buscar?: string;
    }) => {
      const response = await apiClient.get('/products/', { params });
      return response.data;
    },
    
    getById: async (id: number) => {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    },
    
    create: async (productData: {
      nombre: string;
      descripcion?: string;
      precio: number;
      stock: number;
      categoria?: string;
      imagen_url?: string;
    }) => {
      const response = await apiClient.post('/products/', productData);
      return response.data;
    },
    
    getMine: async () => {
      const response = await apiClient.get('/products/mis-productos');
      return response.data;
    },
    
    update: async (id: number, data: any) => {
      const response = await apiClient.put(`/products/${id}`, data);
      return response.data;
    },
    
    addReview: async (productId: number, reviewData: { puntuacion: number; comentario?: string }) => {
      const response = await apiClient.post(`/products/${productId}/reviews`, reviewData);
      return response.data;
    },

    getReviews: async (productId: number) => {
      const response = await apiClient.get(`/products/${productId}/reviews`);
      return response.data;
    },

    getMyReview: async (productId: number) => {
      const response = await apiClient.get(`/products/${productId}/reviews/my-review`);
      return response.data;
    },
    
    delete: async (id: number) => {
      const response = await apiClient.delete(`/products/${id}`);
      return response.data;
    },
  },

  conversations: {
    getAll: async () => {
      const response = await apiClient.get('/conversations/');
      return response.data;
    },

    create: async (otherUserId: number) => {
      const response = await apiClient.post('/conversations/', { 
        usuario2_id: otherUserId 
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
  },

  orders: {
    create: async (cartItems: any[]) => {
      const response = await apiClient.post('/orders/', {
        items: cartItems.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio
        }))
      });
      return response.data;
    },
    
    getAll: async () => {
      const response = await apiClient.get('/orders/');
      return response.data;
    }
  }
};

// Función para verificar si está autenticado
export const isAuthenticated = (): boolean => {
  return !!Cookies.get('access_token');
};

export default api;