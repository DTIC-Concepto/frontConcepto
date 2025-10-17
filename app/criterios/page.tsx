"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import CoordinadorRoute from "@/components/CoordinadorRoute";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Criterio {
  id: string;
  codigo: string;
  descripcion: string;
}

export default function Criterios() {
  const [searchTerm, setSearchTerm] = useState("");

  const criterios: Criterio[] = [
    {
      id: "1",
      codigo: "5.4.1",
      descripcion:
        "La investigación en la solución de problemas complejos de ingeniería en el campo de estudio pertinente, incluyendo la formulación experimental, análisis e interpretación de datos utilizando conocimientos básicos y avanzados.",
    },
    {
      id: "2",
      codigo: "5.4.2",
      descripcion:
        "Creación, selección y aplicación de los recursos y métodos necesarios, incluyendo la predicción y la modelación, técnicas modernas y herramientas de TI para resolver problemas complejos de ingeniería en el campo de estudio pertinente, teniendo en cuenta las posibles restricciones",
    },
    {
      id: "3",
      codigo: "5.4.3",
      descripcion:
        "La especialización y enfoque en el mercado de trabajo. Demostración de competencias relacionadas con los problemas, objetivos y tipos de actividades complejas de ingeniería específicos, correspondientes a la formación y el perfil de la dirección en las empresas y organizaciones ‐. Potenciales empleadores.",
    },
    {
      id: "4",
      codigo: "5.4.4",
      descripcion:
        "Ingeniería práctica. Creación, selección y aplicación de los recursos y métodos necesarios, incluyendo la predicción y la modelación, técnicas modernas y herramientas de TI para resolver problemas complejos de ingeniería en el campo de estudio pertinente, teniendo en cuenta las posibles restricciones",
    },
    {
      id: "5",
      codigo: "5.4.5",
      descripcion:
        "La investigación en la solución de problemas complejos de ingeniería en el campo de estudio pertinente, incluyendo la formulación experimental, análisis e interpretación de datos utilizando conocimientos básicos y avanzados.",
    },
  ];

  return (
    <CoordinadorRoute>
      <Layout>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#171A1F] font-['Open_Sans']">
              Criterios EUR-ACE
            </h1>
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
                </tr>
              </thead>
              <tbody>
                {criterios.map((criterio) => (
                  <tr key={criterio.id} className="border-b border-[#DEE1E6] last:border-0">
                    <td className="px-7 py-6 align-top">
                      <span className="text-sm font-semibold text-[#171A1F] font-['Open_Sans']">
                        {criterio.codigo}
                      </span>
                    </td>
                    <td className="px-5 py-6">
                      <span className="text-[13px] leading-normal text-black font-[Montserrat]">
                        {criterio.descripcion}
                      </span>
                    </td>
                  </tr>
                ))}
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
      </div>
    </Layout>
    </CoordinadorRoute>
  );
}