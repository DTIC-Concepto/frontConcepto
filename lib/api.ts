// Configuración centralizada de la API
export const API_CONFIG = {
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login', // Proxy local de Next.js
    },
    USERS: '/api/usuarios', // Proxy para gestión de usuarios
    FACULTADES: '/api/facultades',
    CARRERAS: '/api/carreras',
    DASHBOARD_ACTIVITY: '/api/dashboard/activity',
  }
};

// URL del backend real (para usar en los proxies)
export const BACKEND_URL = 'https://backprueba-production-fdf6.up.railway.app';

// Tipos para la autenticación
export interface LoginCredentials {
  correo: string;
  contrasena: string;
  rol: string;
}

export interface LoginResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  user?: any; // Puedes tipar mejor según lo que retorne el backend
}

// Tipos para usuarios
export interface UserRole {
  rol: RoleType;
  observaciones?: string;
}

export interface User {
  id?: number;
  nombres: string;
  apellidos: string;
  cedula: string;
  correo: string;
  contrasena?: string; // Solo para creación
  rol: RoleType; // Rol principal para compatibilidad
  rolPrincipal?: RoleType; // Nuevo campo para rol principal
  roles?: UserRole[]; // Array de roles para usuarios multi-rol
  facultadId: number;
  estadoActivo: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface CreateUserRequest {
  nombres: string;
  apellidos: string;
  cedula: string;
  correo: string;
  contrasena: string;
  rol: RoleType;
  facultadId: number;
  estadoActivo: boolean;
}

export interface UserFilters {
  rol?: RoleType;
  estadoActivo?: boolean;
  search?: string;
}

// Roles válidos según el backend
export const VALID_ROLES = [
  'ADMINISTRADOR',
  'DGIP', 
  'PROFESOR',
  'DECANO',
  'SUBDECANO',
  'JEFE_DEPARTAMENTO',
  'COORDINADOR',
  'CEI'
] as const;

export type RoleType = typeof VALID_ROLES[number];

// Para mostrar en el frontend con formato amigable
export const ROLE_DISPLAY_NAMES: Record<RoleType, string> = {
  'ADMINISTRADOR': 'Administrador',
  'DGIP': 'DGIP',
  'PROFESOR': 'Profesor', 
  'DECANO': 'Decano',
  'SUBDECANO': 'Subdecano',
  'JEFE_DEPARTAMENTO': 'Jefe de Departamento',
  'COORDINADOR': 'Coordinador',
  'CEI': 'CEI'
};

// Tipos para facultades
export interface Faculty {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  carreras?: number;
  decano?: string;
  estadoActivo?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface CreateFacultyRequest {
  codigo: string;
  nombre: string;
  descripcion: string;
  estadoActivo?: boolean;
}

export interface FacultyFilters {
  estadoActivo?: boolean;
  search?: string;
}

// Tipos para carreras
export interface Career {
  id?: number;
  codigo: string;
  nombre: string;
  facultadId?: number;
  coordinadorId?: number;
  duracion: number;
  modalidad: 'PRESENCIAL' | 'VIRTUAL' | 'SEMIPRESENCIAL';
  estadoActivo: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  createdAt?: string;
  updatedAt?: string;
  // Campos enriquecidos
  facultadNombre?: string;
  coordinadorNombre?: string;
  // Objetos anidados del backend
  facultad?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  coordinador?: {
    id: number;
    nombres: string;
    apellidos: string;
    correo: string;
    rol: string;
  };
}

export interface CreateCareerRequest {
  codigo: string;
  nombre: string;
  facultadId: number;
  coordinadorId: number;
  duracion: number;
  modalidad: 'PRESENCIAL' | 'VIRTUAL' | 'SEMIPRESENCIAL';
  estadoActivo: boolean;
}

export interface CareerFilters {
  facultadId?: string;
  estadoActivo?: boolean;
  search?: string;
  modalidad?: 'PRESENCIAL' | 'VIRTUAL' | 'SEMIPRESENCIAL';
  duracionMin?: number;
  duracionMax?: number;
  page?: number;
  limit?: number;
}

export const MODALIDADES = ['PRESENCIAL', 'VIRTUAL', 'SEMIPRESENCIAL'] as const;
export type ModalidadType = typeof MODALIDADES[number];

export const MODALIDAD_DISPLAY_NAMES: Record<ModalidadType, string> = {
  'PRESENCIAL': 'Presencial',
  'VIRTUAL': 'Virtual',
  'SEMIPRESENCIAL': 'Semipresencial'
};

export interface ApiError {
  message: string;
  status?: number;
}

// Tipos para actividad reciente del dashboard
export interface ActivityRecord {
  hora: string;
  usuario: string;
  accion: string;
  tipoEvento: string;
  fechaEvento: string;
}