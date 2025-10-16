"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Search, Edit2, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EurAceCriterion, EurAceCriteriaService } from "@/lib/eur-ace-criteria";
import { UserCareerService } from "@/lib/user-career";
import NotificationService from "@/lib/notifications";
import NewEurAceCriterionModal from "@/components/NewEurAceCriterionModal";
import Pagination from "@/components/Pagination";

export default function CriteriosEurAce() {
  const [searchTerm, setSearchTerm] = useState("");
  const [criteria, setCriteria] = useState<EurAceCriterion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const canCreateCriteria = UserCareerService.canCreateEurAceCriteria();

  // Configuración de paginación
  const itemsPerPage = 5;

  // Resetear página cuando cambie el filtro
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Cargar criterios al montar el componente
  useEffect(() => {
    loadCriteria();
  }, []);

  const loadCriteria = async () => {
    try {
      setIsLoading(true);
      const criteriaData = await EurAceCriteriaService.getEurAceCriteria();
      setCriteria(criteriaData);
    } catch (error) {
      console.error('Error al cargar criterios:', error);
      setCriteria([]);
      NotificationService.error(
        'Error al cargar criterios',
        'No se pudieron cargar los criterios EUR-ACE. Intenta nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = () => {
    if (!canCreateCriteria) {
      NotificationService.warning(
        'Sin permisos',
        'Solo los miembros del CEI pueden crear criterios EUR-ACE.'
      );
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    loadCriteria(); // Recargar la lista después de crear
  };

  // Filtrar criterios
  const filteredCriteria = criteria.filter(criterio =>
    criterio.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    criterio.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Configuración de paginación
  const totalPages = Math.ceil(filteredCriteria.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCriteria = filteredCriteria.slice(startIndex, endIndex);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-[#171A1F] font-['Open_Sans']">
              Criterios EUR-ACE
            </h1>
            {canCreateCriteria && (
              <Button 
                className="bg-[#003366] hover:bg-[#002244] text-white gap-2"
                onClick={handleCreateClick}
              >
                <Plus className="w-4 h-4" />
                Nuevo Criterio
              </Button>
            )}
          </div>

          <div className="bg-white border border-[#DEE1E6] rounded-md p-4 mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#565D6D]" />
              <Input
                type="text"
                placeholder="Buscar por código o descripción..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 border-[#DEE1E6]"
              />
            </div>
          </div>

          <div className="bg-white border border-white rounded-md shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F3F4F6] border-b border-[#DEE1E6]">
                  <tr>
                    <th className="px-7 py-3.5 text-left text-sm font-normal text-[#565D6D] font-['Open_Sans'] w-24">
                      Código
                    </th>
                    <th className="px-5 py-3.5 text-left text-sm font-normal text-[#565D6D] font-['Open_Sans']">
                      Descripción
                    </th>
                    <th className="px-6 py-3.5 text-center text-sm font-normal text-[#565D6D] font-['Open_Sans'] w-40">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-[#565D6D] font-['Open_Sans']">
                        Cargando criterios...
                      </td>
                    </tr>
                  ) : currentCriteria.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-[#565D6D] font-['Open_Sans']">
                        {searchTerm ? 'No se encontraron criterios que coincidan con la búsqueda' : 'No hay criterios registrados'}
                      </td>
                    </tr>
                  ) : (
                    currentCriteria.map((criterio) => (
                      <tr key={criterio.id} className="border-b border-[#DEE1E6] last:border-0">
                        <td className="px-7 py-8 align-top">
                          <span className="text-sm font-semibold text-[#171A1F] font-['Open_Sans']">
                            {criterio.codigo}
                          </span>
                        </td>
                        <td className="px-5 py-8">
                          <span className="text-[13px] leading-normal text-black font-[Montserrat]">
                            {criterio.descripcion}
                          </span>
                        </td>
                        <td className="px-6 py-8 text-center">
                          <div className="flex justify-center gap-3">
                            <button 
                              className="text-[#565D6D] hover:text-[#003366] transition-colors duration-200"
                              onClick={() => {/* TODO: implement edit */}}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              className="text-[#565D6D] hover:text-red-600 transition-colors duration-200"
                              onClick={() => {/* TODO: implement delete */}}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="mt-8"
          />

          {/* Modal para crear criterio EUR-ACE */}
          <NewEurAceCriterionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCriterionCreated={handleModalSuccess}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}