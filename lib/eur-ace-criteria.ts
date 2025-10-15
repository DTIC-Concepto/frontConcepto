import { AuthService } from './auth';

export interface EurAceCriterion {
  id?: number;
  codigo: string;
  descripcion: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface CreateEurAceCriterionRequest {
  codigo: string;
  descripcion: string;
}

export class EurAceCriteriaService {
  /**
   * Obtiene todos los criterios EUR-ACE
   */
  static async getEurAceCriteria(): Promise<EurAceCriterion[]> {
    try {
      console.log('Iniciando petición GET a EUR-ACE criteria...');
      const response = await AuthService.authenticatedFetch('/api/eur-ace-criteria', {
        method: 'GET',
      });

      console.log('Respuesta EUR-ACE:', response.status, response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error en respuesta EUR-ACE:', errorData);
        throw new Error(errorData.error || 'Error al obtener criterios EUR-ACE');
      }

      const data = await response.json();
      console.log('Datos EUR-ACE recibidos:', data);
      
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
      console.error('Error obteniendo criterios EUR-ACE:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo criterio EUR-ACE
   * Solo puede ser ejecutado por usuarios con rol CEI
   */
  static async createEurAceCriterion(criterion: CreateEurAceCriterionRequest): Promise<EurAceCriterion> {
    try {
      console.log('Iniciando POST a EUR-ACE criteria:', criterion);
      const response = await AuthService.authenticatedFetch('/api/eur-ace-criteria', {
        method: 'POST',
        body: JSON.stringify(criterion),
      });

      console.log('Respuesta POST EUR-ACE:', response.status, response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error en POST EUR-ACE:', response.status, errorData);
        
        // Crear un mensaje de error más específico basado en el código de estado
        let errorMessage = errorData.error || errorData.message || 'Error al crear criterio EUR-ACE';
        
        if (response.status === 409) {
          errorMessage = `Conflict: El código ${criterion.codigo} ya existe`;
        } else if (response.status === 403) {
          errorMessage = 'Forbidden: No tienes permisos para crear criterios EUR-ACE';
        } else if (response.status === 401) {
          errorMessage = 'Unauthorized: Tu sesión ha expirado';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Criterio EUR-ACE creado exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error creando criterio EUR-ACE:', error);
      throw error;
    }
  }

  /**
   * Valida los datos del criterio antes de enviar
   */
  static validateCriterion(criterion: Partial<CreateEurAceCriterionRequest>): string[] {
    const errors: string[] = [];

    if (!criterion.codigo?.trim()) {
      errors.push('El código es requerido');
    } else if (!/^\d+\.\d+\.\d+$/.test(criterion.codigo)) {
      errors.push('El código debe tener el formato X.X.X (ejemplo: 5.4.6)');
    }

    if (!criterion.descripcion?.trim()) {
      errors.push('La descripción es requerida');
    } else if (criterion.descripcion.length < 5) {
      errors.push('La descripción debe tener al menos 5 caracteres');
    }

    return errors;
  }
}