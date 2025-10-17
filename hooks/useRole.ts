import { useEffect, useState } from 'react';
import { RoleType } from '@/lib/api';
import { ProfileService, UserProfileWithRoles } from '@/lib/profile';

interface UseRoleReturn {
  userRole: RoleType | null;
  userProfile: UserProfileWithRoles | null;
  isAdmin: boolean;
  isProfesor: boolean;
  isCEI: boolean;
  isCoordinador: boolean;
  hasRole: (role: RoleType) => boolean;
  hasAnyRole: (roles: RoleType[]) => boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useRole(): UseRoleReturn {
  const [userRole, setUserRole] = useState<RoleType | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileWithRoles | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Intentar obtener perfil completo con roles
      try {
        const profileWithRoles = await ProfileService.getUserProfileWithRoles();
        setUserProfile(profileWithRoles);
        setUserRole(profileWithRoles.rolPrincipal as RoleType);
      } catch (error) {
        console.warn('Error obteniendo perfil completo, usando datos básicos:', error);
        // Fallback: usar datos del localStorage
        const authUser = localStorage.getItem('auth_user');
        if (authUser) {
          const user = JSON.parse(authUser);
          setUserRole(user.rol as RoleType);
        }
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const isAdmin = userRole === 'ADMINISTRADOR';
  const isProfesor = userRole === 'PROFESOR';
  const isCEI = userRole === 'CEI';
  const isCoordinador = userRole === 'COORDINADOR';

  const hasRole = (role: RoleType): boolean => {
    if (userProfile?.roles) {
      return ProfileService.hasRole(userProfile.roles, role);
    }
    return userRole === role;
  };

  const hasAnyRole = (roles: RoleType[]): boolean => {
    if (userProfile?.roles) {
      return ProfileService.hasAnyRole(userProfile.roles, roles);
    }
    return userRole ? roles.includes(userRole) : false;
  };

  return {
    userRole,
    userProfile,
    isAdmin,
    isProfesor,
    isCEI,
    isCoordinador,
    hasRole,
    hasAnyRole,
    isLoading,
    refresh: loadUserData
  };
}