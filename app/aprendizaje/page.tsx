"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import CoordinadorRoute from "@/components/CoordinadorRoute";
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResultadoAprendizaje {
  id: string;
  codigo: string;
  descripcion: string;
}

export default function Aprendizaje() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("generales");

  const resultadosGenerales: ResultadoAprendizaje[] = [
    {
      id: "1",
      codigo: "RG0",
      descripcion: "Comprender los principios fundamentales de la ingeniería de software.",
    },
    {
      id: "2",
      codigo: "RG2",
      descripcion: "Diseñar y desarrollar sistemas de software escalables y seguros.",
    },
    {
      id: "3",
      codigo: "RG3",
      descripcion: "Aplicar metodologías ágiles en la gestión de proyectos de software.",
    },
    {
      id: "4",
      codigo: "RG4",
      descripcion: "Integrar herramientas y tecnologías modernas en el ciclo de vida de desarrollo",
    },
    {
      id: "5",
      codigo: "RG5",
      descripcion: "Comprender los principios fundamentales de la ingeniería de software.",
    },
  ];

  return (
    <CoordinadorRoute>
      <Layout>
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-[#171A1F] font-['Open_Sans']">
              Gestión de Resultados de Aprendizaje (RA)
            </h1>
            <Button className="bg-[#003366] hover:bg-[#002244] text-white gap-2">
              <Plus className="w-4 h-4" />
            Nuevo RA
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-white border-b border-[#DEE1E6] rounded-none w-full justify-start h-auto p-0">
            <TabsTrigger
              value="generales"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#003366] rounded-none px-4 py-3 text-sm font-medium"
            >
              Resultados Generales (RG)
            </TabsTrigger>
            <TabsTrigger
              value="especificos"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#003366] rounded-none px-4 py-3 text-sm font-medium"
            >
              Resultados Específicos (RE)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generales" className="mt-6">
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
                    {resultadosGenerales.map((resultado) => (
                      <tr key={resultado.id} className="border-b border-[#DEE1E6] last:border-0">
                        <td className="px-7 py-6">
                          <span className="text-sm font-semibold text-[#171A1F] font-['Open_Sans']">
                            {resultado.codigo}
                          </span>
                        </td>
                        <td className="px-5 py-6">
                          <span className="text-sm text-[#565D6D]">{resultado.descripcion}</span>
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
          </TabsContent>

          <TabsContent value="especificos">
            <div className="text-center py-12 text-[#565D6D]">
              Resultados Específicos - En construcción
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
    </CoordinadorRoute>
  );
}