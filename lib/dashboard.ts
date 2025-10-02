import { FacultiesService } from './faculties';
import { CareersService } from './careers';
import { UsersService } from './users';
import { AuthService } from './auth';
import { API_CONFIG, ActivityRecord } from './api';

export interface DashboardStats {
  totalFacultades: number;
  totalCarreras: number;
  usuariosActivos: number;
}

export class DashboardService {
  static async getStats(): Promise<DashboardStats> {
    try {
      // Hacer llamadas en paralelo para obtener todas las estadísticas
      const [faculties, careers, users] = await Promise.all([
        FacultiesService.getAllFaculties({ estadoActivo: true }),
        CareersService.getAllCareers({ estadoActivo: true }),
        UsersService.getUsers({ estadoActivo: true })
      ]);

      return {
        totalFacultades: faculties.length,
        totalCarreras: careers.length,
        usuariosActivos: users.length
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      // Retornar valores por defecto en caso de error
      return {
        totalFacultades: 0,
        totalCarreras: 0,
        usuariosActivos: 0
      };
    }
  }

  static async getRecentActivity(limit: number = 5): Promise<ActivityRecord[]> {
    try {
      const response = await AuthService.authenticatedFetch(API_CONFIG.ENDPOINTS.DASHBOARD_ACTIVITY, {
        method: 'GET',
      });

      if (!response.ok) {
        console.error('Error al obtener actividad reciente:', response.status);
        return [];
      }

      const data = await response.json();
      
      // Si el backend devuelve un array directamente
      let activities: ActivityRecord[] = [];
      if (Array.isArray(data)) {
        activities = data;
      } else if (data.activities && Array.isArray(data.activities)) {
        activities = data.activities;
      } else if (data.data && Array.isArray(data.data)) {
        activities = data.data;
      } else {
        console.warn('Estructura de actividad inesperada:', data);
        return [];
      }

      // Limitar a los primeros 'limit' registros
      return activities.slice(0, limit);
    } catch (error) {
      console.error('Error al obtener actividad reciente:', error);
      return [];
    }
  }

  static formatStatValue(value: number): string {
    // Formatear números grandes si es necesario
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }
}