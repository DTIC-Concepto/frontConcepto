"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { Steps } from "@/components/StepIndicator";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { RaaService, type Raa } from "@/lib/raa";
import NotificationService from "@/lib/notifications";

const ITEMS_PER_PAGE = 5;

export default function RaaSelection() {
  const router = useRouter();
  const [selectedRaa, setSelectedRaa] = useState<Raa | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [raaList, setRaaList] = useState<Raa[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [asignaturaId, setAsignaturaId] = useState<number | null>(null);

  // Cargar RAAs del backend
  useEffect(() => {
    const loadRaas = async () => {
      try {
        setLoading(true);
        
        // Obtener asignaturaId del localStorage
        const idFromStorage = typeof window !== 'undefined' 
          ? localStorage.getItem('current_asignatura_id') 
          : null;
        
        if (!idFromStorage) {
          NotificationService.error(
            'Error',
            'No se encontró la asignatura. Por favor, cree una asignatura primero.'
          );
          router.push('/asignaturas/nueva');
          return;
        }
        
        const asigId = parseInt(idFromStorage);
        setAsignaturaId(asigId);
        
        const data = await RaaService.getRaas(asigId);
        setRaaList(data);
      } catch (error) {
        console.error('Error cargando RAAs:', error);
        NotificationService.error(
          'Error',
          'Error al cargar los resultados de aprendizaje de la asignatura'
        );
      } finally {
        setLoading(false);
      }
    };

    loadRaas();
  }, [router]);

  const filteredRaas = useMemo(() => {
    return raaList.filter(
      (raa) =>
        raa.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        raa.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, raaList]);

  const totalPages = Math.ceil(filteredRaas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRaas = filteredRaas.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleRowClick = (raa: Raa) => {
    setSelectedRaa(raa);
  };

  const handleNext = () => {
    if (selectedRaa) {
      // Guardar la selección en localStorage para el siguiente paso
      localStorage.setItem('selectedRaa', JSON.stringify(selectedRaa));
      router.push("/matriz-raa-ra/nueva/paso-2");
    }
  };

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
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-7 py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-[#003366]" />
                        <span className="text-[#565D6D] font-open-sans">Cargando RAAs...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedRaas.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-7 py-8 text-center">
                      <span className="text-[#565D6D] font-open-sans">
                        {searchQuery ? 'No se encontraron RAAs que coincidan con la búsqueda' : 'No hay RAAs disponibles para esta asignatura'}
                      </span>
                    </td>
                  </tr>
                ) : (
                  paginatedRaas.map((raa) => (
                    <tr
                      key={raa.id}
                      onClick={() => handleRowClick(raa)}
                      className={`cursor-pointer transition-colors ${
                        selectedRaa?.id === raa.id
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-7 py-6">
                        <span className="text-sm font-semibold text-gray-900">{raa.codigo}</span>
                      </td>
                      <td className="px-4 py-6">
                        <span className="text-sm text-gray-900">{raa.tipo}</span>
                      </td>
                      <td className="px-4 py-6">
                        <span className="text-sm text-gray-900">{raa.descripcion}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-100">
              <button 
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 text-sm text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-8 h-8 rounded text-sm font-medium ${
                      currentPage === idx + 1
                        ? 'bg-[#171A1F] text-white'
                        : 'text-[#171A1F] hover:bg-gray-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 text-sm text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="destructive"
              className="h-10 px-6 rounded-md shadow-sm"
              onClick={() => router.push("/asignaturas/nueva/matriz-raa-ra")}
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
              Guardar
            </Button>
          </div>
        </div>
      </Layout>
    </AcademicRoute>
  );
}
