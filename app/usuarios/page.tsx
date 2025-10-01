"use client";

import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Search, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

export default function Usuarios() {
  const [searchTerm, setSearchTerm] = useState("");

  const users = [
    {
      email: "juan.perez@epn.edu.ec",
      name: "Juan Pérez",
      role: "Administrador",
      status: "Activo",
    },
    {
      email: "juan.perez@epn.edu.ec",
      name: "Juan Pérez",
      role: "Autoridad/Profesor",
      status: "Inactivo",
    },
    {
      email: "juan.perez@epn.edu.ec",
      name: "Juan Pérez",
      role: "CEI",
      status: "Activo",
    },
    {
      email: "juan.perez@epn.edu.ec",
      name: "Juan Pérez",
      role: "Coordinador de Carrera/Profesor",
      status: "Activo",
    },
    {
      email: "juan.perez@epn.edu.ec",
      name: "Juan Pérez",
      role: "CEI/Profesor",
      status: "Activo",
    },
  ];

  return (
    <ProtectedRoute>
      <Layout>
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-[#171A1F] font-montserrat text-2xl md:text-4xl font-bold">
            Gestión de Usuarios
          </h1>
          <button className="px-4 py-2 bg-[#003366] text-white font-open-sans text-sm rounded hover:bg-[#003366]/90 transition-colors whitespace-nowrap">
            + Nuevo Usuario
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded border border-[#DEE1E6] p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#565D6D]" />
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded border border-[#DEE1E6] bg-white text-sm text-[#171A1F] placeholder:text-[#565D6D] focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
              />
            </div>

            {/* Role Filter */}
            <select className="px-3 py-2 rounded border border-[#DEE1E6] bg-white text-[#171A1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]">
              <option>Todos los Roles</option>
              <option>Administrador</option>
              <option>Profesor</option>
              <option>Decano</option>
            </select>

            {/* Status Filter */}
            <select className="px-3 py-2 rounded border border-[#DEE1E6] bg-white text-[#171A1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]">
              <option>Todos los Estados</option>
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded border border-white shadow-[0_0_2px_0_rgba(23,26,31,0.08),0_0_1px_0_rgba(23,26,31,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F3F4F6]/50">
                  <th className="text-left px-4 py-3.5 text-[#565D6D] font-open-sans text-sm font-normal">
                    Email
                  </th>
                  <th className="text-left px-4 py-3.5 text-[#565D6D] font-open-sans text-sm font-normal">
                    Nombre
                  </th>
                  <th className="text-left px-4 py-3.5 text-[#565D6D] font-open-sans text-sm font-normal">
                    Rol
                  </th>
                  <th className="text-left px-4 py-3.5 text-[#565D6D] font-open-sans text-sm font-normal">
                    Estado
                  </th>
                  <th className="text-left px-4 py-3.5 text-[#565D6D] font-open-sans text-sm font-normal">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={index}
                    className="border-t border-[#DEE1E6] hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 text-[#171A1F] font-open-sans text-sm">
                      {user.email}
                    </td>
                    <td className="px-4 py-4 text-[#171A1F] font-open-sans text-sm">
                      {user.name}
                    </td>
                    <td className="px-4 py-4 text-[#171A1F] font-open-sans text-sm">
                      {user.role}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          user.status === "Activo"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-[#003366] hover:bg-gray-100 rounded transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-red-600 hover:bg-gray-100 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-[#DEE1E6] px-4 py-3">
            <div className="flex items-center justify-center gap-4 text-sm text-[#171A1F] font-open-sans">
              <button className="flex items-center gap-1 hover:underline">
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex items-center gap-4">
                <button className="hover:underline">1</button>
                <button className="hover:underline">2</button>
                <button className="hover:underline">3</button>
              </div>
              <button className="flex items-center gap-1 hover:underline">
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
    </ProtectedRoute>
  );
}