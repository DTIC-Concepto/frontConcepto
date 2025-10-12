"use client";

import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { RoleGuard } from "@/components/RoleGuard";
import NewUserModal from "@/components/NewUserModal";
import { Search, ChevronLeft, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { User, UserFilters, VALID_ROLES, ROLE_DISPLAY_NAMES, RoleType } from "@/lib/api";
import { UsersService } from "@/lib/users";
import NotificationService from "@/lib/notifications";
import Pagination from "@/components/Pagination";

export default function Usuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Estados de filtros simplificados
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Configuración de paginación
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Cargar usuarios desde el backend
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const userData = await UsersService.getUsersWithFullRoles();
      console.log('Usuarios cargados con roles:', userData); // Para debug
      setUsers(userData);
      applyFilters(userData);
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

  // Aplicar filtros localmente
  const applyFilters = (usersToFilter = users) => {
    let filtered = [...usersToFilter];

    // Filtro de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.nombres.toLowerCase().includes(searchLower) ||
        user.apellidos.toLowerCase().includes(searchLower) ||
        user.correo.toLowerCase().includes(searchLower) ||
        user.cedula.includes(searchTerm)
      );
    }

    // Filtro de rol
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.rol === roleFilter);
    }

    // Filtro de estado
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(user => user.estadoActivo === isActive);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset a la primera página cuando se filtra
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [searchTerm, roleFilter, statusFilter, users]);

  const handleUserCreated = () => {
    loadUsers(); // Recargar la lista después de crear un usuario
  };

  return (
    <ProtectedRoute>
      <Layout>
        <RoleGuard allowedRoles={['ADMINISTRADOR']}>
          <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <div className="mb-6 md:mb-9">
              <h1 className="text-3xl md:text-4xl font-bold font-montserrat text-[#171A1F]">
                Gestión de Usuarios
              </h1>
            </div>

          {/* Search and Filters */}
          <div className="bg-white rounded border border-border p-4 mb-6 flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
            {/* Búsqueda */}
            <div className="flex-1 flex items-center gap-1.5 px-3 py-2 border border-border rounded bg-white">
              <Search className="w-4 h-4 text-[#565D6D] flex-shrink-0" />
              <input
                type="text"
                placeholder="Buscar por nombre, cédula o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 text-sm outline-none text-[#171A1F] placeholder:text-[#565D6D] min-w-0"
              />
            </div>
            
            {/* Filtros y botón */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Filtro por Roles */}
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-border rounded bg-white min-w-[170px] text-sm text-[#171A1F] appearance-none cursor-pointer pr-10"
                >
                  <option value="all">Todos los Roles</option>
                  {VALID_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_DISPLAY_NAMES[role]}
                    </option>
                  ))}
                </select>
                <ChevronLeft className="w-4 h-4 text-[#171A1F] rotate-[-90deg] absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
              
              {/* Filtro por Estado */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-border rounded bg-white min-w-[170px] text-sm text-[#171A1F] appearance-none cursor-pointer pr-10"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
                <ChevronLeft className="w-4 h-4 text-[#171A1F] rotate-[-90deg] absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
              
              {/* Botón Nuevo Usuario */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#003366] text-white px-4 py-2.5 rounded flex items-center justify-center gap-2 text-sm font-medium hover:bg-[#003366]/90 transition-colors whitespace-nowrap"
              >
                + Nuevo Usuario
              </button>
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
                      <th className="text-left px-4 py-5 text-[#565D6D] font-open-sans text-sm font-normal">
                        Email
                      </th>
                      <th className="text-left px-4 py-5 text-[#565D6D] font-open-sans text-sm font-normal">
                        Nombre
                      </th>
                      <th className="text-left px-4 py-5 text-[#565D6D] font-open-sans text-sm font-normal">
                        Rol
                      </th>
                      <th className="text-left px-4 py-5 text-[#565D6D] font-open-sans text-sm font-normal">
                        Estado
                      </th>
                      <th className="text-left px-4 py-5 text-[#565D6D] font-open-sans text-sm font-normal">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user, index) => (
                      <tr
                        key={user.id || index}
                        className="border-t border-[#DEE1E6] hover:bg-gray-50"
                      >
                        <td className="px-4 py-6 text-[#171A1F] font-open-sans text-sm">
                          {user.correo}
                        </td>
                        <td className="px-4 py-6 text-[#171A1F] font-open-sans text-sm">
                          {`${user.nombres} ${user.apellidos}`}
                        </td>
                        <td className="px-4 py-6 text-[#171A1F] font-open-sans text-sm">
                          {user.roles && user.roles.length > 0 
                            ? user.roles
                                .filter(role => role.rol) // Filtrar roles válidos
                                .map(role => ROLE_DISPLAY_NAMES[role.rol] || role.rol)
                                .join(' / ') 
                            : ROLE_DISPLAY_NAMES[user.rol] || user.rol
                          }
                        </td>
                        <td className="px-4 py-6">
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
                        <td className="px-4 py-6">
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

          </div>

          {/* Pagination */}
          {!isLoading && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-6"
            />
          )}

          {/* Results counter */}
          {!isLoading && filteredUsers.length > 0 && (
            <div className="mt-4 text-center text-sm text-[#565D6D]">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} usuarios
              {users.length !== filteredUsers.length && ` (${users.length} total)`}
            </div>
          )}

          {/* Modal de Nuevo Usuario */}
          <NewUserModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onUserCreated={handleUserCreated}
          />
          </div>
        </RoleGuard>
      </Layout>
    </ProtectedRoute>
  );
}