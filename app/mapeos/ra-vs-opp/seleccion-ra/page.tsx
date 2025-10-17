"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { Search, ChevronLeft, ChevronRight, Filter, X, Save, Loader2 } from "lucide-react";
import { type LearningOutcome } from "@/lib/learning-outcomes";
import { type ProgramObjective } from "@/lib/program-objectives";

const ITEMS_PER_PAGE = 5;

export default function SeleccionRA() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRA, setSelectedRA] = useState<LearningOutcome | null>(null);
  const [selectedOPP, setSelectedOPP] = useState<ProgramObjective | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'GENERAL' | 'ESPECIFICO'>('all');
  const [raList, setRaList] = useState<LearningOutcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar el OPP seleccionado del paso anterior
  useEffect(() => {
    const storedOPP = localStorage.getItem('selectedOPP');
    if (storedOPP) {
      setSelectedOPP(JSON.parse(storedOPP));
    } else {
      // Si no hay OPP seleccionado, redirigir al paso anterior
      router.push('/mapeos/ra-vs-opp/seleccion');
    }
  }, [router]);

  // Cargar RAs disponibles para el OPP seleccionado
  useEffect(() => {
    const loadRAData = async () => {
      if (!selectedOPP) return;
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/mappings/available-ras/opp/${selectedOPP.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Error al obtener resultados de aprendizaje disponibles');
        }
        const data = await response.json();
        setRaList(data);
      } catch (error) {
        console.error('Error cargando RAs:', error);
        setError('Error al cargar los resultados de aprendizaje. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    loadRAData();
  }, [selectedOPP]);

  const filteredRAs = useMemo(() => {
    return raList.filter(ra => {
      const matchesSearch = ra.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (ra.descripcion && ra.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterType === 'all' || ra.tipo === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterType, raList]);

  const totalPages = Math.ceil(filteredRAs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRAs = filteredRAs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSelectRA = (ra: LearningOutcome) => {
    setSelectedRA(ra);
  };

  const handleNext = () => {
    if (selectedRA && selectedOPP) {
      // Guardar la selección en localStorage para el siguiente paso
      localStorage.setItem('selectedRA', JSON.stringify(selectedRA));
      router.push('/mapeos/ra-vs-opp/nueva');
    }
  };

  return (
    <AcademicRoute>
      <Layout>
        <div className="p-8 space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-[#171A1F] font-montserrat">
              Matriz: Objetivos de Carrera (OPP) y Resultados de Aprendizaje (RA)
            </h1>
          </div>

          {/* Steps Indicator */}
          <div className="flex items-center justify-center gap-16">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#003366] border-2 border-gray-300 flex items-center justify-center">
                <span className="text-white font-medium font-open-sans">1</span>
              </div>
              <span className="text-sm text-[#565D6D] mt-2 font-open-sans">Seleccionar</span>
              <span className="text-sm text-[#565D6D] font-open-sans">Objetivos de carrera (OPP)</span>
            </div>

            <div className="w-32 h-0.5 bg-gray-400" />

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#003366] border-2 border-gray-300 flex items-center justify-center">
                <span className="text-white font-medium font-open-sans">2</span>
              </div>
              <span className="text-sm text-[#565D6D] mt-2 font-open-sans">Seleccionar</span>
              <span className="text-sm text-[#565D6D] font-open-sans">Resultados de Aprendizaje (RA)</span>
            </div>

            <div className="w-32 h-0.5 bg-gray-300" />

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-[#565D6D] font-medium font-open-sans">3</span>
              </div>
              <span className="text-sm text-[#565D6D] mt-2 font-open-sans">Justificar Relación</span>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#565D6D]" />
              <input
                type="text"
                placeholder="Buscar por código o descripción..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2 border border-[#DEE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] font-open-sans text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
            
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as 'all' | 'GENERAL' | 'ESPECIFICO');
                  setCurrentPage(1);
                }}
                disabled={loading}
                className="appearance-none pl-3 pr-8 py-2 border border-[#DEE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] font-open-sans text-sm bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="all">Todos los tipos</option>
                <option value="GENERAL">Resultados Generales (RG)</option>
                <option value="ESPECIFICO">Resultados Específicos (RE)</option>
              </select>
              <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#565D6D] pointer-events-none" />
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-open-sans">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-red-600 hover:text-red-800 underline font-open-sans text-sm"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-lg border border-[#DEE1E6] shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F3F4F6] border-b border-[#DEE1E6]">
                  <th className="px-7 py-3 text-left text-sm font-medium text-[#171A1F] font-open-sans">Código</th>
                  <th className="px-20 py-3 text-left text-sm font-medium text-[#171A1F] font-open-sans">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEE1E6]">
                {loading ? (
                  <tr>
                    <td colSpan={2} className="px-7 py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-[#003366]" />
                        <span className="text-[#565D6D] font-open-sans">Cargando resultados de aprendizaje...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedRAs.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-7 py-8 text-center">
                      <span className="text-[#565D6D] font-open-sans">
                        {searchTerm || filterType !== 'all' 
                          ? 'No se encontraron resultados de aprendizaje que coincidan con los filtros' 
                          : 'No hay resultados de aprendizaje disponibles'
                        }
                      </span>
                    </td>
                  </tr>
                ) : (
                  paginatedRAs.map((ra) => (
                    <tr 
                      key={ra.codigo}
                      className={`hover:bg-[#F3F4F6] cursor-pointer transition-colors ${
                        selectedRA?.codigo === ra.codigo ? 'bg-[#E6F3FF]' : ''
                      }`}
                      onClick={() => handleSelectRA(ra)}
                    >
                      <td className="px-7 py-4">
                        <span className="font-semibold text-[#171A1F] font-open-sans">{ra.codigo}</span>
                      </td>
                      <td className="px-20 py-4 text-[#565D6D] font-open-sans">{ra.descripcion}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="border-t border-[#DEE1E6] px-6 py-4 flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 text-[#171A1F] disabled:text-[#565D6D] disabled:cursor-not-allowed font-open-sans text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-8 h-8 rounded text-sm font-medium font-open-sans ${
                      currentPage === idx + 1
                        ? 'bg-[#171A1F] text-white'
                        : 'text-[#171A1F] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 text-[#171A1F] disabled:text-[#565D6D] disabled:cursor-not-allowed font-open-sans text-sm"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => router.push('/mapeos/ra-vs-opp/seleccion')}
              className="flex items-center gap-2 px-6 py-2 bg-[#DC3546] text-white rounded-md hover:bg-[#DC3546]/90 transition-colors font-open-sans text-sm"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button 
              onClick={handleNext}
              disabled={!selectedRA || loading}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-colors font-open-sans text-sm ${
                selectedRA && !loading
                  ? 'bg-[#003366] text-white hover:bg-[#003366]/90'
                  : 'bg-gray-300 text-white cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
          </div>
        </div>
      </Layout>
    </AcademicRoute>
  );
}