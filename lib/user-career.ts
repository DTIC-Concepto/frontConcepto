import { AuthService } from './auth';

export interface UserCareerInfo {
  carreraId: number | null;
  carreraNombre: string | null;
  facultadId: number | null;
  facultadNombre: string | null;
  puedeCrearObjetivos: boolean;
  puedeCrearResultados: boolean;
  puedeCrearCriterios: boolean;
}

export class UserCareerService {
  /**
   * Obtiene la información de carrera del usuario autenticado
   */
  static getUserCareerInfo(): UserCareerInfo {
    try {
      // Verificar que estemos en el cliente
      if (typeof window === 'undefined') {
        return this.getDefaultCareerInfo();
      }

      const authUser = localStorage.getItem('auth_user');
      if (!authUser) {
        return this.getDefaultCareerInfo();
      }

      const user = JSON.parse(authUser);
      const userRole = user.rol;

      console.log('Usuario desde localStorage:', user);
      console.log('Rol detectado:', userRole);

      return {
        carreraId: user.carreraId || null,
        carreraNombre: user.carreraNombre || null,
        facultadId: user.facultadId || null,
        facultadNombre: user.facultadNombre || null,
        puedeCrearObjetivos: userRole === 'COORDINADOR',
        puedeCrearResultados: userRole === 'CEI',
        puedeCrearCriterios: userRole === 'CEI'
      };
    } catch (error) {
      console.error('Error obteniendo información de carrera del usuario:', error);
      return this.getDefaultCareerInfo();
    }
  }

  /**
   * Verifica si el usuario puede crear objetivos de programa
   */
  static canCreateProgramObjectives(): boolean {
    const careerInfo = this.getUserCareerInfo();
    // Para testing, permitir sin verificar carreraId
    return careerInfo.puedeCrearObjetivos;
  }

  /**
   * Verifica si el usuario puede crear resultados de aprendizaje
   */
  static canCreateLearningOutcomes(): boolean {
    const careerInfo = this.getUserCareerInfo();
    // Para testing, permitir sin verificar carreraId
    return careerInfo.puedeCrearResultados;
  }

  /**
   * Verifica si el usuario puede crear criterios EUR-ACE
   */
  static canCreateEurAceCriteria(): boolean {
    const careerInfo = this.getUserCareerInfo();
    return careerInfo.puedeCrearCriterios;
  }

  /**
   * Obtiene el ID de carrera del usuario para usar en los POST
   */
  static getUserCarreraId(): number | null {
    const careerInfo = this.getUserCareerInfo();
    return careerInfo.carreraId;
  }

  /**
   * Genera un mensaje de error cuando el usuario no tiene carrera asignada
   */
  static getNoCareerMessage(action: 'objetivos' | 'resultados'): string {
    const user = this.getUserCareerInfo();
    
    if (action === 'objetivos') {
      return 'No puedes crear objetivos de programa porque no tienes una carrera asignada. Contacta al administrador para asignar tu carrera.';
    } else {
      return 'No puedes crear resultados de aprendizaje porque no tienes una carrera asignada. Contacta al administrador para asignar tu carrera.';
    }
  }

  private static getDefaultCareerInfo(): UserCareerInfo {
    return {
      carreraId: null,
      carreraNombre: null,
      facultadId: null,
      facultadNombre: null,
      puedeCrearObjetivos: false,
      puedeCrearResultados: false,
      puedeCrearCriterios: false
    };
  }
}