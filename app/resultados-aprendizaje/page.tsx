"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LearningOutcome, LearningOutcomesService } from "@/lib/learning-outcomes";
import { UserCareerService } from "@/lib/user-career";
import NotificationService from "@/lib/notifications";
import NewLearningOutcomeModal from "@/components/NewLearningOutcomeModal";
import Pagination from "@/components/Pagination";

export default function ResultadosAprendizaje() {
  const [searchTermGenerales, setSearchTermGenerales] = useState("");
  const [searchTermEspecificos, setSearchTermEspecificos] = useState("");
  const [activeTab, setActiveTab] = useState("generales");
  const [outcomes, setOutcomes] = useState<LearningOutcome[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados de paginación para cada tab
  const [currentPageGenerales, setCurrentPageGenerales] = useState(1);
  const [currentPageEspecificos, setCurrentPageEspecificos] = useState(1);
  
  const canCreateOutcomes = UserCareerService.canCreateLearningOutcomes();

  // Configuración de paginación
  const itemsPerPage = 5;

  // Cargar resultados al montar el componente y al cambiar de tab
  useEffect(() => {
    if (activeTab === "generales") {
      getFilteredResults("GENERAL");
    } else {
      getFilteredResults("ESPECIFICO");
    }
  }, [activeTab]);

  const loadOutcomes = async () => {
    try {
      setIsLoading(true);
      const outcomesData = await LearningOutcomesService.getLearningOutcomes();
      console.log('Resultados de aprendizaje cargados:', outcomesData);
      console.log('Total:', outcomesData.length);
      console.log('Generales (RG):', outcomesData.filter(o => o.tipo === 'GENERAL').length);
      console.log('Específicos (RE):', outcomesData.filter(o => o.tipo === 'ESPECIFICO').length);
      setOutcomes(outcomesData);
    } catch (error) {
      console.error('Error al cargar resultados:', error);
      setOutcomes([]);
      NotificationService.error(
        'Error al cargar resultados',
        'No se pudieron cargar los resultados de aprendizaje. Intenta nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = () => {
    if (!canCreateOutcomes) {
      NotificationService.warning(
        'Sin permisos',
        'Solo los coordinadores pueden crear resultados de aprendizaje.'
      );
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    // Recargar solo el tab activo después de crear
    if (activeTab === "generales") {
      getFilteredResults("GENERAL");
    } else {
      getFilteredResults("ESPECIFICO");
    }
    setIsModalOpen(false);
  };

  // Filtrar resultados según el tab activo y búsqueda
  const getFilteredResults = async (tipo: "GENERAL" | "ESPECIFICO") => {
    const searchTerm = tipo === "GENERAL" ? searchTermGenerales : searchTermEspecificos;
    setIsLoading(true);
    try {
      const outcomesData = await LearningOutcomesService.getLearningOutcomes(tipo, searchTerm);
      setOutcomes(outcomesData);
      return outcomesData;
    } catch (error) {
      console.error('Error al filtrar resultados:', error);
      NotificationService.error(
        'Error al filtrar resultados',
        'No se pudieron filtrar los resultados de aprendizaje. Intenta nuevamente.'
      );
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener resultados paginados para cada tab
  const getPaginatedResults = (tipo: "GENERAL" | "ESPECIFICO") => {
    const currentPage = tipo === "GENERAL" ? currentPageGenerales : currentPageEspecificos;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const filteredResults = outcomes.filter(outcome => outcome.tipo === tipo);
    return {
      data: filteredResults.slice(startIndex, endIndex),
      totalPages: Math.ceil(filteredResults.length / itemsPerPage),
      currentPage: currentPage
    };
  };

  // Resetear página cuando cambie el filtro de Generales
  const handleSearchChangeGenerales = async (value: string) => {
    setSearchTermGenerales(value);
    setCurrentPageGenerales(1);
    await getFilteredResults("GENERAL");
  };

  // Resetear página cuando cambie el filtro de Específicos
  const handleSearchChangeEspecificos = async (value: string) => {
    setSearchTermEspecificos(value);
    setCurrentPageEspecificos(1);
    await getFilteredResults("ESPECIFICO");
  };

  const ResultsTable = ({ data, searchTerm }: { data: LearningOutcome[], searchTerm: string }) => (
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
                  Cargando resultados...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-[#565D6D] font-['Open_Sans']">
                  {searchTerm ? 'No se encontraron resultados que coincidan con la búsqueda' : 'No hay resultados registrados'}
                </td>
              </tr>
            ) : (
              data.map((resultado) => (
                <tr key={resultado.id} className="border-b border-[#DEE1E6] last:border-0">
                  <td className="px-7 py-8">
                    <span className="text-sm font-semibold text-[#171A1F] font-['Open_Sans']">
                      {resultado.codigo}
                    </span>
                  </td>
                  <td className="px-5 py-8">
                    <span className="text-sm text-[#565D6D]">{resultado.descripcion}</span>
                  </td>
                  <td className="px-6 py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-[#003366] hover:bg-gray-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-[#DC3848] hover:bg-gray-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-[#171A1F] font-['Open_Sans']">
              Gestión de Resultados de Aprendizaje (RA)
            </h1>
            {canCreateOutcomes && (
              <Button 
                className="bg-[#003366] hover:bg-[#002244] text-white gap-2"
                onClick={handleCreateClick}
              >
                <Plus className="w-4 h-4" />
                Nuevo RA
              </Button>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-white border-b border-[#DEE1E6] rounded-none w-full justify-start h-auto p-0">
              <TabsTrigger
                value="generales"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#003366] rounded-none px-4 py-3 text-sm font-medium"
              >
                Resultados Generales (RG)
              </TabsTrigger>
              <TabsTrigger
                value="especificos"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#003366] rounded-none px-4 py-3 text-sm font-medium"
              >
                Resultados Específicos (RE)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generales" className="mt-6">
              <div className="bg-white border border-[#DEE1E6] rounded-md p-4 mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#565D6D]" />
                  <Input
                    type="text"
                    placeholder="Buscar por código o descripción..."
                    value={searchTermGenerales}
                    onChange={(e) => handleSearchChangeGenerales(e.target.value)}
                    className="pl-10 border-[#DEE1E6]"
                  />
                </div>
              </div>

              <ResultsTable data={getPaginatedResults("GENERAL").data} searchTerm={searchTermGenerales} />

              <Pagination
                currentPage={getPaginatedResults("GENERAL").currentPage}
                totalPages={getPaginatedResults("GENERAL").totalPages}
                onPageChange={setCurrentPageGenerales}
                className="mt-8"
              />
            </TabsContent>

            <TabsContent value="especificos" className="mt-6">
              <div className="bg-white border border-[#DEE1E6] rounded-md p-4 mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#565D6D]" />
                  <Input
                    type="text"
                    placeholder="Buscar por código o descripción..."
                    value={searchTermEspecificos}
                    onChange={(e) => handleSearchChangeEspecificos(e.target.value)}
                    className="pl-10 border-[#DEE1E6]"
                  />
                </div>
              </div>

              <ResultsTable data={getPaginatedResults("ESPECIFICO").data} searchTerm={searchTermEspecificos} />

              <Pagination
                currentPage={getPaginatedResults("ESPECIFICO").currentPage}
                totalPages={getPaginatedResults("ESPECIFICO").totalPages}
                onPageChange={setCurrentPageEspecificos}
                className="mt-8"
              />
            </TabsContent>
          </Tabs>

          {/* Modal para crear resultado */}
          <NewLearningOutcomeModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onOutcomeCreated={handleModalSuccess}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}