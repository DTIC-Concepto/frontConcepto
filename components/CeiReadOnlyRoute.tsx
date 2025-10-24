"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import NotificationService from '@/lib/notifications';

interface CeiReadOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que permite acceso de solo lectura a COORDINADOR y CEI
 * Utilizado para páginas donde CEI puede VER pero no CREAR/EDITAR
 */
export default function CeiReadOnlyRoute({ children }: CeiReadOnlyRouteProps) {
  const { user, isAuthenticated } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    // Si está autenticado pero no es COORDINADOR ni CEI, mostrar error y redirigir
    if (user && user.role !== 'COORDINADOR' && user.role !== 'CEI') {
      NotificationService.error(
        "Acceso Denegado",
        "No tienes permisos para acceder a esta sección."
      );
      router.push('/dashboard');
      return;
    }
  }, [user, isAuthenticated, router]);

  // Solo renderizar el contenido si el usuario es COORDINADOR o CEI
  if (!isAuthenticated || !user || (user.role !== 'COORDINADOR' && user.role !== 'CEI')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
          <p className="text-[#565D6D] text-sm">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
