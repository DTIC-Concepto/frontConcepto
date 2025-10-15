import { AuthService } from './auth';

export interface ProgramObjective {
  id?: number;
  codigo: string;
  descripcion: string;
  carreraId: number;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface CreateProgramObjectiveRequest {
  codigo: string;
  descripcion: string;
  carreraId: number;
}

export class ProgramObjectivesService {
  /**
   * Obtiene todos los objetivos de programa
   */
  static async getProgramObjectives(): Promise<ProgramObjective[]> {
    try {
      console.log('Iniciando petición GET a Program Objectives...');
      const response = await AuthService.authenticatedFetch('/api/program-objectives', {
        method: 'GET',
      });

      console.log('Respuesta Program Objectives:', response.status, response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error en respuesta Program Objectives:', errorData);
        throw new Error(errorData.error || 'Error al obtener objetivos de programa');
      }

      const data = await response.json();
      console.log('Datos Program Objectives recibidos:', data);
      
      // El backend devuelve un objeto con formato {data: Array, total: number, ...}
      // Extraemos solo el array de datos
      if (data && Array.isArray(data.data)) {
        return data.data;
      } else if (Array.isArray(data)) {
        // Por compatibilidad si el backend cambia el formato
        return data;
      } else {
        console.warn('Formato inesperado de respuesta:', data);
        return [];
      }
    } catch (error) {
      console.error('Error obteniendo objetivos de programa:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo objetivo de programa
   * Solo puede ser ejecutado por usuarios con rol COORDINADOR
   */
  static async createProgramObjective(objective: CreateProgramObjectiveRequest): Promise<ProgramObjective> {
    try {
      const response = await AuthService.authenticatedFetch('/api/program-objectives', {
        method: 'POST',
        body: JSON.stringify(objective),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al crear objetivo de programa');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creando objetivo de programa:', error);
      throw error;
    }
  }

  /**
   * Valida los datos del objetivo antes de enviar
   */
  static validateObjective(objective: Partial<CreateProgramObjectiveRequest>): string[] {
    const errors: string[] = [];

    if (!objective.codigo?.trim()) {
      errors.push('El código es requerido');
    } else if (objective.codigo.length < 2) {
      errors.push('El código debe tener al menos 2 caracteres');
    }

    if (!objective.descripcion?.trim()) {
      errors.push('La descripción es requerida');
    } else if (objective.descripcion.length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    }

    if (!objective.carreraId || objective.carreraId <= 0) {
      errors.push('ID de carrera inválido');
    }

    return errors;
  }
}