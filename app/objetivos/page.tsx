"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import CeiReadOnlyRoute from "@/components/CeiReadOnlyRoute";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/Pagination";
import { AuthService } from "@/lib/auth";

interface Objetivo {
  id: string;
  codigo: string;
  descripcion: string;
}

export default function Objetivos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const objetivos: Objetivo[] = [
    {
      id: "1",
      codigo: "OPP1",
      descripcion: "Comprender los principios fundamentales de la ingeniería de software.",
    },
    {
      id: "2",
      codigo: "OPP2",
      descripcion: "Diseñar y desarrollar sistemas de software escalables y seguros.",
    },
    {
      id: "3",
      codigo: "OPP3",
      descripcion: "Aplicar metodologías ágiles en la gestión de proyectos de software.",
    },
    {
      id: "4",
      codigo: "OPP4",
      descripcion: "Integrar herramientas y tecnologías modernas en el ciclo de vida de desarrollo",
    },
    {
      id: "5",
      codigo: "OPP5",
      descripcion: "Comprender los principios fundamentales de la ingeniería de software.",
    },
    {
      id: "6",
      codigo: "OPP6",
      descripcion: "Evaluar y mejorar la calidad del software mediante pruebas y métricas.",
    },
    {
      id: "7",
      codigo: "OPP7",
      descripcion: "Liderar equipos de desarrollo y gestionar recursos técnicos.",
    },
  ];

  // Filtrar objetivos basado en el término de búsqueda
  const filteredObjetivos = objetivos.filter(objetivo =>
    objetivo.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    objetivo.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Configuración de paginación
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredObjetivos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentObjetivos = filteredObjetivos.slice(startIndex, endIndex);

  // Resetear página cuando cambie el filtro
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Obtener rol del usuario para controlar permisos de creación
  const [userRole, setUserRole] = useState<string | null>(null);
  const [canCreate, setCanCreate] = useState(false);

  // Inicializar datos del usuario solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = AuthService.getUserRole();
      setUserRole(role);
      setCanCreate(role === 'COORDINADOR');
    }
  }, []);

  return (
    <CeiReadOnlyRoute>
      <Layout>
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-[#171A1F] font-['Open_Sans']">
              Gestión de Objetivos de Carrera (OPP)
            </h1>
            {canCreate && (
              <Button className="bg-[#003366] hover:bg-[#002244] text-white gap-2">
                <Plus className="w-4 h-4" />
                Nuevo OPP
              </Button>
            )}
          </div>

        <div className="bg-white border border-[#DEE1E6] rounded-md p-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#565D6D]" />
            <Input
              type="text"
              placeholder="Buscar por código o descripción..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
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
                {currentObjetivos.map((objetivo) => (
                  <tr key={objetivo.id} className="border-b border-[#DEE1E6] last:border-0">
                    <td className="px-7 py-8">
                      <span className="text-sm font-semibold text-[#171A1F] font-['Open_Sans']">
                        {objetivo.codigo}
                      </span>
                    </td>
                    <td className="px-5 py-8">
                      <span className="text-sm text-[#565D6D]">{objetivo.descripcion}</span>
                    </td>
                    <td className="px-6 py-8">
                      {canCreate && (
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
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="mt-8"
        />
      </div>
    </Layout>
    </CeiReadOnlyRoute>
  );
}