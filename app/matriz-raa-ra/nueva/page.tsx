"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { Steps } from "@/components/StepIndicator";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { RaaService, type Raa } from "@/lib/raa";
import NotificationService from "@/lib/notifications";

export default function RaaSelection() {
  const router = useRouter();
  const [selectedRaa, setSelectedRaa] = useState<Raa | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [raaList, setRaaList] = useState<Raa[]>([]);
  const [filteredRaaList, setFilteredRaaList] = useState<Raa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Cargar RAAs desde el backend
  useEffect(() => {
    loadRaas();
  }, []);

  // Filtrar RAAs cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRaaList(raaList);
    } else {
      const filtered = raaList.filter(raa => 
        raa.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        raa.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRaaList(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, raaList]);

  const loadRaas = async () => {
    try {
      setIsLoading(true);
      const asignaturaId = typeof window !== 'undefined' 
        ? localStorage.getItem('current_asignatura_id')
        : null;
      
      if (!asignaturaId) {
        NotificationService.error('Error', 'No se encontró la asignatura seleccionada');
        router.push('/asignaturas');
        return;
      }

      const raas = await RaaService.getRaas(parseInt(asignaturaId));
      setRaaList(raas);
      setFilteredRaaList(raas);
    } catch (error) {
      console.error('Error cargando RAAs:', error);
      NotificationService.error('Error', 'No se pudieron cargar los resultados de aprendizaje');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (raa: Raa) => {
    setSelectedRaa(raa);
  };

  const handleNext = () => {
    if (selectedRaa) {
      // Guardar RAA seleccionado en localStorage
      localStorage.setItem('selected_raa', JSON.stringify(selectedRaa));
      router.push("/matriz-raa-ra/nueva/paso-2");
    }
  };

  const handleCancel = () => {
    const origin = typeof window !== 'undefined' 
      ? localStorage.getItem('wizard_origin') 
      : null;
    
    if (origin === 'sidebar') {
      router.push('/mapeos/raa-vs-ra');
    } else {
      router.push('/asignaturas/nueva/matriz-raa-ra');
    }
  };

  // Paginación
  const totalPages = Math.ceil(filteredRaaList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRaas = filteredRaaList.slice(startIndex, endIndex);

  return (
    <AcademicRoute>
      <Layout>
        <div className="max-w-[1280px] mx-auto p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8 font-open-sans">
            Matriz: Resultados de aprendizaje de Asignatura (RAA) y Resultados de aprendizaje (RA)
          </h1>

          <Steps currentStep={1} />

          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por código o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
                <span className="ml-3 text-[#565D6D]">Cargando RAAs...</span>
              </div>
            </div>
          ) : currentRaas.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="text-center text-[#565D6D]">
                <p className="text-lg mb-2">No hay resultados disponibles</p>
                <p className="text-sm">
                  {searchQuery ? 'No se encontraron RAAs que coincidan con la búsqueda.' : 'No se encontraron RAAs para esta asignatura.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-7 py-3.5 text-left text-sm font-normal text-gray-500">Código</th>
                    <th className="px-7 py-3.5 text-left text-sm font-normal text-gray-500">Tipo</th>
                    <th className="px-7 py-3.5 text-center text-sm font-normal text-gray-500">Descripción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentRaas.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className={`cursor-pointer transition-colors ${
                        selectedRaa?.id === item.id
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-7 py-6 text-center">
                        <span className="text-sm font-semibold text-gray-900">{item.codigo}</span>
                      </td>
                      <td className="px-4 py-6">
                        <span className="text-sm text-gray-500">{item.tipo}</span>
                      </td>
                      <td className="px-4 py-6">
                        <span className="text-xs text-gray-900 text-center block">{item.descripcion}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-100">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 text-sm text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`text-sm px-3 py-1 rounded ${
                          currentPage === page 
                            ? 'bg-[#003366] text-white' 
                            : 'text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 text-sm text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="destructive"
              className="h-10 px-6 rounded-md shadow-sm"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button
              disabled={!selectedRaa}
              onClick={handleNext}
              className={`h-10 px-6 rounded-md shadow-sm ${
                selectedRaa
                  ? "bg-[#003366] hover:bg-[#002244] text-white"
                  : "bg-gray-200 text-white hover:bg-gray-200 cursor-not-allowed"
              }`}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Layout>
    </AcademicRoute>
  );
}
