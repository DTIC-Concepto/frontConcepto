"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { Steps } from "@/components/StepIndicator";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

interface RAItem {
  code: string;
  description: string;
}

const raData: RAItem[] = [
  { code: "RG1", description: "Comprender los principios fundamentales de la ingeniería de software." },
  { code: "RG2", description: "Diseñar y desarrollar sistemas de software escalables y seguros." },
  { code: "RG3", description: "Aplicar metodologías ágiles en la gestión de proyectos de software." },
  { code: "RG4", description: "Integrar herramientas y tecnologías modernas en el ciclo de vida de desarrollo" },
  { code: "RG5", description: "Comprender los principios fundamentales de la ingeniería de software." },
];

export default function RaSelection() {
  const router = useRouter();
  const [selectedRa, setSelectedRa] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleRowClick = (code: string) => {
    setSelectedRa(code);
  };

  const handleNext = () => {
    if (selectedRa) {
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
              />
            </div>
            <div className="relative">
              <select className="w-[276px] h-10 pl-3 pr-8 appearance-none rounded-md border border-gray-200 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#003366]">
                <option>Tipo de Aprendizaje</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-7 py-3.5 text-left text-sm font-normal text-gray-500 w-[100px]">Código</th>
                  <th className="px-7 py-3.5 text-center text-sm font-normal text-gray-500">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {raData.map((item) => (
                  <tr
                    key={item.code}
                    onClick={() => handleRowClick(item.code)}
                    className={`cursor-pointer transition-colors ${
                      selectedRa === item.code
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-7 py-6 text-center">
                      <span className="text-sm font-semibold text-gray-900">{item.code}</span>
                    </td>
                    <td className="px-4 py-6">
                      <span className="text-sm text-gray-500">{item.description}</span>
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
              disabled={!selectedRa}
              onClick={handleNext}
              className={`h-10 px-6 rounded-md shadow-sm ${
                selectedRa
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
