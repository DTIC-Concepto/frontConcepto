import { API_CONFIG, LoginCredentials, LoginResponse, ApiError } from './api';

// Clave para almacenar el token en localStorage
const TOKEN_KEY = 'auth_token';

export class AuthService {
  /**
   * Realiza el login con las credenciales proporcionadas
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Construir la URL correctamente para el proxy local
      const url = API_CONFIG.ENDPOINTS.AUTH.LOGIN;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        // Si la API retorna un error específico, usarlo
        throw new Error(data.error || data.message || 'Credenciales inválidas');
      }

      // Almacenar el token en localStorage
      if (data.access_token) {
        this.setToken(data.access_token);
      }

      return data;
    } catch (error) {
      console.error('Error en login:', error);
      // Re-lanzar el error para que el componente pueda manejarlo
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Error de conexión con el servidor');
      }
    }
  }

  /**
   * Almacena el token en localStorage
   */
  static setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Obtiene el token del localStorage
   */
  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Elimina el token del localStorage (logout)
   */
  static removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  /**
   * Obtiene los headers de autorización para las peticiones
   */
  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token 
      ? { 'Authorization': `Bearer ${token}` }
      : {};
  }

  /**
   * Realiza logout
   */
  static logout(): void {
    this.removeToken();
    // Redirigir al login o página principal
    window.location.href = '/';
  }

  /**
   * Wrapper para realizar peticiones autenticadas
   */
  static async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const authHeaders = this.getAuthHeaders();
    
    // Si la URL no empieza con http, es una ruta relativa (proxy local)
    const fullUrl = url.startsWith('http') ? url : url;
    
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
    });

    // Si el token expiró, hacer logout automático
    if (response.status === 401) {
      this.logout();
      throw new Error('Sesión expirada');
    }

    return response;
  }
}