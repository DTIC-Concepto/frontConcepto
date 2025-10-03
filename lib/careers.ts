import { API_CONFIG, Career, CreateCareerRequest, CareerFilters } from './api';
import { AuthService } from './auth';
import { UsersService } from './users';
import { FacultiesService } from './faculties';

export class CareersService {
  static async getAllCareers(filters?: CareerFilters): Promise<Career[]> {
    const urlParams = new URLSearchParams();
    
    if (filters) {
      if (filters.facultadId) urlParams.append('facultadId', filters.facultadId);
      if (filters.estadoActivo !== undefined) urlParams.append('estadoActivo', filters.estadoActivo.toString());
      if (filters.search) urlParams.append('search', filters.search);
      if (filters.modalidad) urlParams.append('modalidad', filters.modalidad);
      if (filters.duracionMin) urlParams.append('duracionMin', filters.duracionMin.toString());
      if (filters.duracionMax) urlParams.append('duracionMax', filters.duracionMax.toString());
      if (filters.page) urlParams.append('page', filters.page.toString());
      if (filters.limit) urlParams.append('limit', filters.limit.toString());
    }

    const url = `${API_CONFIG.ENDPOINTS.CARRERAS}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
    
    try {
      const response = await AuthService.authenticatedFetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al obtener carreras');
      }

      const data = await response.json();
      
      // El backend devuelve { data: [...], pagination: {...} }
      let careers: Career[] = [];
      if (data.data && Array.isArray(data.data)) {
        careers = data.data;
      } else if (Array.isArray(data)) {
        careers = data;
      } else if (data.carreras && Array.isArray(data.carreras)) {
        careers = data.carreras;
      } else if (data.items && Array.isArray(data.items)) {
        careers = data.items;
      } else {
        console.warn('Estructura de respuesta inesperada:', data);
        return [];
      }

      // Enriquecer con información de facultad y coordinador
      const enrichedCareers = await this.enrichCareersWithRelations(careers);
      return enrichedCareers;
      
    } catch (error) {
      console.error('Error al obtener carreras:', error);
      throw error;
    }
  }

  static async enrichCareersWithRelations(careers: Career[]): Promise<Career[]> {
    try {
      // Como el backend ya devuelve facultad y coordinador anidados, no necesitamos hacer llamadas adicionales
      return careers.map(career => {
        // El backend devuelve facultad y coordinador como objetos anidados
        const facultadNombre = (career as any).facultad?.nombre || 'Facultad no encontrada';
        const coordinadorNombre = (career as any).coordinador ? 
          `${(career as any).coordinador.nombres} ${(career as any).coordinador.apellidos}` : 
          'Sin asignar';
        
        // También extraemos los IDs para mantener compatibilidad
        const facultadId = (career as any).facultad?.id || career.facultadId;
        const coordinadorId = (career as any).coordinador?.id || career.coordinadorId;
        
        return {
          ...career,
          facultadId,
          coordinadorId,
          facultadNombre,
          coordinadorNombre
        };
      });
    } catch (error) {
      console.error('Error al enriquecer carreras con relaciones:', error);
      // Si hay error, retornar las carreras con valores por defecto
      return careers.map(career => ({
        ...career,
        facultadNombre: 'Facultad no encontrada',
        coordinadorNombre: 'Sin asignar'
      }));
    }
  }

  static async createCareer(careerData: CreateCareerRequest): Promise<Career> {
    try {
      // Validar datos antes de enviar
      const validationError = this.validateCareerData(careerData);
      if (validationError) {
        throw new Error(validationError);
      }

      const response = await AuthService.authenticatedFetch(API_CONFIG.ENDPOINTS.CARRERAS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(careerData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al crear carrera');
      }

      const newCareer = await response.json();
      return newCareer;
      
    } catch (error) {
      console.error('Error al crear carrera:', error);
      throw error;
    }
  }

  static validateCareerData(data: CreateCareerRequest): string | null {
    if (!data.codigo?.trim()) {
      return 'El código es requerido';
    }
    
    if (data.codigo.length < 2 || data.codigo.length > 20) {
      return 'El código debe tener entre 2 y 20 caracteres';
    }

    if (!data.nombre?.trim()) {
      return 'El nombre es requerido';
    }
    
    if (data.nombre.length < 5 || data.nombre.length > 200) {
      return 'El nombre debe tener entre 5 y 200 caracteres';
    }

    if (!data.facultadId || data.facultadId <= 0) {
      return 'La facultad es requerida';
    }

    if (!data.coordinadorId || data.coordinadorId <= 0) {
      return 'El coordinador es requerido';
    }

    if (!data.duracion || data.duracion < 1 || data.duracion > 20) {
      return 'La duración debe ser entre 1 y 20 semestres';
    }

    if (!data.modalidad || !['PRESENCIAL', 'VIRTUAL', 'SEMIPRESENCIAL'].includes(data.modalidad)) {
      return 'La modalidad es requerida';
    }

    return null;
  }

  static formatCareerForDisplay(career: Career): Career {
    return {
      ...career,
      codigo: career.codigo?.toUpperCase() || '',
      nombre: career.nombre?.trim() || '',
      modalidad: career.modalidad || 'PRESENCIAL',
      estadoActivo: career.estadoActivo ?? true,
    };
  }

  static filterCareers(careers: Career[], filters: CareerFilters): Career[] {
    return careers.filter(career => {
      // Filtro por búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          career.codigo?.toLowerCase().includes(searchLower) ||
          career.nombre?.toLowerCase().includes(searchLower) ||
          career.facultadNombre?.toLowerCase().includes(searchLower) ||
          career.coordinadorNombre?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) {
          return false;
        }
      }

      // Filtro por facultad
      if (filters.facultadId && career.facultadId && career.facultadId.toString() !== filters.facultadId) {
        return false;
      }

      // Filtro por estado activo
      if (filters.estadoActivo !== undefined && career.estadoActivo !== filters.estadoActivo) {
        return false;
      }

      // Filtro por modalidad
      if (filters.modalidad && career.modalidad !== filters.modalidad) {
        return false;
      }

      // Filtro por duración mínima
      if (filters.duracionMin && career.duracion < filters.duracionMin) {
        return false;
      }

      // Filtro por duración máxima
      if (filters.duracionMax && career.duracion > filters.duracionMax) {
        return false;
      }

      return true;
    });
  }

  // Función para obtener el conteo de carreras por facultad
  static async getCareerCountByFaculty(): Promise<Record<number, number>> {
    try {
      // Hacer llamada directa al backend para evitar bucles
      const response = await AuthService.authenticatedFetch(`${API_CONFIG.ENDPOINTS.CARRERAS}?estadoActivo=true`);
      
      if (!response.ok) {
        return {};
      }

      const data = await response.json();
      
      // Parsear los datos igual que en getAllCareers
      let careers: Career[] = [];
      if (Array.isArray(data)) {
        careers = data;
      } else if (data.carreras && Array.isArray(data.carreras)) {
        careers = data.carreras;
      } else if (data.items && Array.isArray(data.items)) {
        careers = data.items;
      } else if (data.data && Array.isArray(data.data)) {
        careers = data.data;
      }
      
      const countByFaculty: Record<number, number> = {};
      
      careers.forEach(career => {
        const facultyId = Number(career.facultadId);
        if (facultyId) {
          countByFaculty[facultyId] = (countByFaculty[facultyId] || 0) + 1;
        }
      });
      
      return countByFaculty;
    } catch (error) {
      console.error('Error al obtener conteo de carreras por facultad:', error);
      return {};
    }
  }
}