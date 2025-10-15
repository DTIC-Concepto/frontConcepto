"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { Search, ChevronLeft, ChevronRight, X, Save } from "lucide-react";
import { oppList, type OPP } from "@/lib/mockData";

const ITEMS_PER_PAGE = 5;

export default function SeleccionOPP() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOPP, setSelectedOPP] = useState<OPP | null>(null);

  const filteredOPPs = useMemo(() => {
    return oppList.filter(
      (opp) =>
        opp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredOPPs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOPPs = filteredOPPs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSelectOPP = (opp: OPP) => {
    setSelectedOPP(opp);
  };

  const handleNext = () => {
    if (selectedOPP) {
      // Guardar la selección en localStorage para el siguiente paso
      localStorage.setItem('selectedOPP', JSON.stringify(selectedOPP));
      router.push('/mapeos/ra-vs-opp/seleccion-ra');
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

            <div className="w-32 h-0.5 bg-gray-300" />

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                <span className="text-[#565D6D] font-medium font-open-sans">2</span>
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

          {/* Search */}
          <div className="">
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
                className="w-full pl-10 pr-4 py-2 border border-[#DEE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] font-open-sans text-sm"
              />
            </div>
          </div>

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
                {paginatedOPPs.map((opp) => (
                  <tr 
                    key={opp.code} 
                    className={`hover:bg-[#F3F4F6] cursor-pointer transition-colors ${
                      selectedOPP?.code === opp.code ? 'bg-[#E6F3FF]' : ''
                    }`}
                    onClick={() => handleSelectOPP(opp)}
                  >
                    <td className="px-7 py-4">
                      <span className="font-semibold text-[#171A1F] font-open-sans">{opp.code}</span>
                    </td>
                    <td className="px-20 py-4 text-[#565D6D] font-open-sans">{opp.description}</td>
                  </tr>
                ))}
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
              onClick={() => router.push('/mapeos/ra-vs-opp')}
              className="flex items-center gap-2 px-6 py-2 bg-[#DC3546] text-white rounded-md hover:bg-[#DC3546]/90 transition-colors font-open-sans text-sm"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button 
              onClick={handleNext}
              disabled={!selectedOPP}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-colors font-open-sans text-sm ${
                selectedOPP
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