export interface Role {
  rol: string;
  descripcion: string;
  permisos: string[];
  nivelAutoridad: number;
  categoria: string;
  activo: boolean;
}

export interface Permission {
  permiso: string;
  descripcion: string;
  categoria: string;
}

export interface UserProfile {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  cedula: string;
  telefono?: string;
  rol: string;
  estadoActivo: boolean;
  fechaCreacion: string;
  facultadNombre?: string;
  departamentoNombre?: string;
}

export interface RolesResponse {
  roles: Role[];
  totalRoles: number;
  sistemaMultiRol: boolean;
}

export interface PermissionsResponse {
  permisos: Permission[];
  totalPermisos: number;
  categorias: string[];
}

export class ProfileService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('auth_token'); // Usar la clave correcta
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  static async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await fetch('/api/usuarios/me', {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      // Si el endpoint no está disponible, usar datos del localStorage
      if (!response.ok && (response.status === 404 || response.status === 503)) {
        console.warn('Endpoint /usuarios/me no disponible, usando datos locales...');
        return this.getUserProfileFromLocalStorage();
      }

      if (!response.ok) {
        throw new Error(`Error al obtener perfil: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Error al obtener perfil del backend, usando datos locales:', error);
      return this.getUserProfileFromLocalStorage();
    }
  }

  // Método fallback para obtener datos del usuario desde localStorage
  private static getUserProfileFromLocalStorage(): UserProfile {
    try {
      // Usar las claves correctas del AuthService
      const userData = localStorage.getItem('auth_user');
      const token = localStorage.getItem('auth_token');
      
      if (!userData && !token) {
        console.warn('No hay datos de usuario disponibles, usando valores por defecto');
        return this.getDefaultUserProfile();
      }

      let user: any = {};
      let userRole = 'PROFESOR'; // rol por defecto

      // Si hay datos de usuario, parsearlos
      if (userData) {
        try {
          user = JSON.parse(userData);
          userRole = user.rol || user.role || 'PROFESOR';
        } catch (parseError) {
          console.warn('Error al parsear datos de usuario:', parseError);
        }
      }

      // Si hay token pero no datos de usuario, decodificar el token (básico)
      if (token && !userData) {
        try {
          // Decodificar JWT básico (solo para obtener info, no validar)
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            user = {
              id: payload.sub || payload.userId || 0,
              nombres: payload.nombres || payload.name || 'Usuario',
              apellidos: payload.apellidos || payload.lastName || '',
              correo: payload.correo || payload.email || payload.username || 'usuario@epn.edu.ec',
              rol: payload.rol || payload.role || 'PROFESOR',
              cedula: payload.cedula || payload.identification || 'No disponible'
            };
            userRole = user.rol;
          }
        } catch (tokenError) {
          console.warn('Error al decodificar token:', tokenError);
        }
      }
      
      // Crear un objeto UserProfile con los datos disponibles
      return {
        id: user.id || 0,
        nombres: user.nombres || user.name?.split(' ')[0] || 'Usuario',
        apellidos: user.apellidos || user.name?.split(' ').slice(1).join(' ') || '',
        correo: user.correo || user.email || user.username || 'usuario@epn.edu.ec',
        cedula: user.cedula || user.identification || 'No disponible',
        telefono: user.telefono || user.phone || undefined,
        rol: userRole,
        estadoActivo: user.estadoActivo !== undefined ? user.estadoActivo : true,
        fechaCreacion: user.fechaCreacion || user.createdAt || new Date().toISOString(),
        facultadNombre: user.facultadNombre || user.faculty || undefined,
        departamentoNombre: user.departamentoNombre || user.department || undefined,
      };
    } catch (error) {
      console.error('Error al obtener datos del localStorage:', error);
      return this.getDefaultUserProfile();
    }
  }

  // Datos por defecto si no hay información disponible
  private static getDefaultUserProfile(): UserProfile {
    return {
      id: 0,
      nombres: 'Usuario',
      apellidos: 'Demo',
      correo: 'usuario@epn.edu.ec',
      cedula: 'No disponible',
      rol: 'PROFESOR',
      estadoActivo: true,
      fechaCreacion: new Date().toISOString(),
    };
  }

  static async getRoles(): Promise<RolesResponse> {
    try {
      const response = await fetch('/api/roles', {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        console.warn('Endpoint /roles no disponible, usando datos de fallback...');
        return this.getDefaultRoles();
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Error al obtener roles del backend, usando datos de fallback:', error);
      return this.getDefaultRoles();
    }
  }

  // Datos de roles por defecto
  private static getDefaultRoles(): RolesResponse {
    const roles: Role[] = [
      {
        rol: "ADMINISTRADOR",
        descripcion: "Administrador del sistema con acceso completo a todas las funcionalidades",
        permisos: ["manage_users", "create_users", "update_users", "delete_users", "manage_faculties", "create_faculties", "update_faculties", "manage_careers", "create_careers", "update_careers", "view_all_dashboards", "generate_all_reports", "manage_system_settings"],
        nivelAutoridad: 10,
        categoria: "Administración",
        activo: true
      },
      {
        rol: "DGIP",
        descripcion: "Director General de Investigación y Posgrado",
        permisos: ["view_all_dashboards", "generate_all_reports", "manage_research_programs", "oversee_postgraduate"],
        nivelAutoridad: 9,
        categoria: "Dirección",
        activo: true
      },
      {
        rol: "DECANO",
        descripcion: "Decano de facultad con autoridad sobre su facultad específica",
        permisos: ["manage_faculty_careers", "create_careers", "update_careers", "manage_faculty_users", "assign_coordinators", "assign_department_heads", "view_faculty_dashboard", "generate_faculty_reports"],
        nivelAutoridad: 8,
        categoria: "Gestión Académica",
        activo: true
      },
      {
        rol: "SUBDECANO",
        descripcion: "Subdecano con autoridad delegada en la facultad",
        permisos: ["assist_dean", "manage_faculty_operations", "view_faculty_dashboard", "generate_faculty_reports"],
        nivelAutoridad: 7,
        categoria: "Gestión Académica",
        activo: true
      },
      {
        rol: "JEFE_DEPARTAMENTO",
        descripcion: "Jefe de departamento con gestión sobre área específica",
        permisos: ["manage_department", "view_department_dashboard", "generate_department_reports"],
        nivelAutoridad: 6,
        categoria: "Gestión Departamental",
        activo: true
      },
      {
        rol: "COORDINADOR",
        descripcion: "Coordinador de carrera específica",
        permisos: ["manage_career", "view_career_dashboard", "manage_career_curriculum", "generate_career_reports"],
        nivelAutoridad: 5,
        categoria: "Coordinación",
        activo: true
      },
      {
        rol: "PROFESOR",
        descripcion: "Profesor con funciones académicas básicas",
        permisos: ["view_profile", "access_teaching_materials", "submit_grades", "view_courses"],
        nivelAutoridad: 3,
        categoria: "Académico",
        activo: true
      },
      {
        rol: "CEI",
        descripcion: "Comité de Ética de la Investigación",
        permisos: ["review_ethics", "approve_research", "view_research_dashboard"],
        nivelAutoridad: 4,
        categoria: "Ética y Investigación",
        activo: true
      }
    ];

    return {
      roles,
      totalRoles: roles.length,
      sistemaMultiRol: true
    };
  }

  static async getPermissions(): Promise<PermissionsResponse> {
    try {
      const response = await fetch('/api/roles/permissions', {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        console.warn('Endpoint /roles/permissions no disponible, usando datos de fallback...');
        return this.getDefaultPermissions();
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Error al obtener permisos del backend, usando datos de fallback:', error);
      return this.getDefaultPermissions();
    }
  }

  // Permisos por defecto
  private static getDefaultPermissions(): PermissionsResponse {
    const permisos: Permission[] = [
      { permiso: "manage_users", descripcion: "Gestionar usuarios del sistema (crear, actualizar, eliminar)", categoria: "Gestión de Usuarios" },
      { permiso: "create_users", descripcion: "Crear nuevos usuarios en el sistema", categoria: "Gestión de Usuarios" },
      { permiso: "update_users", descripcion: "Actualizar información de usuarios existentes", categoria: "Gestión de Usuarios" },
      { permiso: "delete_users", descripcion: "Eliminar usuarios del sistema", categoria: "Gestión de Usuarios" },
      { permiso: "manage_faculties", descripcion: "Gestionar facultades del sistema", categoria: "Gestión Académica" },
      { permiso: "create_faculties", descripcion: "Crear nuevas facultades en el sistema", categoria: "Gestión Académica" },
      { permiso: "update_faculties", descripcion: "Actualizar información de facultades", categoria: "Gestión Académica" },
      { permiso: "manage_careers", descripcion: "Gestionar carreras académicas", categoria: "Gestión Académica" },
      { permiso: "create_careers", descripcion: "Crear nuevas carreras académicas", categoria: "Gestión Académica" },
      { permiso: "update_careers", descripcion: "Actualizar información de carreras", categoria: "Gestión Académica" },
      { permiso: "view_all_dashboards", descripcion: "Acceso a todos los dashboards del sistema", categoria: "Dashboards" },
      { permiso: "view_faculty_dashboard", descripcion: "Acceso al dashboard de facultad", categoria: "Dashboards" },
      { permiso: "view_career_dashboard", descripcion: "Acceso al dashboard de carrera", categoria: "Dashboards" },
      { permiso: "view_department_dashboard", descripcion: "Acceso al dashboard de departamento", categoria: "Dashboards" },
      { permiso: "generate_all_reports", descripcion: "Generar todos los reportes del sistema", categoria: "Reportes" },
      { permiso: "generate_faculty_reports", descripcion: "Generar reportes de facultad", categoria: "Reportes" },
      { permiso: "generate_career_reports", descripcion: "Generar reportes de carrera", categoria: "Reportes" },
      { permiso: "generate_department_reports", descripcion: "Generar reportes de departamento", categoria: "Reportes" },
      { permiso: "manage_system_settings", descripcion: "Gestionar configuración del sistema", categoria: "Sistema" },
      { permiso: "view_profile", descripcion: "Ver y gestionar perfil personal", categoria: "Perfil" },
      { permiso: "access_teaching_materials", descripcion: "Acceder a materiales de enseñanza", categoria: "Académico" },
      { permiso: "submit_grades", descripcion: "Enviar calificaciones de estudiantes", categoria: "Académico" },
      { permiso: "view_courses", descripcion: "Ver cursos asignados", categoria: "Académico" },
      { permiso: "manage_career_curriculum", descripcion: "Gestionar currícula de carrera", categoria: "Coordinación" },
      { permiso: "review_ethics", descripcion: "Revisar aspectos éticos de investigación", categoria: "Ética y Investigación" },
      { permiso: "approve_research", descripcion: "Aprobar proyectos de investigación", categoria: "Ética y Investigación" },
    ];

    const categorias = Array.from(new Set(permisos.map(p => p.categoria)));

    return {
      permisos,
      totalPermisos: permisos.length,
      categorias
    };
  }

  // Función helper para obtener los permisos del rol actual del usuario
  static async getUserPermissions(userRole: string): Promise<string[]> {
    try {
      const rolesData = await this.getRoles();
      const userRoleData = rolesData.roles.find(role => role.rol === userRole);
      return userRoleData?.permisos || [];
    } catch (error) {
      console.error('Error en getUserPermissions:', error);
      return [];
    }
  }

  // Función helper para obtener descripción del rol
  static async getRoleDescription(roleName: string): Promise<string> {
    try {
      const rolesData = await this.getRoles();
      const roleData = rolesData.roles.find(role => role.rol === roleName);
      return roleData?.descripcion || 'Sin descripción';
    } catch (error) {
      console.error('Error en getRoleDescription:', error);
      return 'Sin descripción';
    }
  }

  // Función helper para obtener permisos con descripciones
  static async getPermissionsWithDescriptions(permissionsList: string[]): Promise<Permission[]> {
    try {
      const permissionsData = await this.getPermissions();
      return permissionsData.permisos.filter(permission => 
        permissionsList.includes(permission.permiso)
      );
    } catch (error) {
      console.error('Error en getPermissionsWithDescriptions:', error);
      return [];
    }
  }
}
