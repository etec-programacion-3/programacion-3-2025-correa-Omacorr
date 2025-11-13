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
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Campo calculado para compatibilidad
  full_name: string; // Será nombre + apellido
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

export interface UserCreateData {
  email: string;
  username: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  codigo_postal?: string;
}