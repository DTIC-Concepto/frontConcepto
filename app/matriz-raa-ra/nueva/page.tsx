"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { Steps } from "@/components/StepIndicator";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface RAAItem {
  code: string;
  type: string;
  description: string;
}

const raaData: RAAItem[] = [
  { code: "1.1", type: "De Conocimiento", description: "Conocer los componentes, tecnología, información e impacto social de los sistemas de información" },
  { code: "1.2", type: "De Conocimiento", description: "Conocer los componentes, tecnología, información e impacto social de los sistemas de información" },
  { code: "1.3", type: "De Conocimiento", description: "Conocer los componentes, tecnología, información e impacto social de los sistemas de información" },
  { code: "2.1", type: "De Conocimiento", description: "Conocer los componentes, tecnología, información e impacto social de los sistemas de información" },
  { code: "2.2", type: "De Conocimiento", description: "Conocer los componentes, tecnología, información e impacto social de los sistemas de información" },
];

export default function RaaSelection() {
  const router = useRouter();
  const [selectedRaa, setSelectedRaa] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleRowClick = (code: string) => {
    setSelectedRaa(code);
  };

  const handleNext = () => {
    if (selectedRaa) {
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
                {raaData.map((item) => (
                  <tr
                    key={item.code}
                    onClick={() => handleRowClick(item.code)}
                    className={`cursor-pointer transition-colors ${
                      selectedRaa === item.code
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-7 py-6 text-center">
                      <span className="text-sm font-semibold text-gray-900">{item.code}</span>
                    </td>
                    <td className="px-4 py-6">
                      <span className="text-sm text-gray-500">{item.type}</span>
                    </td>
                    <td className="px-4 py-6">
                      <span className="text-xs text-gray-900 text-center block">{item.description}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-100">
              <button className="flex items-center gap-2 text-sm text-gray-900">
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex items-center gap-6">
                <button className="text-sm text-gray-900">1</button>
                <button className="text-sm text-gray-900">2</button>
                <button className="text-sm text-gray-900">3</button>
              </div>
              <button className="flex items-center gap-2 text-sm text-gray-900">
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="destructive"
              className="h-10 px-6 rounded-md shadow-sm"
              onClick={() => router.push("/construccion")}
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
