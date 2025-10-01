import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Building, GraduationCap, Users } from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      icon: Building,
      label: "Total Facultades",
      value: "5",
    },
    {
      icon: GraduationCap,
      label: "Total Carreras",
      value: "20",
    },
    {
      icon: Users,
      label: "Usuarios Activos",
      value: "45",
    },
  ];

  const recentActivity = [
    {
      time: "Hace 5 min",
      user: "admin@epn.edu.ec",
      action: "Creó nueva facultad 'FIEC'",
    },
    {
      time: "Hace 15 min",
      user: "decano@epn.edu.ec",
      action: "Actualizó datos de carrera 'Ingeniería Civil'",
    },
    {
      time: "Hace 30 min",
      user: "ci@epn.edu.ec",
      action: "Revisó informe de acreditación",
    },
    {
      time: "Hace 1 hora",
      user: "admin@epn.edu.ec",
      action: "Asignó rol a 'profesor@epn.edu.ec'",
    },
    {
      time: "Hace 2 horas",
      user: "coordinador@epn.edu.ec",
      action: "Registró nuevo profesor 'Juan Pérez'",
    },
  ];

  const quickActions = [
    { label: "Gestionar Carreras", icon: GraduationCap },
    { label: "Gestionar Usuarios", icon: Users },
    { label: "Ver Mi Perfil", icon: Users },
  ];

  return (
    <ProtectedRoute>
      <Layout>
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <h1 className="text-[#171A1F] font-montserrat text-2xl md:text-3xl font-bold">
          Bienvenido, Julio
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded border border-white shadow-[0_0_2px_0_rgba(23,26,31,0.08),0_0_1px_0_rgba(23,26,31,0.05)] p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#565D6D] font-open-sans text-sm uppercase tracking-wide mb-2">
                      {stat.label}
                    </p>
                    <p className="text-[#171A1F] font-montserrat text-4xl font-bold">
                      {stat.value}
                    </p>
                  </div>
                  <Icon className="w-16 h-16 md:w-20 md:h-20 text-[#003366]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded border border-white shadow-[0_0_2px_0_rgba(23,26,31,0.08),0_0_1px_0_rgba(23,26,31,0.05)]">
          <div className="p-4 border-b border-[#DEE1E6]">
            <h2 className="text-[#171A1F] font-open-sans text-lg font-semibold">
              Acceso Rápido
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  className="flex flex-col items-center justify-center gap-4 p-6 bg-white hover:bg-gray-50 rounded transition-colors"
                >
                  <Icon className="w-8 h-8 text-[#003366]" />
                  <span className="text-[#171A1F] text-sm text-center">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded border border-white shadow-[0_0_2px_0_rgba(23,26,31,0.08),0_0_1px_0_rgba(23,26,31,0.05)]">
          <div className="p-6">
            <h2 className="text-[#171A1F] font-open-sans text-lg font-semibold mb-6">
              Actividad Reciente
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F3F4F6]/50">
                    <th className="text-left px-4 py-3.5 text-[#565D6D] font-open-sans text-sm font-normal">
                      Hora
                    </th>
                    <th className="text-left px-4 py-3.5 text-[#565D6D] font-open-sans text-sm font-normal">
                      Usuario
                    </th>
                    <th className="text-left px-4 py-3.5 text-[#565D6D] font-open-sans text-sm font-normal">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity, index) => (
                    <tr
                      key={index}
                      className="border-t border-[#DEE1E6] hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 text-[#171A1F] font-open-sans text-sm whitespace-nowrap">
                        {activity.time}
                      </td>
                      <td className="px-4 py-4 text-[#565D6D] font-open-sans text-sm">
                        {activity.user}
                      </td>
                      <td className="px-4 py-4 text-[#565D6D] font-open-sans text-sm">
                        {activity.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
    </ProtectedRoute>
  );
}