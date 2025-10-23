import { AuthService } from './auth';

export interface Asignatura {
  id?: number;
  codigo: string;
  nombre: string;
  creditos: number;
  descripcion?: string;
  tipoAsignatura: string;
  unidadCurricular: string;
  pensum: number;
  nivelReferencial: number;
  carreraIds?: number[];
  estadoActivo?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface CreateAsignaturaRequest {
  codigo: string;
  nombre: string;
  creditos: number;
  descripcion: string;
  tipoAsignatura: string;
  unidadCurricular: string;
  pensum: number;
  nivelReferencial: number;
  carreraIds: number[];
  estadoActivo: boolean;
}

export class AsignaturasService {
  /**
   * Obtiene todas las asignaturas filtradas por carrera
   */
  static async getAsignaturas(search: string = ''): Promise<Asignatura[]> {
    try {
      // Obtener carreraId directamente del usuario en localStorage
      let carreraId: number | null = null;
      try {
        const rawUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
        if (rawUser) {
          try {
            const parsedUser = JSON.parse(rawUser);
            carreraId = parsedUser?.carrera?.id ?? parsedUser?.carreraId ?? null;
          } catch (e) {
            console.error('Error al parsear usuario:', e);
          }
        }
      } catch (e) {
        console.error('Error accediendo a localStorage:', e);
      }
      
      if (!carreraId) {
        throw new Error('No se encontró el ID de carrera del usuario.');
      }
      
      const url = `/api/asignaturas?carreraId=${encodeURIComponent(carreraId)}&search=${encodeURIComponent(search)}`;
      const response = await AuthService.authenticatedFetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al obtener asignaturas');
      }

      const data = await response.json();
      
      // El backend devuelve un objeto con formato {data: Array, total: number, ...}
      // Extraemos solo el array de datos
      if (data && Array.isArray(data.data)) {
        return data.data;
      } else if (Array.isArray(data)) {
        return data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error obteniendo asignaturas:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva asignatura
   * Puede ser ejecutado por usuarios con rol COORDINADOR o PROFESOR
   */
  static async createAsignatura(asignatura: CreateAsignaturaRequest): Promise<Asignatura> {
    try {
      const response = await AuthService.authenticatedFetch('/api/asignaturas', {
        method: 'POST',
        body: JSON.stringify(asignatura),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al crear asignatura');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creando asignatura:', error);
      throw error;
    }
  }

  /**
   * Valida los datos de la asignatura antes de enviar
   */
  static validateAsignatura(asignatura: Partial<CreateAsignaturaRequest>): string[] {
    const errors: string[] = [];

    if (!asignatura.codigo?.trim()) {
      errors.push('El código es requerido');
    } else if (asignatura.codigo.length < 2) {
      errors.push('El código debe tener al menos 2 caracteres');
    }

    if (!asignatura.nombre?.trim()) {
      errors.push('El nombre es requerido');
    } else if (asignatura.nombre.length < 3) {
      errors.push('El nombre debe tener al menos 3 caracteres');
    }

    if (!asignatura.descripcion?.trim()) {
      errors.push('La descripción es requerida');
    } else if (asignatura.descripcion.length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    }

    if (!asignatura.tipoAsignatura?.trim()) {
      errors.push('El tipo de asignatura es requerido');
    }

    if (!asignatura.unidadCurricular?.trim()) {
      errors.push('La unidad curricular es requerida');
    }

    if (!asignatura.creditos || asignatura.creditos <= 0) {
      errors.push('Los créditos deben ser mayores a 0');
    }

    if (!asignatura.pensum || asignatura.pensum < 2015 || asignatura.pensum > 2024) {
      errors.push('El pensum debe estar entre 2015 y 2024');
    }

    if (!asignatura.nivelReferencial || asignatura.nivelReferencial < 1 || asignatura.nivelReferencial > 9) {
      errors.push('El nivel referencial debe estar entre 1 y 9');
    }

    if (!asignatura.carreraIds || asignatura.carreraIds.length === 0) {
      errors.push('Debe especificar al menos una carrera');
    }

    return errors;
  }
}
