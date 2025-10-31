"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { Steps } from "@/components/StepIndicator";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MappingsService } from "@/lib/mappings";
import NotificationService from "@/lib/notifications";
import type { Raa } from "@/lib/raa";

interface RAItem {
  id: number;
  code: string;
  name: string;
  type: 'GENERAL' | 'ESPECIFICO';
}

export default function RaSelection() {
  const router = useRouter();
  const [selectedRa, setSelectedRa] = useState<RAItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");
  const [raList, setRaList] = useState<RAItem[]>([]);
  const [filteredRaList, setFilteredRaList] = useState<RAItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRaa, setSelectedRaa] = useState<Raa | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Cargar RAA seleccionado del localStorage
  useEffect(() => {
    const raaString = typeof window !== 'undefined' 
      ? localStorage.getItem('selected_raa')
      : null;
    
    if (raaString) {
      try {
        const raa = JSON.parse(raaString);
        setSelectedRaa(raa);
      } catch (error) {
        console.error('Error parsing selected RAA:', error);
        NotificationService.error('Error', 'No se pudo cargar el RAA seleccionado');
        router.push('/matriz-raa-ra/nueva');
      }
    } else {
      NotificationService.error('Error', 'No se encontró el RAA seleccionado');
      router.push('/matriz-raa-ra/nueva');
    }
  }, [router]);

  // Cargar RAs disponibles cuando se tiene el RAA
  useEffect(() => {
    if (selectedRaa && selectedRaa.id) {
      loadAvailableRas();
    }
  }, [selectedRaa]);

  // Filtrar RAs cuando cambia la búsqueda o el filtro de tipo
  useEffect(() => {
    let filtered = raList;

    // Filtrar por búsqueda
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(ra =>
        ra.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ra.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por tipo
    if (tipoFilter && tipoFilter !== "todos") {
      filtered = filtered.filter(ra => ra.type === tipoFilter);
    }

    setFilteredRaList(filtered);
    setCurrentPage(1);
  }, [searchQuery, tipoFilter, raList]);

  const loadAvailableRas = async () => {
    if (!selectedRaa?.id) return;

    try {
      setIsLoading(true);
      
      // Obtener carreraId
      let carreraId: number | null = null;
      const rawUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
      if (rawUser) {
        const parsedUser = JSON.parse(rawUser);
        carreraId = parsedUser?.carreraIds?.[0] ?? parsedUser?.carrera?.id ?? parsedUser?.carreraId ?? null;
      }

      if (!carreraId) {
        NotificationService.error('Error', 'No se encontró el ID de carrera');
        return;
      }

      const data: any = await MappingsService.getAvailableRasForRaa(selectedRaa.id, carreraId);
      
      // Mapear los datos del backend
      const rasArray = Array.isArray(data) ? data : (data.ras || []);
      const mappedRas = rasArray.map((ra: any) => ({
        id: ra.id,
        code: ra.code || ra.codigo,
        name: ra.name || ra.nombre || ra.descripcion,
        type: ra.type || ra.tipo
      }));

      setRaList(mappedRas);
      setFilteredRaList(mappedRas);
    } catch (error) {
      console.error('Error cargando RAs disponibles:', error);
      NotificationService.error('Error', 'No se pudieron cargar los resultados de aprendizaje');
      setRaList([]);
      setFilteredRaList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (ra: RAItem) => {
    setSelectedRa(ra);
  };

  const handleNext = () => {
    if (selectedRa) {
      // Guardar RA seleccionado en localStorage
      localStorage.setItem('selected_ra', JSON.stringify(selectedRa));
      router.push("/matriz-raa-ra/nueva/paso-3");
    }
  };

  const handleBack = () => {
    router.push("/matriz-raa-ra/nueva");
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
  const totalPages = Math.ceil(filteredRaList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRas = filteredRaList.slice(startIndex, endIndex);

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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
              />
            </div>
            <div className="w-[276px]">
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de Aprendizaje" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="ESPECIFICO">Específico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
                <span className="ml-3 text-[#565D6D]">Cargando RAs disponibles...</span>
              </div>
            </div>
          ) : currentRas.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="text-center text-[#565D6D]">
                <p className="text-lg mb-2">No hay resultados disponibles</p>
                <p className="text-sm">
                  {searchQuery || tipoFilter !== "todos" 
                    ? 'No se encontraron RAs que coincidan con los filtros seleccionados.' 
                    : 'No se encontraron resultados de aprendizaje disponibles.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-7 py-3.5 text-left text-sm font-normal text-gray-500 w-[100px]">Código</th>
                    <th className="px-7 py-3.5 text-left text-sm font-normal text-gray-500 w-[120px]">Tipo</th>
                    <th className="px-7 py-3.5 text-center text-sm font-normal text-gray-500">Descripción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentRas.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className={`cursor-pointer transition-colors ${
                        selectedRa?.id === item.id
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-7 py-6 text-center">
                        <span className="text-sm font-semibold text-gray-900">{item.code}</span>
                      </td>
                      <td className="px-4 py-6">
                        <span className="text-xs text-gray-500">{item.type === 'GENERAL' ? 'General' : 'Específico'}</span>
                      </td>
                      <td className="px-4 py-6">
                        <span className="text-sm text-gray-500">{item.name}</span>
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

          <div className="flex justify-between gap-4 mt-6">
            <Button
              variant="outline"
              className="h-10 px-6 rounded-md shadow-sm"
              onClick={handleBack}
            >
              Atrás
            </Button>
            <div className="flex gap-4">
              <Button
                variant="destructive"
                className="h-10 px-6 rounded-md shadow-sm"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <Button
                disabled={!selectedRa}
                onClick={handleNext}
                className={`h-10 px-6 rounded-md shadow-sm ${
                  selectedRa
                    ? "bg-[#003366] hover:bg-[#002244] text-white"
                    : "bg-gray-200 text-white hover:bg-gray-200 cursor-not-allowed"
                }`}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    </AcademicRoute>
  );
}
