import { ReactNode } from 'react';
import { useRole } from '@/hooks/useRole';
import { RoleType } from '@/lib/api';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: RoleType[];
  fallback?: ReactNode;
  requireAll?: boolean;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback = null, 
  requireAll = false 
}: RoleGuardProps) {
  const { userRole, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userRole) {
    return fallback ? <>{fallback}</> : null;
  }

  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Acceso Restringido
          </h3>
          <p className="text-red-600">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}