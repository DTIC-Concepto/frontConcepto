"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Building, GraduationCap, Users, User } from "lucide-react";
import { DashboardService, DashboardStats } from "@/lib/dashboard";
import { AuthService } from "@/lib/auth";
import { ActivityRecord } from "@/lib/api";

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalFacultades: 0,
    totalCarreras: 0,
    usuariosActivos: 0
  });
  const [recentActivity, setRecentActivity] = useState<ActivityRecord[]>([]);
  const [userName, setUserName] = useState<string>('Usuario');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    loadStats();
    loadRecentActivity();
    loadUserName();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const dashboardStats = await DashboardService.getStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error al cargar estadísticas del dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      setIsLoadingActivity(true);
      const activity = await DashboardService.getRecentActivity(5);
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error al cargar actividad reciente:', error);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const loadUserName = () => {
    const name = AuthService.getUserName();
    setUserName(name);
  };

  const statsConfig = [
    {
      icon: Building,
      label: "Total Facultades",
      value: isLoading ? "..." : DashboardService.formatStatValue(stats.totalFacultades),
      color: "text-blue-600"
    },
    {
      icon: GraduationCap,
      label: "Total Carreras",
      value: isLoading ? "..." : DashboardService.formatStatValue(stats.totalCarreras),
      color: "text-green-600"
    },
    {
      icon: Users,
      label: "Usuarios Activos",
      value: isLoading ? "..." : DashboardService.formatStatValue(stats.usuariosActivos),
      color: "text-purple-600"
    },
  ];

  const quickActions = [
    { label: "Gestionar Carreras", icon: GraduationCap, route: "/carreras" },
    { label: "Gestionar Usuarios", icon: Users, route: "/usuarios" },
    { label: "Ver Mi Perfil", icon: User, route: "/perfil" },
  ];

  const handleQuickAction = (route: string) => {
    router.push(route);
  };

  return (
    <ProtectedRoute>
      <Layout>
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <h1 className="text-[#171A1F] font-montserrat text-2xl md:text-3xl font-bold">
          Bienvenido, {userName}
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statsConfig.map((stat, index) => {
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
                  onClick={() => handleQuickAction(action.route)}
                  className="flex flex-col items-center justify-center gap-4 p-6 bg-white hover:bg-gray-50 rounded transition-colors border border-transparent hover:border-[#003366]/20 hover:shadow-sm"
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
                  {isLoadingActivity ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-[#565D6D] font-open-sans text-sm">
                        Cargando actividad reciente...
                      </td>
                    </tr>
                  ) : recentActivity.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-[#565D6D] font-open-sans text-sm">
                        No hay actividad reciente
                      </td>
                    </tr>
                  ) : (
                    recentActivity.map((activity, index) => (
                      <tr
                        key={index}
                        className="border-t border-[#DEE1E6] hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 text-[#171A1F] font-open-sans text-sm whitespace-nowrap">
                          {activity.hora}
                        </td>
                        <td className="px-4 py-4 text-[#565D6D] font-open-sans text-sm">
                          {activity.usuario}
                        </td>
                        <td className="px-4 py-4 text-[#565D6D] font-open-sans text-sm">
                          {activity.accion}
                        </td>
                      </tr>
                    ))
                  )}
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