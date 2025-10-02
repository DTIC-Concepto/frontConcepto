import { API_CONFIG, User, CreateUserRequest, UserFilters } from './api';
import { AuthService } from './auth';

export class UsersService {
  /**
   * Obtiene todos los usuarios con filtros opcionales
   */
  static async getUsers(filters?: UserFilters): Promise<User[]> {
    try {
      // Construir parámetros de consulta
      const params = new URLSearchParams();
      if (filters?.rol) params.append('rol', filters.rol);
      if (filters?.estadoActivo !== undefined) params.append('estadoActivo', filters.estadoActivo.toString());
      if (filters?.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = `${API_CONFIG.ENDPOINTS.USERS}${queryString ? `?${queryString}` : ''}`;

      const response = await AuthService.authenticatedFetch(url, {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener usuarios');
      }

      return data;
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario
   */
  static async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await AuthService.authenticatedFetch(API_CONFIG.ENDPOINTS.USERS, {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear usuario');
      }

      return data;
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  }

  /**
   * Valida los datos del usuario antes de enviar
   */
  static validateUser(userData: Partial<CreateUserRequest>): string[] {
    const errors: string[] = [];

    if (!userData.nombres?.trim()) {
      errors.push('Los nombres son requeridos');
    }

    if (!userData.apellidos?.trim()) {
      errors.push('Los apellidos son requeridos');
    }

    if (!userData.cedula?.trim()) {
      errors.push('La cédula es requerida');
    } else if (!/^\d{10}$/.test(userData.cedula)) {
      errors.push('La cédula debe tener 10 dígitos');
    }

    if (!userData.correo?.trim()) {
      errors.push('El correo es requerido');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.correo)) {
      errors.push('El correo debe tener un formato válido');
    }

    if (!userData.contrasena?.trim()) {
      errors.push('La contraseña es requerida');
    } else if (userData.contrasena.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (!userData.rol) {
      errors.push('El rol es requerido');
    }

    if (!userData.facultadId || userData.facultadId === 0) {
      errors.push('La facultad es requerida');
    }

    return errors;
  }

  /**
   * Formatea los datos del usuario para mostrar en la UI
   */
  static formatUserForDisplay(user: User) {
    return {
      ...user,
      nombreCompleto: `${user.nombres} ${user.apellidos}`,
      estadoTexto: user.estadoActivo ? 'Activo' : 'Inactivo',
    };
  }
}