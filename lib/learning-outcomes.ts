import { AuthService } from './auth';

export interface LearningOutcome {
  id?: number;
  codigo: string;
  descripcion: string;
  tipo: 'GENERAL' | 'ESPECIFICO';
  carreraId: number;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface CreateLearningOutcomeRequest {
  codigo: string;
  descripcion: string;
  tipo: 'GENERAL' | 'ESPECIFICO';
  carreraId: number;
}

export const LEARNING_OUTCOME_TYPES = [
  { value: 'GENERAL', label: 'General (RG)' },
  { value: 'ESPECIFICO', label: 'Específico (RE)' }
] as const;

export class LearningOutcomesService {
  /**
   * Obtiene todos los resultados de aprendizaje
   */
  static async getLearningOutcomes(): Promise<LearningOutcome[]> {
    try {
      console.log('Iniciando petición GET a Learning Outcomes...');
      const response = await AuthService.authenticatedFetch('/api/learning-outcomes', {
        method: 'GET',
      });

      console.log('Respuesta Learning Outcomes:', response.status, response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error en respuesta Learning Outcomes:', errorData);
        throw new Error(errorData.error || 'Error al obtener resultados de aprendizaje');
      }

      const data = await response.json();
      console.log('Datos Learning Outcomes recibidos:', data);
      
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
      console.error('Error obteniendo resultados de aprendizaje:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo resultado de aprendizaje
   * Solo puede ser ejecutado por usuarios con rol CEI
   */
  static async createLearningOutcome(outcome: CreateLearningOutcomeRequest): Promise<LearningOutcome> {
    try {
      const response = await AuthService.authenticatedFetch('/api/learning-outcomes', {
        method: 'POST',
        body: JSON.stringify(outcome),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al crear resultado de aprendizaje');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creando resultado de aprendizaje:', error);
      throw error;
    }
  }

  /**
   * Valida los datos del resultado de aprendizaje antes de enviar
   */
  static validateLearningOutcome(outcome: Partial<CreateLearningOutcomeRequest>): string[] {
    const errors: string[] = [];

    if (!outcome.codigo?.trim()) {
      errors.push('El código es requerido');
    } else if (outcome.codigo.length < 2) {
      errors.push('El código debe tener al menos 2 caracteres');
    }

    if (!outcome.descripcion?.trim()) {
      errors.push('La descripción es requerida');
    } else if (outcome.descripcion.length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    }

    if (!outcome.tipo) {
      errors.push('El tipo es requerido');
    } else if (!['GENERAL', 'ESPECIFICO'].includes(outcome.tipo)) {
      errors.push('Tipo inválido. Debe ser GENERAL o ESPECIFICO');
    }

    if (!outcome.carreraId || outcome.carreraId <= 0) {
      errors.push('ID de carrera inválido');
    }

    return errors;
  }
}