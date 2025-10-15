"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgramObjective, ProgramObjectivesService } from "@/lib/program-objectives";
import { UserCareerService } from "@/lib/user-career";
import NotificationService from "@/lib/notifications";
import NewProgramObjectiveModal from "@/components/NewProgramObjectiveModal";

export default function ObjetivosCarrera() {
  const [searchTerm, setSearchTerm] = useState("");
  const [objectives, setObjectives] = useState<ProgramObjective[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const canCreateObjectives = UserCareerService.canCreateProgramObjectives();

  // Cargar objetivos al montar el componente
  useEffect(() => {
    loadObjectives();
  }, []);

  const loadObjectives = async () => {
    try {
      setIsLoading(true);
      const objectivesData = await ProgramObjectivesService.getProgramObjectives();
      setObjectives(objectivesData);
    } catch (error) {
      console.error('Error al cargar objetivos:', error);
      setObjectives([]);
      NotificationService.error(
        'Error al cargar objetivos',
        'No se pudieron cargar los objetivos de programa. Intenta nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = () => {
    if (!canCreateObjectives) {
      NotificationService.warning(
        'Sin permisos',
        'Solo los coordinadores pueden crear objetivos de programa.'
      );
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    loadObjectives(); // Recargar la lista después de crear
    setIsModalOpen(false);
  };

  // Filtrar objetivos
  const filteredObjectives = objectives.filter(objetivo =>
    objetivo.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    objetivo.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-[#171A1F] font-['Open_Sans']">
              Gestión de Objetivos de Carrera (OPP)
            </h1>
            {canCreateObjectives && (
              <Button 
                className="bg-[#003366] hover:bg-[#002244] text-white gap-2"
                onClick={handleCreateClick}
              >
                <Plus className="w-4 h-4" />
                Nuevo OPP
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
                        Cargando objetivos...
                      </td>
                    </tr>
                  ) : filteredObjectives.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-[#565D6D] font-['Open_Sans']">
                        {searchTerm ? 'No se encontraron objetivos que coincidan con la búsqueda' : 'No hay objetivos registrados'}
                      </td>
                    </tr>
                  ) : (
                    filteredObjectives.map((objetivo) => (
                      <tr key={objetivo.id} className="border-b border-[#DEE1E6] last:border-0">
                        <td className="px-7 py-6">
                          <span className="text-sm font-semibold text-[#171A1F] font-['Open_Sans']">
                            {objetivo.codigo}
                          </span>
                        </td>
                        <td className="px-5 py-6">
                          <span className="text-sm text-[#565D6D]">{objetivo.descripcion}</span>
                        </td>
                        <td className="px-6 py-6">
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

          <div className="mt-8 flex items-center justify-center gap-4">
            <button className="flex items-center gap-1 text-sm text-[#171A1F] hover:text-[#003366] font-['Open_Sans']">
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button className="w-8 h-8 text-sm text-[#171A1F] hover:bg-gray-100 rounded font-['Open_Sans']">
              1
            </button>
            <button className="w-8 h-8 text-sm text-[#171A1F] hover:bg-gray-100 rounded font-['Open_Sans']">
              2
            </button>
            <button className="w-8 h-8 text-sm text-[#171A1F] hover:bg-gray-100 rounded font-['Open_Sans']">
              3
            </button>
            <button className="flex items-center gap-1 text-sm text-[#171A1F] hover:text-[#003366] font-['Open_Sans']">
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Modal para crear objetivo */}
          <NewProgramObjectiveModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onObjectiveCreated={handleModalSuccess}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}