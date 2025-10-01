// Configuración centralizada de la API
export const API_CONFIG = {
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login', // Proxy local de Next.js
    },
    // Aquí puedes agregar más endpoints cuando los necesites
    USERS: '/api/users',
    CARRERAS: '/api/carreras',
    FACULTADES: '/api/facultades',
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

export interface LoginResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  user?: any; // Puedes tipar mejor según lo que retorne el backend
}

export interface ApiError {
  message: string;
  status?: number;
}