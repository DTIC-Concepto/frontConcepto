"use client";

import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import NewUserModal from "@/components/NewUserModal";
import { Search, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { User, UserFilters, VALID_ROLES, ROLE_DISPLAY_NAMES, RoleType } from "@/lib/api";
import { UsersService } from "@/lib/users";
import NotificationService from "@/lib/notifications";

export default function Usuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados de filtros
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    rol: undefined,
    estadoActivo: undefined,
  });

  // Cargar usuarios desde el backend
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const userData = await UsersService.getUsers();
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      NotificationService.error(
        'Error al cargar usuarios',
        'No se pudieron cargar los usuarios. Intenta nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Aplicar filtros localmente (para mejor UX)
  const applyFilters = () => {
    let filtered = [...users];

    // Filtro de búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.nombres.toLowerCase().includes(searchLower) ||
        user.apellidos.toLowerCase().includes(searchLower) ||
        user.correo.toLowerCase().includes(searchLower) ||
        user.cedula.includes(filters.search!)
      );
    }

    // Filtro de rol
    if (filters.rol) {
      filtered = filtered.filter(user => user.rol === filters.rol);
    }

    // Filtro de estado
    if (filters.estadoActivo !== undefined) {
      filtered = filtered.filter(user => user.estadoActivo === filters.estadoActivo);
    }

    setFilteredUsers(filtered);
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [filters, users]);

  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  };

  const handleUserCreated = () => {
    loadUsers(); // Recargar la lista después de crear un usuario
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-[#171A1F] font-montserrat text-2xl md:text-4xl font-bold">
              Gestión de Usuarios
            </h1>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#003366] text-white font-open-sans text-sm rounded-md hover:bg-[#003366]/90 transition-colors whitespace-nowrap shadow-sm"
            >
              + Nuevo Usuario
            </button>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-md border border-[#DEE1E6] p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#565D6D]" />
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-[#DEE1E6] bg-white text-sm text-[#171A1F] placeholder:text-[#565D6D] focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] shadow-sm"
                />
              </div>

              {/* Filtro de Rol */}
              <select 
                value={filters.rol || ''}
                onChange={(e) => handleFilterChange('rol', e.target.value)}
                className="px-3 py-2 rounded-md border border-[#DEE1E6] bg-white text-[#171A1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] shadow-sm"
              >
                <option value="">Todos los Roles</option>
                {VALID_ROLES.map(role => (
                  <option key={role} value={role}>
                    {ROLE_DISPLAY_NAMES[role]}
                  </option>
                ))}
              </select>

              {/* Filtro de Estado */}
              <select 
                value={filters.estadoActivo === undefined ? '' : filters.estadoActivo.toString()}
                onChange={(e) => handleFilterChange('estadoActivo', e.target.value === '' ? undefined : e.target.value === 'true')}
                className="px-3 py-2 rounded-md border border-[#DEE1E6] bg-white text-[#171A1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] shadow-sm"
              >
                <option value="">Todos los Estados</option>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Tabla de Usuarios */}
          <div className="bg-white rounded-md border border-white shadow-[0_0_2px_0_rgba(23,26,31,0.08),0_0_1px_0_rgba(23,26,31,0.05)] overflow-hidden">
            {isLoading ? (
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
                  <p className="text-[#565D6D] font-open-sans text-sm">Cargando usuarios...</p>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-[#565D6D] font-open-sans text-lg">No se encontraron usuarios</p>
                  <p className="text-[#565D6D] font-open-sans text-sm mt-1">
                    {users.length === 0 ? 'No hay usuarios registrados' : 'Intenta con otros filtros'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F3F4F6]/50">
                      <th className="text-left px-4 py-3.5 text-[#565D6D] font-open-sans text-sm font-normal">
                        Cédula
                      </th>
                      <th className="text-left px-4 py-3.5 text-[#565D6D] font-open-sans text-sm font-normal">
                        Nombre Completo
                      </th>
                      <th className="text-left px-4 py-3.5 text-[#565D6D] font-open-sans text-sm font-normal">
                        Email
                      </th>
                      <th className="text-left px-4 py-3.5 text-[#565D6D] font-open-sans text-sm font-normal">
                        Rol
                      </th>
                      <th className="text-left px-4 py-3.5 text-[#565D6D] font-open-sans text-sm font-normal">
                        Estado
                      </th>
                      <th className="text-left px-4 py-3.5 text-[#565D6D] font-open-sans text-sm font-normal">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr
                        key={user.id || index}
                        className="border-t border-[#DEE1E6] hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 text-[#171A1F] font-open-sans text-sm">
                          {user.cedula}
                        </td>
                        <td className="px-4 py-4 text-[#171A1F] font-open-sans text-sm">
                          {`${user.nombres} ${user.apellidos}`}
                        </td>
                        <td className="px-4 py-4 text-[#171A1F] font-open-sans text-sm">
                          {user.correo}
                        </td>
                        <td className="px-4 py-4 text-[#171A1F] font-open-sans text-sm">
                          {ROLE_DISPLAY_NAMES[user.rol]}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              user.estadoActivo
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.estadoActivo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              className="p-1.5 text-[#003366] hover:bg-gray-100 rounded transition-colors"
                              title="Editar usuario"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-1.5 text-red-600 hover:bg-gray-100 rounded transition-colors"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Información de resultados */}
            {!isLoading && filteredUsers.length > 0 && (
              <div className="border-t border-[#DEE1E6] px-4 py-3">
                <div className="flex items-center justify-between text-sm text-[#565D6D] font-open-sans">
                  <span>
                    Mostrando {filteredUsers.length} de {users.length} usuarios
                  </span>
                  {/* Aquí se puede agregar paginación en el futuro */}
                </div>
              </div>
            )}
          </div>

          {/* Modal de Nuevo Usuario */}
          <NewUserModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onUserCreated={handleUserCreated}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}