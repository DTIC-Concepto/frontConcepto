"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Search, ChevronLeft, ChevronRight, Plus, SquarePen, Trash2 } from "lucide-react";

interface Faculty {
  code: string;
  name: string;
  careers: number;
  dean: string;
}

const facultiesData: Faculty[] = [
  { code: "FIEE", name: "Facultad de Ingeniería Eléctrica y Electrónica", careers: 5, dean: "Dr. Juan Pérez" },
  { code: "FICM", name: "Facultad de Ingeniería en Ciencias de la Tierra", careers: 3, dean: "Ing. Ana García" },
  { code: "FAD", name: "Facultad de Administración", careers: 4, dean: "MSc. Carlos Vaca" },
  { code: "FCyS", name: "Facultad de Ciencias y Sistemas", careers: 6, dean: "Dra. Laura Mena" },
  { code: "FA", name: "Facultad de Artes", careers: 2, dean: "Lic. Pedro Salas" },
  { code: "FCI", name: "Facultad de Ciencias Informáticas", careers: 7, dean: "Dr. Roberto Solís" },
  { code: "FCI", name: "Facultad de Ciencias Informáticas", careers: 7, dean: "Dr. Roberto Solís" },
];

export default function Facultades() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <ProtectedRoute>
      <Layout>
      <div className="p-4 md:p-6">
        <div className="mb-6 md:mb-9">
          <h1 className="text-3xl md:text-4xl font-bold font-montserrat text-[#171A1F]">
            Gestión de Facultades
          </h1>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded border border-border p-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="flex-1 flex items-center gap-1.5 px-3 py-2 border border-border rounded bg-white">
            <Search className="w-4 h-4 text-[#565D6D] flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 text-sm outline-none text-[#171A1F] placeholder:text-[#565D6D] min-w-0"
            />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 border border-border rounded bg-white md:min-w-[180px]">
            <span className="text-sm flex-1 truncate text-[#171A1F]">Filtrar por Carreras</span>
            <ChevronLeft className="w-4 h-4 text-[#171A1F] rotate-[-90deg] flex-shrink-0" />
          </div>
          <button className="bg-[#003366] text-white px-4 py-2.5 rounded flex items-center justify-center gap-2 text-sm font-medium hover:bg-[#003366]/90 transition-colors whitespace-nowrap">
            <Plus className="w-4 h-4" />
            Nueva Facultad
          </button>
        </div>

        {/* Table - Desktop */}
        <div className="hidden md:block bg-white rounded border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F3F4F6]">
                  <th className="text-left px-4 py-3.5 text-sm font-normal text-[#565D6D]">Código</th>
                  <th className="text-left px-4 py-3.5 text-sm font-normal text-[#565D6D]">Nombre</th>
                  <th className="text-left px-4 py-3.5 text-sm font-normal text-[#565D6D]">Carreras</th>
                  <th className="text-left px-4 py-3.5 text-sm font-normal text-[#565D6D]">Decano</th>
                  <th className="text-center px-4 py-3.5 text-sm font-normal text-[#565D6D]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facultiesData.map((faculty, index) => (
                  <tr key={index} className="border-t border-border">
                    <td className="px-4 py-4 text-sm text-[#171A1F]">{faculty.code}</td>
                    <td className="px-4 py-4 text-sm text-[#171A1F]">{faculty.name}</td>
                    <td className="px-4 py-4 text-sm text-[#171A1F]">{faculty.careers}</td>
                    <td className="px-4 py-4 text-sm text-[#171A1F]">{faculty.dean}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 hover:bg-accent rounded transition-colors">
                          <SquarePen className="w-4 h-4 text-[#003366]" />
                        </button>
                        <button className="p-2 hover:bg-accent rounded transition-colors">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {facultiesData.map((faculty, index) => (
            <div key={index} className="bg-white rounded border border-border shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs text-[#565D6D] mb-1">Código</div>
                  <div className="font-medium text-[#171A1F]">{faculty.code}</div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-accent rounded transition-colors">
                    <SquarePen className="w-4 h-4 text-[#003366]" />
                  </button>
                  <button className="p-2 hover:bg-accent rounded transition-colors">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
              <div className="mb-2">
                <div className="text-xs text-[#565D6D] mb-1">Nombre</div>
                <div className="text-sm text-[#171A1F]">{faculty.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-[#565D6D] mb-1">Carreras</div>
                  <div className="text-sm text-[#171A1F]">{faculty.careers}</div>
                </div>
                <div>
                  <div className="text-xs text-[#565D6D] mb-1">Decano</div>
                  <div className="text-sm text-[#171A1F]">{faculty.dean}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 md:gap-6 mt-6 flex-wrap">
          <button className="flex items-center gap-2 text-sm text-[#171A1F] hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>
          <div className="flex items-center gap-3 md:gap-4">
            <button className="text-sm text-[#171A1F] hover:text-primary transition-colors">1</button>
            <button className="text-sm text-[#171A1F] hover:text-primary transition-colors">2</button>
            <button className="text-sm text-[#171A1F] hover:text-primary transition-colors">3</button>
          </div>
          <button className="flex items-center gap-2 text-sm text-[#171A1F] hover:text-primary transition-colors">
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Layout>
    </ProtectedRoute>
  );
}