import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { api, isAuthenticated } from '../services/api';

// ⭐ INTERFAZ USER ACTUALIZADA para coincidir exactamente con api.ts
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
  full_name?: string; // ← OPCIONAL para coincidir con api.ts
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false, error: null };
    case 'AUTH_ERROR':
      return { ...state, user: null, isAuthenticated: false, isLoading: false, error: action.payload };
    case 'AUTH_LOGOUT':
      return { ...state, user: null, isAuthenticated: false, isLoading: false, error: null };
    case 'AUTH_CLEAR_ERROR':
      return { ...state, error: null };
    case 'UPDATE_USER':
      return { ...state, user: action.payload, error: null };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      await api.auth.login({ username, password });
      const userData = await api.auth.getCurrentUser();
      dispatch({ type: 'AUTH_SUCCESS', payload: userData });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al iniciar sesión';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const register = async (userData: any): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      await api.auth.register(userData);
      await login(userData.username, userData.password);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al registrarse';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Función para actualizar perfil del usuario
  const updateUser = async (userData: any): Promise<void> => {
    try {
      const updatedUser = await api.users.updateProfile(userData);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error al actualizar perfil';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logout = (): void => {
    api.auth.logout();
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  const clearError = (): void => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await api.auth.getCurrentUser();
          dispatch({ type: 'AUTH_SUCCESS', payload: userData });
        } catch (error) {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };
    checkAuth();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;