"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { RoleGuard } from "@/components/RoleGuard";
import NewFacultyModal from "@/components/NewFacultyModal";
import { Search, ChevronLeft, ChevronRight, Plus, SquarePen, Trash2 } from "lucide-react";
import { Faculty, FacultyFilters, Career } from "@/lib/api";
import { FacultiesService } from "@/lib/faculties";
import { CareersService } from "@/lib/careers";
import NotificationService from "@/lib/notifications";
import Pagination from "@/components/Pagination";

export default function Facultades() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [filteredFaculties, setFilteredFaculties] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [careerFilter, setCareerFilter] = useState<string>("all");
  const [careers, setCareers] = useState<Career[]>([]);

  // Configuración de paginación
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredFaculties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFaculties = filteredFaculties.slice(startIndex, endIndex);

  // Cargar facultades y carreras desde el backend
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar facultades
      const facultiesData = await FacultiesService.getAllFaculties();
      setFaculties(facultiesData);
      
      // Cargar carreras para el filtro
      const careersData = await CareersService.getAllCareers();
      setCareers(careersData);
      
      // Aplicar filtros iniciales
      applyFilters(facultiesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      NotificationService.error(
        'Error al cargar datos',
        'No se pudieron cargar los datos. Verifique su conexión.'
      );
      setFaculties([]);
      setFilteredFaculties([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Aplicar filtros locales
  const applyFilters = (facultiesToFilter = faculties) => {
    let filtered = [...facultiesToFilter];
    
    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(faculty => 
        faculty.codigo.toLowerCase().includes(term) ||
        faculty.nombre.toLowerCase().includes(term) ||
        (faculty.descripcion && faculty.descripcion.toLowerCase().includes(term))
      );
    }
    
    // Filtro por carrera
    if (careerFilter !== "all") {
      // Si se selecciona una carrera específica, mostrar solo facultades que tengan esa carrera
      filtered = filtered.filter(faculty => {
        const facultyCareers = careers.filter(career => career.facultadId === faculty.id);
        return facultyCareers.some(career => career.id?.toString() === careerFilter);
      });
    }
    
    setFilteredFaculties(filtered);
    setCurrentPage(1); // Reset a la primera página cuando se filtra
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [searchTerm, careerFilter, faculties, careers]);

  const handleModalSuccess = () => {
    loadData(); // Recargar la lista después de crear una facultad
  };

  const handleEdit = (faculty: Faculty) => {
    // TODO: Implementar edición
    NotificationService.info('Función en desarrollo', 'La edición de facultades estará disponible próximamente');
  };

  const handleDelete = (faculty: Faculty) => {
    // TODO: Implementar eliminación
    NotificationService.info('Función en desarrollo', 'La eliminación de facultades estará disponible próximamente');
  };

  return (
    <ProtectedRoute>
      <Layout>
        <RoleGuard allowedRoles={['ADMINISTRADOR']}>
          <div className="p-4 md:p-6">
            <div className="mb-6 md:mb-9">
              <h1 className="text-3xl md:text-4xl font-bold font-montserrat text-[#171A1F]">
                Gestión de Facultades
              </h1>
            </div>

        {/* Search and Filters */}
        <div className="bg-white rounded border border-border p-4 mb-6 flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          {/* Búsqueda */}
          <div className="flex-1 lg:max-w-[60%] flex items-center gap-1.5 px-3 py-2 border border-border rounded bg-white">
            <Search className="w-4 h-4 text-[#565D6D] flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar por código, nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 text-sm outline-none text-[#171A1F] placeholder:text-[#565D6D] min-w-0"
            />
          </div>
          
          {/* Filtros y botón */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Filtro por Carreras */}
            <div className="relative">
              <select
                value={careerFilter}
                onChange={(e) => setCareerFilter(e.target.value)}
                className="flex items-center gap-1.5 px-3 py-2 border border-border rounded bg-white min-w-[180px] text-sm text-[#171A1F] appearance-none cursor-pointer"
              >
                <option value="all">Todas las Carreras</option>
                {careers.map((career) => (
                  <option key={career.id} value={career.id?.toString()}>
                    {career.nombre}
                  </option>
                ))}
              </select>
              <ChevronLeft className="w-4 h-4 text-[#171A1F] rotate-[-90deg] absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
            
            {/* Botón Nueva Facultad */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#003366] text-white px-4 py-2.5 rounded flex items-center justify-center gap-2 text-sm font-medium hover:bg-[#003366]/90 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Nueva Facultad
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded border border-border shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto mb-4"></div>
            <p className="text-[#565D6D]">Cargando facultades...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredFaculties.length === 0 && (
          <div className="bg-white rounded border border-border shadow-sm p-8 text-center">
            <p className="text-[#565D6D] mb-4">
              {faculties.length === 0 
                ? "No hay facultades registradas" 
                : "No se encontraron facultades con los filtros aplicados"
              }
            </p>
            {faculties.length === 0 && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#003366] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#003366]/90 transition-colors"
              >
                Crear primera facultad
              </button>
            )}
          </div>
        )}

        {/* Table - Desktop */}
        {!isLoading && filteredFaculties.length > 0 && (
          <div className="hidden md:block bg-white rounded border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F3F4F6]">
                    <th className="text-left px-4 py-3.5 text-sm font-normal text-[#565D6D] w-20">Código</th>
                    <th className="text-left px-4 py-3.5 text-sm font-normal text-[#565D6D] w-80">Nombre</th>
                    <th className="text-left px-4 py-3.5 text-sm font-normal text-[#565D6D] w-20">Carreras</th>
                    <th className="text-left px-4 py-3.5 text-sm font-normal text-[#565D6D] w-60">Decano</th>
                    <th className="text-center px-4 py-3.5 text-sm font-normal text-[#565D6D] w-32">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentFaculties.map((faculty) => (
                    <tr key={faculty.id} className="border-t border-border">
                      <td className="px-4 py-6 text-sm text-[#171A1F] font-medium w-20">{faculty.codigo}</td>
                      <td className="px-4 py-6 text-sm text-[#171A1F] w-80">{faculty.nombre}</td>
                      <td className="px-4 py-6 text-sm text-[#171A1F] w-20">
                        {faculty.carreras || 0}
                      </td>
                      <td className="px-4 py-6 text-sm w-60">
                        <span className={`${
                          faculty.decano === 'Sin asignar' 
                            ? 'text-[#565D6D] italic' 
                            : 'text-[#171A1F]'
                        }`}>
                          {faculty.decano || 'Sin asignar'}
                        </span>
                      </td>
                      <td className="px-4 py-6 w-32">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEdit(faculty)}
                            className="p-2 hover:bg-accent rounded transition-colors"
                            title="Editar facultad"
                          >
                            <SquarePen className="w-4 h-4 text-[#003366]" />
                          </button>
                          <button 
                            onClick={() => handleDelete(faculty)}
                            className="p-2 hover:bg-accent rounded transition-colors"
                            title="Eliminar facultad"
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
        {!isLoading && filteredFaculties.length > 0 && (
          <div className="md:hidden space-y-4">
            {currentFaculties.map((faculty) => (
              <div key={faculty.id} className="bg-white rounded border border-border shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs text-[#565D6D] mb-1">Código</div>
                    <div className="font-medium text-[#171A1F]">{faculty.codigo}</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(faculty)}
                      className="p-2 hover:bg-accent rounded transition-colors"
                      title="Editar facultad"
                    >
                      <SquarePen className="w-4 h-4 text-[#003366]" />
                    </button>
                    <button 
                      onClick={() => handleDelete(faculty)}
                      className="p-2 hover:bg-accent rounded transition-colors"
                      title="Eliminar facultad"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-xs text-[#565D6D] mb-1">Nombre</div>
                  <div className="text-sm text-[#171A1F]">{faculty.nombre}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-[#565D6D] mb-1">Carreras</div>
                    <div className="text-sm text-[#171A1F]">
                      {faculty.carreras || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#565D6D] mb-1">Decano</div>
                    <div className={`text-sm ${
                      faculty.decano === 'Sin asignar' 
                        ? 'text-[#565D6D] italic' 
                        : 'text-[#171A1F]'
                    }`}>
                      {faculty.decano || 'Sin asignar'}
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
        {!isLoading && filteredFaculties.length > 0 && (
          <div className="mt-4 text-center text-sm text-[#565D6D]">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredFaculties.length)} de {filteredFaculties.length} facultades
            {faculties.length !== filteredFaculties.length && ` (${faculties.length} total)`}
          </div>
        )}

        {/* Modal */}
        <NewFacultyModal 
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