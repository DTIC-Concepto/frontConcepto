"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { Steps } from "@/components/StepIndicator";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import { type LearningOutcome } from "@/lib/learning-outcomes";
import { MappingsService } from "@/lib/mappings";
import NotificationService from "@/lib/notifications";

const ITEMS_PER_PAGE = 5;

interface SelectedRaa {
  id: number;
  codigo: string;
  descripcion: string;
  tipo: string;
}

export default function RaSelection() {
  const router = useRouter();
  const [selectedRa, setSelectedRa] = useState<LearningOutcome | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [raList, setRaList] = useState<LearningOutcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [tipoFilter, setTipoFilter] = useState<string>("");
  const [raaId, setRaaId] = useState<number | null>(null);
  const [carreraId, setCarreraId] = useState<number | null>(null);

  useEffect(() => {
    const loadRas = async () => {
      try {
        setLoading(true);

        // Obtener RAA seleccionado del paso 1
        const raaData = typeof window !== 'undefined' 
          ? localStorage.getItem('selectedRaa') 
          : null;
        
        if (!raaData) {
          NotificationService.error('Error', 'No se encontró el RAA seleccionado. Por favor, inicie el proceso nuevamente.');
          router.push('/matriz-raa-ra/nueva');
          return;
        }

        const selectedRaa: SelectedRaa = JSON.parse(raaData);
        setRaaId(selectedRaa.id);

        // Obtener carreraId del usuario
        const authUser = typeof window !== 'undefined'
          ? localStorage.getItem('auth_user')
          : null;
        
        if (!authUser) {
          NotificationService.error('Error', 'No se encontró información del usuario.');
          router.push('/matriz-raa-ra/nueva');
          return;
        }

        const userData = JSON.parse(authUser);
        // Intentar obtener carreraId de diferentes fuentes
        const userCarreraId = userData.carreraIds?.[0] ?? userData.carrera?.id ?? userData.carreraId ?? null;
        
        console.log('User data en paso 2:', userData);
        console.log('Carrera ID obtenido:', userCarreraId);
        
        if (!userCarreraId) {
          NotificationService.error('Error', 'No se encontró la carrera del usuario.');
          console.error('No se pudo obtener carreraId. userData completo:', userData);
          router.push('/matriz-raa-ra/nueva');
          return;
        }

        setCarreraId(userCarreraId);

        // Cargar RAs disponibles para este RAA usando el nuevo endpoint
        const data = await MappingsService.getAvailableRasForRaa(
          selectedRaa.id,
          userCarreraId,
          tipoFilter && tipoFilter !== '' ? tipoFilter as 'GENERAL' | 'ESPECIFICO' : undefined
        );
        
        setRaList(data);
      } catch (error) {
        console.error("Error cargando RAs:", error);
        NotificationService.error("Error", "Error al cargar los resultados de aprendizaje");
      } finally {
        setLoading(false);
      }
    };
    loadRas();
  }, [router, tipoFilter]);

  const filteredRas = useMemo(() => {
    // Solo filtrar por búsqueda, el tipo ya viene filtrado desde el backend
    if (!searchQuery) return raList;
    
    return raList.filter(
      (ra) =>
        ra.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ra.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, raList]);

  const totalPages = Math.ceil(filteredRas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRas = filteredRas.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleRowClick = (ra: LearningOutcome) => {
    setSelectedRa(ra);
  };

  const handleNext = () => {
    if (selectedRa) {
      localStorage.setItem("selectedRa", JSON.stringify(selectedRa));
      router.push("/matriz-raa-ra/nueva/paso-3");
    }
  };

  return (
    <AcademicRoute>
      <Layout>
        <div className="max-w-[1280px] mx-auto p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8 font-open-sans">
            Matriz: Resultados de aprendizaje de Asignatura (RAA) y Resultados de aprendizaje (RA)
          </h1>
          <Steps currentStep={2} />
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex gap-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por código o descripción..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                disabled={loading}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#003366] disabled:bg-gray-50"
              />
            </div>
            <div className="relative">
              <select 
                value={tipoFilter}
                onChange={(e) => { setTipoFilter(e.target.value); setCurrentPage(1); }}
                disabled={loading}
                className="w-[276px] h-10 pl-3 pr-8 appearance-none rounded-md border border-gray-200 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#003366] disabled:bg-gray-50"
              >
                <option value="">Todos</option>
                <option value="GENERAL">General</option>
                <option value="ESPECIFICO">Específico</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-7 py-3.5 text-left text-sm font-normal text-gray-500 w-[100px]">Código</th>
                  <th className="px-7 py-3.5 text-left text-sm font-normal text-gray-500">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={2} className="px-7 py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-[#003366]" />
                        <span className="text-[#565D6D] font-open-sans">Cargando RAs...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedRas.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-7 py-8 text-center">
                      <span className="text-[#565D6D] font-open-sans">
                        {searchQuery || tipoFilter ? "No se encontraron RAs que coincidan con los filtros" : "No hay RAs disponibles"}
                      </span>
                    </td>
                  </tr>
                ) : (
                  paginatedRas.map((ra) => (
                    <tr key={ra.id} onClick={() => handleRowClick(ra)} className={`cursor-pointer transition-colors ${selectedRa?.id === ra.id ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                      <td className="px-7 py-6">
                        <span className="text-sm font-semibold text-gray-900">{ra.codigo}</span>
                      </td>
                      <td className="px-4 py-6">
                        <span className="text-sm text-gray-900">{ra.descripcion}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-100">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-2 text-sm text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex items-center gap-2">
                {totalPages > 0 && [...Array(totalPages)].map((_, idx) => (
                  <button key={idx + 1} onClick={() => setCurrentPage(idx + 1)} className={`w-8 h-8 rounded text-sm font-medium ${currentPage === idx + 1 ? "bg-[#171A1F] text-white" : "text-[#171A1F] hover:bg-gray-100"}`}>
                    {idx + 1}
                  </button>
                ))}
              </div>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-2 text-sm text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed">
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <Button variant="destructive" className="h-10 px-6 rounded-md shadow-sm" onClick={() => router.push("/asignaturas/nueva/matriz-raa-ra")}>
              Cancelar
            </Button>
            <Button disabled={!selectedRa || loading} onClick={handleNext} className={`h-10 px-6 rounded-md shadow-sm ${selectedRa && !loading ? "bg-[#003366] hover:bg-[#002244] text-white" : "bg-gray-200 text-white hover:bg-gray-200 cursor-not-allowed"}`}>
              Guardar
            </Button>
          </div>
        </div>
      </Layout>
    </AcademicRoute>
  );
}
