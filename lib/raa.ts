import { AuthService } from './auth';

export interface Raa {
  id?: number;
  codigo: string;
  tipo: 'Conocimientos' | 'Destrezas' | 'Valores y actitudes';
  descripcion: string;
  asignaturaId: number;
  estadoActivo?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface CreateRaaRequest {
  codigo: string;
  tipo: 'Conocimientos' | 'Destrezas' | 'Valores y actitudes';
  descripcion: string;
  asignaturaId: number;
  estadoActivo: boolean;
}

export const RAA_TYPES = [
  { value: 'Conocimientos', label: 'Conocimientos' },
  { value: 'Destrezas', label: 'Destrezas' },
  { value: 'Valores y actitudes', label: 'Valores y actitudes' }
] as const;

export class RaaService {
  /**
   * Obtiene todos los RAA de una asignatura
   */
  static async getRaas(asignaturaId: number): Promise<Raa[]> {
    try {
      if (!asignaturaId) {
        throw new Error('No se proporcionó el ID de asignatura.');
      }
      
      const url = `/api/raa?asignaturaId=${encodeURIComponent(asignaturaId)}`;
      const response = await AuthService.authenticatedFetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al obtener RAA');
      }

      const data = await response.json();
      
      // El backend puede devolver un objeto con formato {data: Array, total: number, ...}
      // o directamente un array
      if (data && Array.isArray(data.data)) {
        return data.data;
      } else if (Array.isArray(data)) {
        return data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error obteniendo RAA:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo RAA
   * Puede ser ejecutado por usuarios con rol COORDINADOR o PROFESOR
   */
  static async createRaa(raa: CreateRaaRequest): Promise<Raa> {
    try {
      const response = await AuthService.authenticatedFetch('/api/raa', {
        method: 'POST',
        body: JSON.stringify(raa),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al crear RAA');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creando RAA:', error);
      throw error;
    }
  }

  /**
   * Valida los datos del RAA antes de enviar
   */
  static validateRaa(raa: Partial<CreateRaaRequest>): string[] {
    const errors: string[] = [];

    if (!raa.codigo?.trim()) {
      errors.push('El código es requerido');
    } else if (raa.codigo.length < 1) {
      errors.push('El código debe tener al menos 1 carácter');
    }

    if (!raa.tipo) {
      errors.push('El tipo es requerido');
    } else if (!['Conocimientos', 'Destrezas', 'Valores y actitudes'].includes(raa.tipo)) {
      errors.push('Tipo inválido');
    }

    if (!raa.descripcion?.trim()) {
      errors.push('La descripción es requerida');
    } else if (raa.descripcion.length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    }

    if (!raa.asignaturaId || raa.asignaturaId <= 0) {
      errors.push('ID de asignatura inválido');
    }

    return errors;
  }
}
