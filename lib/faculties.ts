import { API_CONFIG, Faculty, CreateFacultyRequest, FacultyFilters } from './api';
import { AuthService } from './auth';
import { UsersService } from './users';

export class FacultiesService {
  static async getAllFaculties(filters?: FacultyFilters): Promise<Faculty[]> {
    const urlParams = new URLSearchParams();
    
    if (filters) {
      if (filters.search) {
        urlParams.append('search', filters.search);
      }
      if (filters.estadoActivo !== undefined) {
        urlParams.append('estadoActivo', filters.estadoActivo.toString());
      }
    }

    const url = `${API_CONFIG.ENDPOINTS.FACULTADES}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
    
    try {
      const response = await AuthService.authenticatedFetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al obtener facultades');
      }

      const data = await response.json();
      
      // Si el backend retorna un array directamente
      let faculties: Faculty[] = [];
      if (Array.isArray(data)) {
        faculties = data;
      } else if (data.facultades && Array.isArray(data.facultades)) {
        faculties = data.facultades;
      } else if (data.items && Array.isArray(data.items)) {
        faculties = data.items;
      } else if (data.data && Array.isArray(data.data)) {
        faculties = data.data;
      } else {
        console.warn('Estructura de respuesta inesperada:', data);
        return [];
      }

      // Enriquecer con información del decano y contador de carreras
      const enrichedFaculties = await this.enrichFacultiesWithRelations(faculties);
      return enrichedFaculties;
      
    } catch (error) {
      console.error('Error al obtener facultades:', error);
      throw error;
    }
  }

  static async enrichFacultiesWithRelations(faculties: Faculty[]): Promise<Faculty[]> {
    try {
      // Obtener usuarios con rol DECANO y contador de carreras en paralelo
      const [users, careerCounts] = await Promise.all([
        UsersService.getUsers({ rol: 'DECANO' }),
        this.getCareerCounts()
      ]);
      
      return faculties.map(faculty => {
        // Buscar el decano de esta facultad
        const decano = users.find(user => String(user.facultadId) === String(faculty.id));
        
        return {
          ...faculty,
          carreras: careerCounts[faculty.id || 0] || 0,
          decano: decano ? `${decano.nombres} ${decano.apellidos}` : 'Sin asignar'
        };
      });
    } catch (error) {
      console.error('Error al enriquecer facultades con relaciones:', error);
      // Si hay error, retornar las facultades con valores por defecto
      return faculties.map(faculty => ({
        ...faculty,
        carreras: 0,
        decano: 'Sin asignar'
      }));
    }
  }

  static async getCareerCounts(): Promise<Record<number, number>> {
    try {
      // Hacer llamada directa al backend para obtener carreras activas
      const response = await AuthService.authenticatedFetch(`${API_CONFIG.ENDPOINTS.CARRERAS}?estadoActivo=true`);
      
      if (!response.ok) {
        return {};
      }

      const data = await response.json();
      
      // Parsear los datos igual que en CareersService
      let careers: any[] = [];
      if (data.data && Array.isArray(data.data)) {
        careers = data.data;
      } else if (Array.isArray(data)) {
        careers = data;
      }
      
      const countByFaculty: Record<number, number> = {};
      
      careers.forEach(career => {
        const facultyId = career.facultad?.id || career.facultadId;
        if (facultyId) {
          const id = Number(facultyId);
          countByFaculty[id] = (countByFaculty[id] || 0) + 1;
        }
      });
      
      return countByFaculty;
    } catch (error) {
      console.error('Error al obtener contadores de carreras:', error);
      return {};
    }
  }

  static async createFaculty(facultyData: CreateFacultyRequest): Promise<Faculty> {
    try {
      // Validar datos antes de enviar
      const validationError = this.validateFacultyData(facultyData);
      if (validationError) {
        throw new Error(validationError);
      }

      const response = await AuthService.authenticatedFetch(API_CONFIG.ENDPOINTS.FACULTADES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...facultyData,
          estadoActivo: facultyData.estadoActivo ?? true // Default a true si no se especifica
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al crear facultad');
      }

      const newFaculty = await response.json();
      return newFaculty;
      
    } catch (error) {
      console.error('Error al crear facultad:', error);
      throw error;
    }
  }

  static validateFacultyData(data: CreateFacultyRequest): string | null {
    if (!data.codigo?.trim()) {
      return 'El código es requerido';
    }
    
    if (data.codigo.length < 2 || data.codigo.length > 10) {
      return 'El código debe tener entre 2 y 10 caracteres';
    }

    if (!data.nombre?.trim()) {
      return 'El nombre es requerido';
    }
    
    if (data.nombre.length < 3 || data.nombre.length > 200) {
      return 'El nombre debe tener entre 3 y 200 caracteres';
    }

    if (!data.descripcion?.trim()) {
      return 'La descripción es requerida';
    }
    
    if (data.descripcion.length < 10 || data.descripcion.length > 500) {
      return 'La descripción debe tener entre 10 y 500 caracteres';
    }

    return null;
  }

  static formatFacultyForDisplay(faculty: Faculty): Faculty {
    return {
      ...faculty,
      codigo: faculty.codigo?.toUpperCase() || '',
      nombre: faculty.nombre?.trim() || '',
      descripcion: faculty.descripcion?.trim() || '',
      estadoActivo: faculty.estadoActivo ?? true,
    };
  }

  static filterFaculties(faculties: Faculty[], filters: FacultyFilters): Faculty[] {
    return faculties.filter(faculty => {
      // Filtro por búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          faculty.codigo?.toLowerCase().includes(searchLower) ||
          faculty.nombre?.toLowerCase().includes(searchLower) ||
          faculty.descripcion?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) {
          return false;
        }
      }

      // Filtro por estado activo
      if (filters.estadoActivo !== undefined) {
        if (faculty.estadoActivo !== filters.estadoActivo) {
          return false;
        }
      }

      return true;
    });
  }
}