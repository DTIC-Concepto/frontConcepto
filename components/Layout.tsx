"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AuthService } from "@/lib/auth";
import { ROLE_DISPLAY_NAMES, RoleType } from "@/lib/api";
import NotificationService from "@/lib/notifications";
import { useUser } from "@/contexts/UserContext";
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Users,
  ShieldCheck,
  User,
  Settings,
  LogOut,
  UserIcon,
  Home,
  Layers,
  BookOpen,
  FileText,
  ChevronDown,
  Table2,
  LayoutGrid,
  BarChart3,
  Scale,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Building2, label: "Facultades", path: "/facultades" },
  { icon: GraduationCap, label: "Carreras", path: "/carreras" },
  { icon: Users, label: "Usuarios", path: "/usuarios" },
  { icon: ShieldCheck, label: "Roles", path: "/roles" },
  { icon: User, label: "Mi Perfil", path: "/perfil" },
];

const coordinadorMenuItems = [
  { icon: Home, label: "Inicio", path: "/dashboard" },
  { icon: Layers, label: "Objetivos de Carrera", path: "/objetivos-carrera" },
  { icon: BookOpen, label: "R. de Aprendizaje", path: "/resultados-aprendizaje" },
  { icon: FileText, label: "Criterios EUR-ACE", path: "/criterios-eur-ace" },
  { icon: Table2, label: "Editor de Mapeos", path: "/editor-mapeos" },
  { icon: User, label: "Mi Perfil", path: "/perfil" },
];

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUser();
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [editorOpen, setEditorOpen] = useState(false);

  // Obtener datos del usuario al cargar el componente
  useEffect(() => {
    try {
      const role = AuthService.getUserRole();
      const name = AuthService.getUserName();
      setUserRole(role);
      setUserName(name);
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
    }
  }, []);

  const handleLogout = () => {
    try {
      // Primero limpiar el contexto de usuario
      logout();
      // Luego limpiar AuthService
      AuthService.logout();
      NotificationService.success(
        "Sesión cerrada",
        "Has cerrado sesión correctamente."
      );
    } catch (error) {
      console.error("Error en logout:", error);
      NotificationService.error(
        "Error",
        "Hubo un problema al cerrar la sesión."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 bg-[#003366] border-b border-[#DEE1E6] flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <svg
            className="w-8 h-8 flex-shrink-0"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" stroke="white" />
            <path
              d="M12.6337 21.5744C12.8853 20.6355 13.8503 20.0784 14.7892 20.3299C15.7281 20.5815 16.2853 21.5465 16.0337 22.4854L14.7016 27.4569C14.56 27.9851 14.0172 28.2984 13.4891 28.157L12.0015 27.7583C11.4735 27.6169 11.16 27.074 11.3016 26.5459L12.6337 21.5744Z"
              fill="white"
            />
            <path
              d="M19.0936 19.0233C19.7809 18.336 20.8954 18.336 21.5827 19.0233L25.3329 22.7735C25.7195 23.1602 25.7195 23.787 25.3329 24.1736L24.244 25.2625C23.8574 25.6491 23.2306 25.6491 22.8439 25.2625L19.0936 21.5122C18.4063 20.825 18.4063 19.7107 19.0936 19.0233Z"
              fill="white"
            />
            <path
              d="M9.81511 15.7342C10.754 15.4827 11.719 16.0399 11.9706 16.9788C12.2222 17.9176 11.665 18.8828 10.7262 19.1343L5.43413 20.5523C4.90599 20.6938 4.36313 20.3804 4.22162 19.8523L3.82304 18.3648C3.68153 17.8367 3.99494 17.2938 4.52307 17.1523L9.81511 15.7342Z"
              fill="white"
            />
            <path
              d="M20.5791 1.69428C21.1072 1.8358 21.4206 2.37865 21.2792 2.90678L17.6655 16.3927C17.414 17.3316 16.4489 17.8887 15.51 17.6373C14.5711 17.3857 14.014 16.4206 14.2654 15.4817L17.8789 1.99574C18.0205 1.46761 18.5634 1.15419 19.0915 1.2957L20.5791 1.69428Z"
              fill="white"
            />
            <path
              d="M28.3215 13.3944C28.463 13.9225 28.1496 14.4653 27.6215 14.6069L22.3975 16.0065C21.4586 16.2581 20.4936 15.7009 20.242 14.7621C19.9905 13.8231 20.5476 12.8581 21.4865 12.6065L26.7105 11.2068C27.2386 11.0653 27.7814 11.3787 27.9229 11.9068L28.3215 13.3944Z"
              fill="white"
            />
            <path
              d="M12.9704 10.4127C13.6578 11.1 13.6578 12.2143 12.9704 12.9017C12.2831 13.5889 11.1688 13.5889 10.4815 12.9017L4.28215 6.70227C3.89553 6.31566 3.89553 5.68882 4.28215 5.3022L5.37104 4.2133C5.75767 3.82669 6.38449 3.82669 6.77112 4.2133L12.9704 10.4127Z"
              fill="white"
            />
          </svg>
          <h1 className="text-white font-montserrat text-xl md:text-2xl font-bold italic">
            POLIACREDITA
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-white text-sm font-montserrat font-medium">
              {user?.name || userName || 'Usuario'}
            </span>
            <span className="text-white/70 text-xs font-open-sans">
              {user?.role ? (ROLE_DISPLAY_NAMES[user.role as RoleType] || user.role) : (userRole ? (ROLE_DISPLAY_NAMES[userRole as RoleType] || userRole) : 'Cargando...')}
            </span>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded bg-[#003366]/40 hover:bg-[#003366]/60 transition-colors">
            <Settings className="w-4 h-4 text-white" />
          </button>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 flex items-center justify-center rounded bg-[#003366]/40 hover:bg-[#003366]/60 transition-colors"
          >
            <LogOut className="w-4 h-4 text-white" />
          </button>
          <div className="w-9 h-9 rounded-full bg-white border-2 border-white/20 flex items-center justify-center overflow-hidden">
            <UserIcon className="w-5 h-5 text-[#003366]" />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex w-56 lg:w-64 border-r border-[#DEE1E6] bg-white flex-col">
          {userRole === 'COORDINADOR' || userRole === 'PROFESOR' ? (
            // Nuevo sidebar con secciones para COORDINADOR y PROFESOR
            <nav className="flex-1 overflow-y-auto p-4">
              {/* CARRERA Section */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-[#565D6D] uppercase tracking-wide mb-3 px-3">
                  CARRERA
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/objetivos-carrera"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      pathname === "/objetivos-carrera"
                        ? "bg-[#F3F4F6] text-[#1E2128] font-medium"
                        : "text-[#565D6D] hover:bg-[#F3F4F6]"
                    )}
                  >
                    <GraduationCap className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">Objetivos de carrera (OP)</span>
                  </Link>
                  <Link
                    href="/resultados-aprendizaje"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      pathname === "/resultados-aprendizaje"
                        ? "bg-[#F3F4F6] text-[#1E2128] font-medium"
                        : "text-[#565D6D] hover:bg-[#F3F4F6]"
                    )}
                  >
                    <BookOpen className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">Resultados de aprendizaje (RA)</span>
                  </Link>
                  <Link
                    href="/asignaturas"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      pathname.startsWith("/asignaturas")
                        ? "bg-[#F3F4F6] text-[#1E2128] font-medium"
                        : "text-[#565D6D] hover:bg-[#F3F4F6]"
                    )}
                  >
                    <LayoutGrid className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">Asignaturas</span>
                  </Link>
                </div>
              </div>

              {/* ACREDITACIÓN Section */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-[#565D6D] uppercase tracking-wide mb-3 px-3">
                  ACREDITACIÓN
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/criterios-eur-ace"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      pathname === "/criterios-eur-ace"
                        ? "bg-[#F3F4F6] text-[#1E2128] font-medium"
                        : "text-[#565D6D] hover:bg-[#F3F4F6]"
                    )}
                  >
                    <Scale className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">Criterios EUR-ACE (CE)</span>
                  </Link>
                </div>
              </div>

              {/* MATRICES Section */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-[#565D6D] uppercase tracking-wide mb-3 px-3">
                  MATRICES
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/mapeos/ra-vs-opp"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      pathname === "/mapeos/ra-vs-opp"
                        ? "bg-[#F3F4F6] text-[#1E2128] font-medium"
                        : "text-[#565D6D] hover:bg-[#F3F4F6]"
                    )}
                  >
                    <FileText className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">OP vs RA</span>
                  </Link>
                  <Link
                    href="/mapeos/ra-vs-eurace"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      pathname === "/mapeos/ra-vs-eurace"
                        ? "bg-[#F3F4F6] text-[#1E2128] font-medium"
                        : "text-[#565D6D] hover:bg-[#F3F4F6]"
                    )}
                  >
                    <FileText className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">CE vs RA</span>
                  </Link>
                  <Link
                    href="/mapeos/raa-vs-ra"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      pathname === "/mapeos/raa-vs-ra"
                        ? "bg-[#F3F4F6] text-[#1E2128] font-medium"
                        : "text-[#565D6D] hover:bg-[#F3F4F6]"
                    )}
                  >
                    <FileText className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">RAA vs RA</span>
                  </Link>
                </div>
              </div>

              {/* REPORTES Section */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-[#565D6D] uppercase tracking-wide mb-3 px-3">
                  REPORTES
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/construccion"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      pathname === "/construccion"
                        ? "bg-[#F3F4F6] text-[#1E2128] font-medium"
                        : "text-[#565D6D] hover:bg-[#F3F4F6]"
                    )}
                  >
                    <BarChart3 className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">Asignaturas vs CE</span>
                  </Link>
                  <Link
                    href="/construccion"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      pathname === "/construccion"
                        ? "bg-[#F3F4F6] text-[#1E2128] font-medium"
                        : "text-[#565D6D] hover:bg-[#F3F4F6]"
                    )}
                  >
                    <BarChart3 className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">OP vs RA vs Asignatura</span>
                  </Link>
                </div>
              </div>
            </nav>
          ) : userRole === 'CEI' ? (
            // Sidebar para CEI
            <nav className="p-2 space-y-1">
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === "/dashboard" ? "bg-[#F3F4F6] text-[#1E2128]" : "text-[#565D6D] hover:bg-gray-50"
                )}
              >
                <Home className="w-5 h-5" />
                <span>Inicio</span>
              </Link>

              <Link
                href="/objetivos-carrera"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mt-1",
                  pathname === "/objetivos-carrera" ? "bg-[#F3F4F6] text-[#1E2128]" : "text-[#565D6D] hover:bg-gray-50"
                )}
              >
                <Layers className="w-5 h-5" />
                <span>Objetivos de Carrera</span>
              </Link>

              <Link
                href="/resultados-aprendizaje"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mt-1",
                  pathname === "/resultados-aprendizaje" ? "bg-[#F3F4F6] text-[#1E2128]" : "text-[#565D6D] hover:bg-gray-50"
                )}
              >
                <BookOpen className="w-5 h-5" />
                <span>R. de Aprendizaje</span>
              </Link>

              <Link
                href="/criterios-eur-ace"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mt-1",
                  pathname === "/criterios-eur-ace" ? "bg-[#F3F4F6] text-[#1E2128]" : "text-[#565D6D] hover:bg-gray-50"
                )}
              >
                <FileText className="w-5 h-5" />
                <span>Criterios EUR-ACE</span>
              </Link>

              <div className="mt-1">
                <button
                  onClick={() => setEditorOpen(!editorOpen)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium text-[#565D6D] hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5" />
                    <span>Editor Mapeos</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", editorOpen && "rotate-180")} />
                </button>
                
                {editorOpen && (
                  <div className="ml-8 mt-1 space-y-1">
                    <Link
                      href="/mapeos/ra-vs-opp"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[#565D6D] hover:bg-gray-50 rounded-md"
                    >
                      <Table2 className="w-3 h-3" />
                      <span>RA vs OPP</span>
                    </Link>
                    <Link
                      href="/mapeos/ra-vs-eurace"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[#565D6D] hover:bg-gray-50 rounded-md"
                    >
                      <LayoutGrid className="w-3 h-3" />
                      <span>RA vs EUR-ACE</span>
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/perfil"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mt-1",
                  pathname === "/perfil" ? "bg-[#F3F4F6] text-[#1E2128]" : "text-[#565D6D] hover:bg-gray-50"
                )}
              >
                <User className="w-5 h-5" />
                <span>Mi Perfil</span>
              </Link>
            </nav>
          ) : (
            // Sidebar original para Administrador (por defecto)
            <nav className="p-2 space-y-1">
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "flex items-center gap-3 px-2 py-2.5 rounded text-sm font-open-sans transition-colors",
                      isActive
                        ? "bg-[#F3F4F6] text-[#1E2128]"
                        : "text-[#565D6D] hover:bg-gray-50"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-[#FAFAFB] overflow-auto">{children}</main>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#DEE1E6] bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 md:gap-6 text-sm text-[#171A1F] font-open-sans">
              <a href="#" className="hover:underline">
                Recursos
              </a>
              <a href="#" className="hover:underline">
                Legal
              </a>
              <a href="#" className="hover:underline">
                Contacto
              </a>
            </div>
            <div className="flex items-center gap-4 opacity-80">
              <a href="#" className="hover:opacity-100 transition-opacity">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.4795 11.665C17.4795 10.5643 17.042 9.50906 16.2637 8.73076C15.4855 7.95252 14.4302 7.51498 13.3295 7.51498C12.2289 7.51498 11.1736 7.95252 10.3953 8.73076C9.61711 9.50906 9.17953 10.5643 9.17953 11.665L9.17953 16.645H10.8395L10.8395 11.665C10.8395 11.0045 11.1021 10.3714 11.569 9.90447C12.036 9.43751 12.6691 9.17498 13.3295 9.17498C13.99 9.17498 14.6231 9.43751 15.09 9.90447C15.557 10.3714 15.8195 11.0045 15.8195 11.665V16.645H17.4795V11.665ZM19.1395 17.475C19.1395 17.9334 18.7679 18.305 18.3095 18.305H14.9895C14.5311 18.305 14.1595 17.9334 14.1595 17.475L14.1595 11.665C14.1595 11.4449 14.072 11.2338 13.9163 11.0782C13.7607 10.9225 13.5496 10.835 13.3295 10.835C13.1094 10.835 12.8983 10.9225 12.7427 11.0782C12.587 11.2338 12.4995 11.4449 12.4995 11.665L12.4995 17.475C12.4995 17.9334 12.1279 18.305 11.6695 18.305H8.34953C7.89114 18.305 7.51953 17.9334 7.51953 17.475L7.51953 11.665C7.51953 10.1241 8.13128 8.64594 9.22087 7.55631C10.3105 6.46673 11.7886 5.85498 13.3295 5.85498C14.8704 5.85498 16.3486 6.46673 17.4382 7.55631C18.5278 8.64594 19.1395 10.1241 19.1395 11.665L19.1395 17.475Z"
                    fill="#171A1F"
                  />
                  <path
                    d="M4.98984 6.68994L5.07495 6.69399C5.49338 6.7366 5.81984 7.09027 5.81984 7.51994L5.81984 17.4799C5.81984 17.9383 5.44824 18.3099 4.98984 18.3099H1.66984C1.21145 18.3099 0.839844 17.9383 0.839844 17.4799L0.839844 7.51994L0.843894 7.43483C0.886498 7.01641 1.24017 6.68994 1.66984 6.68994L4.98984 6.68994ZM2.49984 16.6499H4.15984L4.15984 8.34994H2.49984L2.49984 16.6499Z"
                    fill="#171A1F"
                  />
                  <path
                    d="M4.15984 3.32984C4.15984 2.87145 3.78824 2.49984 3.32984 2.49984C2.87145 2.49984 2.49984 2.87145 2.49984 3.32984C2.49984 3.78824 2.87145 4.15984 3.32984 4.15984C3.78824 4.15984 4.15984 3.78824 4.15984 3.32984ZM5.81984 3.32984C5.81984 4.70503 4.70503 5.81984 3.32984 5.81984C1.95466 5.81984 0.839844 4.70503 0.839844 3.32984C0.839844 1.95466 1.95466 0.839844 3.32984 0.839844C4.70503 0.839844 5.81984 1.95466 5.81984 3.32984Z"
                    fill="#171A1F"
                  />
                </svg>
              </a>
              <a href="#" className="hover:opacity-100 transition-opacity">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.3083 3.02298C12.7334 2.28046 14.5927 2.32673 16.0694 3.49067C16.1416 3.47324 16.2252 3.45108 16.319 3.41934C16.5499 3.34133 16.798 3.23296 17.0332 3.11782C17.2662 3.00368 17.4749 2.88854 17.6256 2.8017C17.7007 2.75849 17.7605 2.72233 17.8008 2.69795C17.8208 2.68578 17.8365 2.67637 17.8462 2.6704C17.8507 2.66754 17.8539 2.66514 17.8559 2.66392H17.8575C18.1541 2.47659 18.537 2.49537 18.8131 2.71173C19.0545 2.90101 19.1688 3.20529 19.1195 3.50121L19.0879 3.62765V3.62927L19.0871 3.6309C19.0865 3.63252 19.0855 3.63492 19.0846 3.63738C19.0829 3.64226 19.081 3.64882 19.0781 3.65684C19.0725 3.6731 19.0649 3.6958 19.0546 3.72411C19.0341 3.78095 19.0037 3.86151 18.9647 3.95998C18.887 4.15642 18.7717 4.42869 18.6202 4.73729C18.3705 5.24597 18.0021 5.88897 17.5162 6.45727C18.5868 15.1095 9.18603 21.3675 1.60764 16.739L1.24208 16.5072C0.931048 16.3011 0.79645 15.912 0.91219 15.5573C1.02802 15.2029 1.36568 14.9691 1.73814 14.9858C2.86761 15.0372 3.98536 14.8026 4.9479 14.3212C1.32816 12.324 -0.264295 7.59957 1.80136 3.79868L1.85567 3.71195C1.99321 3.51969 2.20817 3.39354 2.44655 3.36909C2.71896 3.34129 2.98782 3.45022 3.1647 3.65927C4.63275 5.39405 6.81758 6.48434 9.08087 6.66234C9.09 5.00828 10.0208 3.69379 11.3083 3.02298ZM15.2443 4.96749C14.2732 4.06135 13.019 4.00446 12.0758 4.49575C11.1506 4.97777 10.5222 5.98652 10.8122 7.34077C10.8638 7.58163 10.8061 7.83346 10.6541 8.0273C10.5021 8.22116 10.2714 8.3378 10.0252 8.34503C7.38948 8.42251 4.7595 7.43798 2.80806 5.67104C1.84537 8.80879 3.64676 12.378 6.91915 13.3599C7.20842 13.4467 7.42816 13.684 7.49221 13.9791C7.54821 14.2374 7.47745 14.5046 7.30659 14.7005L7.22716 14.78C6.45425 15.4562 5.53936 15.9517 4.55965 16.2633C10.5445 18.0928 16.8921 13.0098 15.8214 6.31786C15.7795 6.05522 15.866 5.78864 16.054 5.60052C16.2049 5.44964 16.3453 5.27832 16.4771 5.0988C16.2622 5.15173 16.0352 5.1912 15.8108 5.1912C15.6006 5.1912 15.398 5.11093 15.2443 4.96749Z"
                    fill="#171A1F"
                  />
                </svg>
              </a>
              <a href="#" className="hover:opacity-100 transition-opacity">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.99348 3.73667C7.97659 3.16069 12.0218 3.16069 16.005 3.73667L16.8577 3.86878L16.942 3.88743C17.3587 4.00173 17.7388 4.22221 18.0443 4.52775C18.3117 4.79522 18.5139 5.11989 18.6369 5.4761L18.6847 5.6301L18.696 5.67793L18.8022 6.21289C19.2975 8.89499 19.2621 11.6499 18.696 14.3216L18.6847 14.3694C18.5704 14.7862 18.3498 15.1662 18.0443 15.4717C17.7769 15.7392 17.4521 15.9413 17.096 16.0643L16.942 16.1121L16.8577 16.1308C12.6002 16.8362 8.26114 16.8801 3.99348 16.2628L3.14078 16.1308C3.11256 16.126 3.08408 16.1196 3.05649 16.1121C2.6398 15.9978 2.25968 15.7773 1.95415 15.4717C1.6867 15.2043 1.48462 14.8796 1.36164 14.5234L1.31381 14.3694C1.30951 14.3537 1.30584 14.3375 1.30247 14.3216C0.698657 11.472 0.698657 8.52755 1.30247 5.67793L1.31381 5.6301L1.36164 5.4761C1.48462 5.11989 1.6867 4.79522 1.95415 4.52775C2.25968 4.22222 2.6398 4.00173 3.05649 3.88743L3.14078 3.86878L3.99348 3.73667ZM16.5318 5.49798C12.2054 4.78735 7.79219 4.78727 3.46582 5.49798C3.33888 5.53801 3.22301 5.60716 3.12863 5.70143C3.03009 5.79996 2.95779 5.92205 2.9187 6.05564C2.37251 8.65637 2.37262 11.3423 2.9187 13.9431C2.95774 14.0769 3.02991 14.1994 3.12863 14.2981C3.22277 14.3921 3.33846 14.4606 3.46501 14.5007C7.79171 15.2117 12.2051 15.2115 16.5318 14.5007C16.659 14.4607 16.7753 14.3925 16.8698 14.2981C16.9685 14.1994 17.0399 14.0768 17.0789 13.9431C17.6251 11.3422 17.6252 8.65645 17.0789 6.05564C17.0399 5.92213 16.9683 5.7999 16.8698 5.70143C16.7753 5.60698 16.6591 5.53796 16.5318 5.49798Z"
                    fill="#171A1F"
                  />
                  <path
                    d="M7.93435 6.78743C8.19455 6.6401 8.5144 6.64411 8.77079 6.79796L12.9208 9.28795L13.01 9.34953C13.2067 9.50574 13.3237 9.74453 13.3237 9.99959C13.3237 10.2546 13.2067 10.4935 13.01 10.6496L12.9208 10.7113L8.77079 13.2013C8.5144 13.3551 8.19455 13.3592 7.93435 13.2119C7.67433 13.0644 7.51367 12.7886 7.51367 12.4896L7.51367 7.50963L7.52097 7.39858C7.55535 7.14362 7.7069 6.91635 7.93435 6.78743ZM9.17367 11.0233L10.8799 9.99959L9.17367 8.97512L9.17367 11.0233Z"
                    fill="#171A1F"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}