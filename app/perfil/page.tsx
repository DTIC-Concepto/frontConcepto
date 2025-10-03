"use client";

import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import { ChevronDown, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { ProfileService, UserProfile, Permission } from "@/lib/profile";
import { ROLE_DISPLAY_NAMES, RoleType } from "@/lib/api";
import NotificationService from "@/lib/notifications";

export default function Perfil() {
  const [showPermissions, setShowPermissions] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [roleDescription, setRoleDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      
      // Obtener perfil del usuario
      const profile = await ProfileService.getUserProfile();
      setUserProfile(profile);

      // Obtener permisos del rol del usuario
      const permissionsList = await ProfileService.getUserPermissions(profile.rol);
      const permissionsWithDesc = await ProfileService.getPermissionsWithDescriptions(permissionsList);
      setUserPermissions(permissionsWithDesc);

      // Obtener descripción del rol
      const description = await ProfileService.getRoleDescription(profile.rol);
      setRoleDescription(description);

    } catch (error) {
      console.error('Error al cargar datos del perfil:', error);
      NotificationService.error(
        'Error al cargar perfil',
        'No se pudieron cargar los datos del perfil. Intenta nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Función helper para formatear fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Función helper para obtener color del rol
  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      'ADMINISTRADOR': 'bg-red-600',
      'DGIP': 'bg-purple-600',
      'DECANO': 'bg-[#003366]',
      'SUBDECANO': 'bg-blue-600',
      'JEFE_DEPARTAMENTO': 'bg-green-600',
      'COORDINADOR': 'bg-orange-600',
      'PROFESOR': 'bg-gray-600',
      'CEI': 'bg-indigo-600'
    };
    return roleColors[role] || 'bg-gray-600';
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-6xl">
            <h1 className="text-[#171A1F] font-montserrat text-2xl md:text-4xl font-bold">
              Mi Perfil
            </h1>
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <svg 
                  className="animate-spin h-8 w-8 text-[#003366]" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="text-[#565D6D] font-open-sans text-sm">Cargando perfil...</p>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!userProfile) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-6xl">
            <h1 className="text-[#171A1F] font-montserrat text-2xl md:text-4xl font-bold">
              Mi Perfil
            </h1>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-[#565D6D] font-open-sans text-lg">Error al cargar perfil</p>
                <p className="text-[#565D6D] font-open-sans text-sm mt-1">
                  No se pudieron cargar los datos del perfil
                </p>
                <button
                  onClick={loadProfileData}
                  className="mt-4 px-4 py-2 bg-[#003366] text-white rounded text-sm hover:bg-[#003366]/90 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
      <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-6xl">
        <h1 className="text-[#171A1F] font-montserrat text-2xl md:text-4xl font-bold">
          Mi Perfil
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded border border-white shadow-[0_0_2px_0_rgba(23,26,31,0.08),0_0_1px_0_rgba(23,26,31,0.05)] p-6">
            <h2 className="text-[#171A1F] font-montserrat text-xl font-semibold mb-6">
              Información Personal
            </h2>

            <div className="space-y-5">
              <div>
                <p className="text-[#565D6D] font-open-sans text-sm mb-1">
                  Nombre Completo:
                </p>
                <p className="text-[#171A1F] font-open-sans text-base">
                  {`${userProfile.nombres} ${userProfile.apellidos}`}
                </p>
              </div>

              <div>
                <p className="text-[#565D6D] font-open-sans text-sm mb-1">
                  Correo Institucional:
                </p>
                <p className="text-[#171A1F] font-open-sans text-base">
                  {userProfile.correo}
                </p>
              </div>

              <div>
                <p className="text-[#565D6D] font-open-sans text-sm mb-1">
                  Cédula:
                </p>
                <p className="text-[#171A1F] font-open-sans text-base">
                  {userProfile.cedula}
                </p>
              </div>

              {userProfile.facultadNombre && (
                <div>
                  <p className="text-[#565D6D] font-open-sans text-sm mb-1">
                    Facultad:
                  </p>
                  <p className="text-[#171A1F] font-open-sans text-base">
                    {userProfile.facultadNombre}
                  </p>
                </div>
              )}

              {userProfile.departamentoNombre && (
                <div>
                  <p className="text-[#565D6D] font-open-sans text-sm mb-1">
                    Departamento:
                  </p>
                  <p className="text-[#171A1F] font-open-sans text-base">
                    {userProfile.departamentoNombre}
                  </p>
                </div>
              )}

              {userProfile.telefono && (
                <div>
                  <p className="text-[#565D6D] font-open-sans text-sm mb-1">
                    Teléfono:
                  </p>
                  <p className="text-[#171A1F] font-open-sans text-base">
                    {userProfile.telefono}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[#565D6D] font-open-sans text-sm mb-1">
                  Fecha de Registro:
                </p>
                <p className="text-[#171A1F] font-open-sans text-base">
                  {formatDate(userProfile.fechaCreacion)}
                </p>
              </div>

              <div>
                <p className="text-[#565D6D] font-open-sans text-sm mb-1">
                  Estado:
                </p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    userProfile.estadoActivo
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {userProfile.estadoActivo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          {/* Roles and Permissions */}
          <div className="bg-white rounded border border-white shadow-[0_0_2px_0_rgba(23,26,31,0.08),0_0_1px_0_rgba(23,26,31,0.05)] p-6">
            <h2 className="text-[#171A1F] font-montserrat text-xl font-semibold mb-6">
              Rol y Permisos
            </h2>

            <div className="space-y-6">
              <div>
                <p className="text-[#565D6D] font-open-sans text-sm mb-3">
                  Rol Asignado:
                </p>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`${getRoleColor(userProfile.rol)} text-white px-4 py-1.5 rounded-full text-base font-semibold font-open-sans`}
                  >
                    {ROLE_DISPLAY_NAMES[userProfile.rol as RoleType] || userProfile.rol}
                  </span>
                </div>
                {roleDescription && (
                  <p className="text-[#565D6D] font-open-sans text-sm mt-2 italic">
                    {roleDescription}
                  </p>
                )}
              </div>

              <hr className="border-[#DEE1E6]" />

              <div>
                <button
                  onClick={() => setShowPermissions(!showPermissions)}
                  className="w-full flex items-center justify-between py-3 text-[#171A1F] font-montserrat text-base font-medium hover:bg-gray-50 rounded transition-colors"
                >
                  Ver Permisos Detallados ({userPermissions.length})
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showPermissions ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showPermissions && (
                  <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
                    {userPermissions.length > 0 ? (
                      userPermissions.map((permission, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                          <Lock className="w-4 h-4 text-[#003366] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[#171A1F] font-open-sans text-sm font-medium">
                              {permission.permiso}
                            </p>
                            <p className="text-[#565D6D] font-open-sans text-xs">
                              {permission.descripcion}
                            </p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                              {permission.categoria}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[#565D6D] font-open-sans text-sm italic">
                        No se encontraron permisos para este rol
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded border border-white shadow-[0_0_2px_0_rgba(23,26,31,0.08),0_0_1px_0_rgba(23,26,31,0.05)] p-6">
            <h2 className="text-[#171A1F] font-montserrat text-xl font-semibold mb-4">
              Cambiar Contraseña
            </h2>

            <p className="text-[#565D6D] font-open-sans text-sm mb-6">
              Mantenga su cuenta segura actualizando su contraseña regularmente.
            </p>

            <button 
              className="w-full px-4 py-2.5 bg-[#003366] text-white font-open-sans text-sm rounded hover:bg-[#003366]/90 transition-colors"
              onClick={() => setShowPasswordModal(true)}
            >
              Actualizar Contraseña
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal de Cambio de Contraseña */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </Layout>
    </ProtectedRoute>
  );
}