


import { AuthService } from './auth';

// Obtener matriz OPP-RA por carreraId
export async function getOppRaMatrix(carreraId: number) {
  try {
    const response = await AuthService.authenticatedFetch(`/api/mappings/opp-ra/matrix/${carreraId}`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error obteniendo matriz OPP-RA:', error);
    throw error;
  }
}

// Types para mappings OPP-RA
export interface OppRaMapping {
  resultadoAprendizajeId: number;
  oppId: number;
  justificacion: string;
}

export interface OppRaMappingRequest {
  mappings: OppRaMapping[];
}

// Types para mappings EUR-ACE
export interface EurAceMapping {
  resultadoAprendizajeId: number;
  eurAceId: number;
  justificacion: string;
}

export interface EurAceMappingRequest {
  mappings: EurAceMapping[];
}

// Types para las respuestas
export interface MappingResponse {
  id: number;
  resultadoAprendizajeId: number;
  oppId?: number;
  eurAceId?: number;
  justificacion: string;
  fechaCreacion: string;
  fechaModificacion: string;
}

// Tipo para la respuesta batch del backend
export interface BatchMappingResponse {
  totalSolicitadas: number;
  exitosas: number;
  fallidas: number;
  errores?: string[];
  relacionesCreadas?: MappingResponse[];
}

// Tipo para el resultado de operaciones de mapping
export interface MappingOperationResult {
  success: boolean;
  data?: MappingResponse;
  error?: string;
}

export class MappingsService {
  // Crear mapping OPP-RA
  static async createOppRaMapping(mapping: OppRaMapping): Promise<MappingOperationResult> {
    try {
      const request: OppRaMappingRequest = {
        mappings: [mapping]
      };
      
      const response = await AuthService.authenticatedFetch('/api/mappings/opp-ra/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: BatchMappingResponse = await response.json();
      console.log('Respuesta batch mapping OPP-RA:', data);
      
      // Verificar si hubo errores
      if (data.fallidas > 0 && data.errores && data.errores.length > 0) {
        // Retornar error sin lanzar excepción
        return { success: false, error: data.errores[0] };
      }
      
      // Verificar si se crearon relaciones exitosamente
      if (data.exitosas > 0 && data.relacionesCreadas && data.relacionesCreadas.length > 0) {
        return { success: true, data: data.relacionesCreadas[0] };
      }
      
      // Si no hay relaciones creadas ni errores específicos
      return { success: false, error: 'No se pudo crear el mapping' };
    } catch (error) {
      console.error('Error creando mapping OPP-RA:', error);
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  }

  // Crear mapping EUR-ACE
  static async createEurAceMapping(mapping: EurAceMapping): Promise<MappingOperationResult> {
    try {
      const request: EurAceMappingRequest = {
        mappings: [mapping]
      };
      
      const response = await AuthService.authenticatedFetch('/api/mappings/eur-ace/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: BatchMappingResponse = await response.json();
      console.log('Respuesta batch mapping EUR-ACE:', data);
      
      // Verificar si hubo errores
      if (data.fallidas > 0 && data.errores && data.errores.length > 0) {
        // Retornar error sin lanzar excepción
        return { success: false, error: data.errores[0] };
      }
      
      // Verificar si se crearon relaciones exitosamente
      if (data.exitosas > 0 && data.relacionesCreadas && data.relacionesCreadas.length > 0) {
        return { success: true, data: data.relacionesCreadas[0] };
      }
      
      // Si no hay relaciones creadas ni errores específicos
      return { success: false, error: 'No se pudo crear el mapping' };
    } catch (error) {
      console.error('Error creando mapping EUR-ACE:', error);
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  }

  // Obtener mappings OPP-RA existentes
  static async getOppRaMappings(): Promise<MappingResponse[]> {
    try {
      const response = await AuthService.authenticatedFetch('/api/mappings/opp-ra', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo mappings OPP-RA:', error);
      throw error;
    }
  }

  // Obtener mappings EUR-ACE existentes para la matriz
  static async getEurAceMappings(carreraId?: number): Promise<MappingResponse[]> {
    try {
      // Usar carreraId por defecto 1 si no se proporciona
      const idCarrera = carreraId || 1;
      
      const response = await AuthService.authenticatedFetch(`/api/mappings/eur-ace/matrix/${idCarrera}`, {
        method: 'GET',
      });

      if (!response.ok) {
        console.error(`Error obteniendo mappings EUR-ACE: ${response.status} ${response.statusText}`);
        // En lugar de lanzar error, devolver array vacío para que la matriz pueda cargar
        return [];
      }

      const data = await response.json();
      
      // El nuevo endpoint devuelve un objeto con estructura: { mappings: [], ras: [], eurAceCriteria: [], ... }
      // Necesitamos extraer solo los mappings que tienen hasMapping: true y convertirlos al formato esperado
      if (data.mappings && Array.isArray(data.mappings)) {
        const transformedMappings = data.mappings
          .filter((mapping: any) => mapping.hasMapping)
          .map((mapping: any) => ({
            id: mapping.mappingId,
            resultadoAprendizajeId: mapping.raId,
            eurAceId: mapping.eurAceId,
            justificacion: mapping.justification || '',
            fechaCreacion: new Date().toISOString(), // Placeholder
            fechaModificacion: new Date().toISOString() // Placeholder
          }));
          
        return transformedMappings;
      }
      
      // Si no hay mappings o no es la estructura esperada, devolver array vacío
      return [];
    } catch (error) {
      console.error('Error obteniendo mappings EUR-ACE:', error);
      // En lugar de lanzar error, devolver array vacío para que la matriz pueda cargar
      return [];
    }
  }

  // Eliminar mapping
  static async deleteMapping(id: number): Promise<void> {
    try {
      const response = await AuthService.authenticatedFetch(`/api/mappings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error eliminando mapping:', error);
      throw error;
    }
  }

  // Actualizar mapping
  static async updateMapping(id: number, justificacion: string): Promise<MappingResponse> {
    try {
      const response = await AuthService.authenticatedFetch(`/api/mappings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ justificacion }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error actualizando mapping:', error);
      throw error;
    }
  }

  // ==================== RAA-RA Mappings ====================

  /**
   * Obtener mappings RAA-RA filtrados por carreraId y opcionalmente por nivel de aporte
   */
  static async getRaaRaMappings(carreraId?: number, nivelAporte?: 'Alto' | 'Medio' | 'Bajo'): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (carreraId) params.append('carreraId', carreraId.toString());
      if (nivelAporte) params.append('nivelAporte', nivelAporte);

      const url = `/api/mappings/raa-ra${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await AuthService.authenticatedFetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        console.error(`Error obteniendo mappings RAA-RA: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error obteniendo mappings RAA-RA:', error);
      return [];
    }
  }

  /**
   * Crear mapping RAA-RA (preparado para cuando se implemente el wizard)
   */
  static async createRaaRaMapping(mapping: {
    raaId: number;
    raId: number;
    nivelAporte: 'Alto' | 'Medio' | 'Bajo';
    justificacion?: string;
  }): Promise<MappingOperationResult> {
    try {
      // Transformar el payload para que coincida con lo que espera el backend
      const backendPayload = {
        raaId: mapping.raaId,
        resultadoAprendizajeId: mapping.raId,  // Backend espera "resultadoAprendizajeId", no "raId"
        nivelAporte: mapping.nivelAporte,
        justificacion: mapping.justificacion || '',
        estadoActivo: true  // Campo requerido por el backend
      };
      
      const response = await AuthService.authenticatedFetch('/api/mappings/raa-ra', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        return { success: false, error: errorData.error || errorData.message || 'Error al crear mapping' };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error creando mapping RAA-RA:', error);
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  }
}