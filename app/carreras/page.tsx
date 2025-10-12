"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { RoleGuard } from "@/components/RoleGuard";
import NewCareerModal from "@/components/NewCareerModal";
import { Search, ChevronLeft, Plus, SquarePen, Trash2 } from "lucide-react";
import { Career, CareerFilters, Faculty } from "@/lib/api";
import { CareersService } from "@/lib/careers";
import { FacultiesService } from "@/lib/faculties";
import NotificationService from "@/lib/notifications";
import Pagination from "@/components/Pagination";

export default function Carreras() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [careers, setCareers] = useState<Career[]>([]);
  const [filteredCareers, setFilteredCareers] = useState<Career[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtros
  const [facultyFilter, setFacultyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Configuración de paginación
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredCareers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCareers = filteredCareers.slice(startIndex, endIndex);

  // Cargar datos iniciales
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar carreras
      const careersData = await CareersService.getAllCareers();
      setCareers(careersData);
      
      // Cargar facultades para filtros
      const facultiesData = await FacultiesService.getAllFaculties();
      setFaculties(facultiesData);
      
      // Aplicar filtros iniciales
      applyFilters(careersData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      NotificationService.error(
        'Error al cargar datos',
        'No se pudieron cargar los datos. Verifique su conexión.'
      );
      setCareers([]);
      setFilteredCareers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Aplicar filtros locales
  const applyFilters = (careersToFilter = careers) => {
    let filtered = [...careersToFilter];
    
    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(career => 
        career.codigo.toLowerCase().includes(term) ||
        career.nombre.toLowerCase().includes(term) ||
        (career.facultadNombre && career.facultadNombre.toLowerCase().includes(term)) ||
        (career.coordinadorNombre && career.coordinadorNombre.toLowerCase().includes(term))
      );
    }
    
    // Filtro por facultad
    if (facultyFilter !== "all") {
      filtered = filtered.filter(career => career.facultadId?.toString() === facultyFilter);
    }
    
    // Filtro por estado
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(career => career.estadoActivo === isActive);
    }
    
    setFilteredCareers(filtered);
    setCurrentPage(1); // Reset a la primera página cuando se filtra
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [searchTerm, facultyFilter, statusFilter, careers]);

  const handleModalSuccess = () => {
    loadData(); // Recargar la lista después de crear una carrera
  };

  const handleEdit = (career: Career) => {
    // TODO: Implementar edición
    NotificationService.info('Función en desarrollo', 'La edición de carreras estará disponible próximamente');
  };

  const handleDelete = (career: Career) => {
    // TODO: Implementar eliminación
    NotificationService.info('Función en desarrollo', 'La eliminación de carreras estará disponible próximamente');
  };

  return (
    <ProtectedRoute>
      <Layout>
        <RoleGuard allowedRoles={['ADMINISTRADOR']}>
          <div className="p-4 md:p-6">
            <div className="mb-6 md:mb-9">
              <h1 className="text-3xl md:text-4xl font-bold font-montserrat text-[#171A1F]">
                Gestión de Carreras
              </h1>
            </div>

        {/* Search and Filters */}
        <div className="bg-white rounded border border-border p-4 mb-6 flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          {/* Búsqueda */}
          <div className="flex-1 flex items-center gap-1.5 px-3 py-2 border border-border rounded bg-white">
            <Search className="w-4 h-4 text-[#565D6D] flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar por código, nombre, facultad o coordinador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 text-sm outline-none text-[#171A1F] placeholder:text-[#565D6D] min-w-0"
            />
          </div>
          
          {/* Filtros y botón */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Filtro por Facultades */}
            <div className="relative">
              <select
                value={facultyFilter}
                onChange={(e) => setFacultyFilter(e.target.value)}
                className="flex items-center gap-1.5 px-3 py-2 border border-border rounded bg-white min-w-[200px] text-sm text-[#171A1F] appearance-none cursor-pointer pr-10"
              >
                <option value="all">Todas las Facultades</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id?.toString()}>
                    {faculty.nombre}
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
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
              </select>
              <ChevronLeft className="w-4 h-4 text-[#171A1F] rotate-[-90deg] absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
            
            {/* Botón Nueva Carrera */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#003366] text-white px-4 py-2.5 rounded flex items-center justify-center gap-2 text-sm font-medium hover:bg-[#003366]/90 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Nueva Carrera
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded border border-border shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto mb-4"></div>
            <p className="text-[#565D6D]">Cargando carreras...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCareers.length === 0 && (
          <div className="bg-white rounded border border-border shadow-sm p-8 text-center">
            <p className="text-[#565D6D] mb-4">
              {careers.length === 0 
                ? "No hay carreras registradas" 
                : "No se encontraron carreras con los filtros aplicados"
              }
            </p>
            {careers.length === 0 && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#003366] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#003366]/90 transition-colors"
              >
                Crear primera carrera
              </button>
            )}
          </div>
        )}

        {/* Table - Desktop */}
        {!isLoading && filteredCareers.length > 0 && (
          <div className="hidden md:block bg-white rounded border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F3F4F6]">
                    <th className="text-left px-4 py-5 text-sm font-normal text-[#565D6D] w-32">Código</th>
                    <th className="text-left px-4 py-5 text-sm font-normal text-[#565D6D] w-80">Nombre</th>
                    <th className="text-left px-4 py-5 text-sm font-normal text-[#565D6D] w-40">Facultad</th>
                    <th className="text-left px-4 py-5 text-sm font-normal text-[#565D6D] w-60">Coordinador</th>
                    <th className="text-center px-4 py-5 text-sm font-normal text-[#565D6D] w-32">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCareers.map((career) => (
                    <tr key={career.id} className="border-t border-border">
                      <td className="px-4 py-6 text-sm text-[#171A1F] font-medium w-32">{career.codigo}</td>
                      <td className="px-4 py-6 text-sm text-[#171A1F] w-80">{career.nombre}</td>
                      <td className="px-4 py-6 text-sm text-[#171A1F] w-40">
                        {career.facultadNombre || 'Sin facultad'}
                      </td>
                      <td className="px-4 py-6 text-sm w-60">
                        <span className={`${
                          career.coordinadorNombre === 'Sin asignar' 
                            ? 'text-[#565D6D] italic' 
                            : 'text-[#171A1F]'
                        }`}>
                          {career.coordinadorNombre || 'Sin asignar'}
                        </span>
                      </td>
                      <td className="px-4 py-6 w-32">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEdit(career)}
                            className="p-2 hover:bg-accent rounded transition-colors"
                            title="Editar carrera"
                          >
                            <SquarePen className="w-4 h-4 text-[#003366]" />
                          </button>
                          <button 
                            onClick={() => handleDelete(career)}
                            className="p-2 hover:bg-accent rounded transition-colors"
                            title="Eliminar carrera"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cards - Mobile */}
        {!isLoading && filteredCareers.length > 0 && (
          <div className="md:hidden space-y-4">
            {currentCareers.map((career) => (
              <div key={career.id} className="bg-white rounded border border-border shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs text-[#565D6D] mb-1">Código</div>
                    <div className="font-medium text-[#171A1F]">{career.codigo}</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(career)}
                      className="p-2 hover:bg-accent rounded transition-colors"
                      title="Editar carrera"
                    >
                      <SquarePen className="w-4 h-4 text-[#003366]" />
                    </button>
                    <button 
                      onClick={() => handleDelete(career)}
                      className="p-2 hover:bg-accent rounded transition-colors"
                      title="Eliminar carrera"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-xs text-[#565D6D] mb-1">Nombre</div>
                  <div className="text-sm text-[#171A1F]">{career.nombre}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-[#565D6D] mb-1">Facultad</div>
                    <div className="text-sm text-[#171A1F]">
                      {career.facultadNombre || 'Sin facultad'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#565D6D] mb-1">Coordinador</div>
                    <div className={`text-sm ${
                      career.coordinadorNombre === 'Sin asignar' 
                        ? 'text-[#565D6D] italic' 
                        : 'text-[#171A1F]'
                    }`}>
                      {career.coordinadorNombre || 'Sin asignar'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
        {!isLoading && filteredCareers.length > 0 && (
          <div className="mt-4 text-center text-sm text-[#565D6D]">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredCareers.length)} de {filteredCareers.length} carreras
            {careers.length !== filteredCareers.length && ` (${careers.length} total)`}
          </div>
        )}

        {/* Modal */}
        <NewCareerModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      </div>
      </RoleGuard>
    </Layout>
    </ProtectedRoute>
  );
}