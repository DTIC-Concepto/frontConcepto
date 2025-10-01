"use client";

import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ChevronDown, Lock } from "lucide-react";
import { useState } from "react";

export default function Perfil() {
  const [showPermissions, setShowPermissions] = useState(false);

  const personalInfo = {
    name: "Juan Pérez García",
    email: "juan.perez@epn.edu.ec",
    faculty: "Ingeniería de Sistemas",
    phone: "+593 987 654 321",
    registrationDate: "2023-01-15",
  };

  const roles = [
    { name: "Profesor", color: "bg-[#003366]" },
    { name: "Decano", color: "bg-[#16A34A]" },
  ];

  const permissions = [
    "Visualizar Dashboard",
    "Gestionar Cursos",
    "Registrar Calificaciones",
    "Acceso a Mi Perfil",
    "Participar en proyectos de acreditación",
  ];

  return (
    <ProtectedRoute>
      <Layout>
      <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-6xl">
        <h1 className="text-[#171A1F] font-montserrat text-2xl md:text-4xl font-bold">
          Mi Perfil
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded border border-white shadow-[0_0_2px_0_rgba(23,26,31,0.08),0_0_1px_0_rgba(23,26,31,0.05)] p-6">
            <h2 className="text-[#171A1F] font-montserrat text-xl font-semibold mb-6">
              Información Personal
            </h2>

            <div className="space-y-5">
              <div>
                <p className="text-[#565D6D] font-open-sans text-sm mb-1">
                  Nombre Completo:
                </p>
                <p className="text-[#171A1F] font-open-sans text-base">
                  {personalInfo.name}
                </p>
              </div>

              <div>
                <p className="text-[#565D6D] font-open-sans text-sm mb-1">
                  Correo Institucional:
                </p>
                <p className="text-[#171A1F] font-open-sans text-base">
                  {personalInfo.email}
                </p>
              </div>

              <div>
                <p className="text-[#565D6D] font-open-sans text-sm mb-1">
                  Facultad:
                </p>
                <p className="text-[#171A1F] font-open-sans text-base">
                  {personalInfo.faculty}
                </p>
              </div>

              <div>
                <p className="text-[#565D6D] font-open-sans text-sm mb-1">
                  Teléfono:
                </p>
                <p className="text-[#171A1F] font-open-sans text-base">
                  {personalInfo.phone}
                </p>
              </div>

              <div>
                <p className="text-[#565D6D] font-open-sans text-sm mb-1">
                  Fecha de Registro:
                </p>
                <p className="text-[#171A1F] font-open-sans text-base">
                  {personalInfo.registrationDate}
                </p>
              </div>
            </div>
          </div>

          {/* Roles and Permissions */}
          <div className="bg-white rounded border border-white shadow-[0_0_2px_0_rgba(23,26,31,0.08),0_0_1px_0_rgba(23,26,31,0.05)] p-6">
            <h2 className="text-[#171A1F] font-montserrat text-xl font-semibold mb-6">
              Rol y Permisos
            </h2>

            <div className="space-y-6">
              <div>
                <p className="text-[#565D6D] font-open-sans text-sm mb-3">
                  Rol Asignado:
                </p>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role, index) => (
                    <span
                      key={index}
                      className={`${role.color} text-white px-4 py-1.5 rounded-full text-base font-semibold font-open-sans`}
                    >
                      {role.name}
                    </span>
                  ))}
                </div>
              </div>

              <hr className="border-[#DEE1E6]" />

              <div>
                <button
                  onClick={() => setShowPermissions(!showPermissions)}
                  className="w-full flex items-center justify-between py-3 text-[#171A1F] font-montserrat text-base font-medium hover:bg-gray-50 rounded transition-colors"
                >
                  Ver Permisos Detallados
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showPermissions ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showPermissions && (
                  <div className="mt-4 space-y-3">
                    {permissions.map((permission, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Lock className="w-4 h-4 text-[#003366] flex-shrink-0 mt-0.5" />
                        <p className="text-[#565D6D] font-open-sans text-sm">
                          {permission}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded border border-white shadow-[0_0_2px_0_rgba(23,26,31,0.08),0_0_1px_0_rgba(23,26,31,0.05)] p-6">
            <h2 className="text-[#171A1F] font-montserrat text-xl font-semibold mb-4">
              Cambiar Contraseña
            </h2>

            <p className="text-[#565D6D] font-open-sans text-sm mb-6">
              Mantenga su cuenta segura actualizando su contraseña regularmente.
            </p>

            <button className="w-full px-4 py-2.5 bg-[#003366] text-white font-open-sans text-sm rounded hover:bg-[#003366]/90 transition-colors">
              Actualizar Contraseña
            </button>
          </div>
        </div>
      </div>
    </Layout>
    </ProtectedRoute>
  );
}