"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import NewCareerModal from "@/components/NewCareerModal";
import { Search, ChevronLeft, ChevronRight, Plus, SquarePen, Trash2 } from "lucide-react";
import { Career, CareerFilters, Faculty, MODALIDADES, MODALIDAD_DISPLAY_NAMES, ModalidadType } from "@/lib/api";
import { CareersService } from "@/lib/careers";
import { FacultiesService } from "@/lib/faculties";
import NotificationService from "@/lib/notifications";

export default function Carreras() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [careers, setCareers] = useState<Career[]>([]);
  const [filteredCareers, setFilteredCareers] = useState<Career[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtros
  const [facultyFilter, setFacultyFilter] = useState<string>("");
  const [modalityFilter, setModalityFilter] = useState<ModalidadType | "">("");
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);

  // Configuración de paginación
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCareers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCareers = filteredCareers.slice(startIndex, endIndex);

  // Cargar carreras desde el backend
  const loadCareers = async () => {
    try {
      setIsLoading(true);
      const filters: CareerFilters = {};
      
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      if (facultyFilter) {
        filters.facultadId = facultyFilter;
      }
      
      if (modalityFilter) {
        filters.modalidad = modalityFilter;
      }
      
      if (statusFilter !== undefined) {
        filters.estadoActivo = statusFilter;
      }

      const data = await CareersService.getAllCareers(filters);
      setCareers(data);
      setFilteredCareers(data);
    } catch (error) {
      console.error('Error al cargar carreras:', error);
      NotificationService.error(
        'Error al cargar carreras',
        'No se pudieron cargar las carreras. Verifique su conexión.'
      );
      setCareers([]);
      setFilteredCareers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar facultades para filtros
  const loadFaculties = async () => {
    try {
      const facultiesData = await FacultiesService.getAllFaculties({ estadoActivo: true });
      setFaculties(facultiesData);
    } catch (error) {
      console.error('Error al cargar facultades:', error);
    }
  };

  // Filtros locales en tiempo real
  const applyLocalFilters = () => {
    const filters: CareerFilters = {
      search: searchTerm || undefined,
      facultadId: facultyFilter || undefined,
      modalidad: modalityFilter || undefined,
      estadoActivo: statusFilter
    };

    const filtered = CareersService.filterCareers(careers, filters);
    setFilteredCareers(filtered);
    setCurrentPage(1); // Reset a la primera página cuando se filtra
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadCareers();
    loadFaculties();
  }, []);

  // Aplicar filtros locales cuando cambien
  useEffect(() => {
    applyLocalFilters();
  }, [searchTerm, facultyFilter, modalityFilter, statusFilter, careers]);

  const handleModalSuccess = () => {
    loadCareers(); // Recargar la lista después de crear una carrera
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
      <div className="p-4 md:p-6">
        <div className="mb-6 md:mb-9">
          <h1 className="text-3xl md:text-4xl font-bold font-montserrat text-[#171A1F]">
            Gestión de Carreras
          </h1>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded border border-border p-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-4">
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
          
          {/* Filtro por Facultad */}
          <div className="relative">
            <select
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value)}
              className="flex items-center gap-1.5 px-3 py-2 border border-border rounded bg-white md:min-w-[180px] text-sm text-[#171A1F] appearance-none cursor-pointer"
            >
              <option value="">Todas las facultades</option>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.codigo}
                </option>
              ))}
            </select>
            <ChevronLeft className="w-4 h-4 text-[#171A1F] rotate-[-90deg] absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          
          {/* Filtro por Modalidad */}
          <div className="relative">
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value as ModalidadType | "")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border rounded bg-white md:min-w-[150px] text-sm text-[#171A1F] appearance-none cursor-pointer"
            >
              <option value="">Todas las modalidades</option>
              {MODALIDADES.map((modalidad) => (
                <option key={modalidad} value={modalidad}>
                  {MODALIDAD_DISPLAY_NAMES[modalidad]}
                </option>
              ))}
            </select>
            <ChevronLeft className="w-4 h-4 text-[#171A1F] rotate-[-90deg] absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          
          {/* Filtro por Estado */}
          <div className="relative">
            <select
              value={statusFilter === undefined ? 'all' : statusFilter.toString()}
              onChange={(e) => {
                const value = e.target.value;
                setStatusFilter(value === 'all' ? undefined : value === 'true');
              }}
              className="flex items-center gap-1.5 px-3 py-2 border border-border rounded bg-white md:min-w-[120px] text-sm text-[#171A1F] appearance-none cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              <option value="true">Activas</option>
              <option value="false">Inactivas</option>
            </select>
            <ChevronLeft className="w-4 h-4 text-[#171A1F] rotate-[-90deg] absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#003366] text-white px-4 py-2.5 rounded flex items-center justify-center gap-2 text-sm font-medium hover:bg-[#003366]/90 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Nueva Carrera
          </button>
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
                    <th className="text-left px-4 py-3.5 text-sm font-normal text-[#565D6D] w-32">Código</th>
                    <th className="text-left px-4 py-3.5 text-sm font-normal text-[#565D6D] w-80">Nombre</th>
                    <th className="text-left px-4 py-3.5 text-sm font-normal text-[#565D6D] w-40">Facultad</th>
                    <th className="text-left px-4 py-3.5 text-sm font-normal text-[#565D6D] w-60">Coordinador</th>
                    <th className="text-center px-4 py-3.5 text-sm font-normal text-[#565D6D] w-32">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCareers.map((career) => (
                    <tr key={career.id} className="border-t border-border">
                      <td className="px-4 py-4 text-sm text-[#171A1F] font-medium w-32">{career.codigo}</td>
                      <td className="px-4 py-4 text-sm text-[#171A1F] w-80">{career.nombre}</td>
                      <td className="px-4 py-4 text-sm text-[#171A1F] w-40">
                        {career.facultadNombre || 'Sin facultad'}
                      </td>
                      <td className="px-4 py-4 text-sm w-60">
                        <span className={`${
                          career.coordinadorNombre === 'Sin asignar' 
                            ? 'text-[#565D6D] italic' 
                            : 'text-[#171A1F]'
                        }`}>
                          {career.coordinadorNombre || 'Sin asignar'}
                        </span>
                      </td>
                      <td className="px-4 py-4 w-32">
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
        {!isLoading && filteredCareers.length > itemsPerPage && (
          <div className="flex items-center justify-center gap-4 md:gap-6 mt-6 flex-wrap">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 text-sm text-[#171A1F] hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>
            
            <div className="flex items-center gap-3 md:gap-4">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`text-sm transition-colors px-3 py-1 rounded ${
                      currentPage === pageNum
                        ? 'bg-[#003366] text-white'
                        : 'text-[#171A1F] hover:text-primary'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 text-sm text-[#171A1F] hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Results counter */}
        {!isLoading && filteredCareers.length > 0 && (
          <div className="mt-4 text-center text-sm text-[#565D6D]">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredCareers.length)} de {filteredCareers.length} carreras
            {careers.length !== filteredCareers.length && ` (${careers.length} total)`}
          </div>
        )}
      </div>

      {/* Modal */}
      <NewCareerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </Layout>
    </ProtectedRoute>
  );
}