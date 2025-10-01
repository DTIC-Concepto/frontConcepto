import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  GraduationCap, 
  Briefcase, 
  Users, 
  CircleUserRound,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Facultades", href: "/facultades", icon: Building2 },
  { name: "Carreras", href: "/carreras", icon: GraduationCap },
  { name: "Usuarios", href: "/usuarios", icon: Briefcase },
  { name: "Roles", href: "/roles", icon: Users },
  { name: "Mi Perfil", href: "/perfil", icon: CircleUserRound },
];

const footerLinks = [
  { name: "Recursos", href: "#" },
  { name: "Legal", href: "#" },
  { name: "Contacto", href: "#" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#003366] h-16 flex items-center justify-between px-4 md:px-6 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
          <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h1 className="font-montserrat font-bold text-white text-xl md:text-2xl italic">
            POLIACREDITA
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <span className="hidden sm:block text-white text-xs md:text-sm font-montserrat font-bold">
            Administrador
          </span>
          <button className="w-10 h-10 bg-white/10 rounded flex items-center justify-center hover:bg-white/20 transition-colors">
            <Settings className="w-4 h-4 text-white" />
          </button>
          <button className="w-10 h-10 bg-white/10 rounded flex items-center justify-center hover:bg-white/20 transition-colors">
            <LogOut className="w-4 h-4 text-white" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "w-[220px] bg-white border-r border-border flex-shrink-0 transition-transform duration-200 z-10",
            "lg:translate-x-0 lg:static",
            sidebarOpen
              ? "fixed inset-y-0 left-0 translate-x-0 top-16"
              : "fixed inset-y-0 left-0 -translate-x-full top-16"
          )}
        >
          <nav className="p-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2.5 rounded text-sm transition-colors",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted hover:bg-accent/50"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-[#FAFAFB] overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-border h-auto lg:h-[52px] flex flex-col lg:flex-row items-center justify-between px-6 lg:px-44 py-4 lg:py-0 gap-4 lg:gap-0">
        <div className="flex flex-wrap gap-4 lg:gap-6 justify-center">
          {footerLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm text-foreground hover:text-primary transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>
        <div className="flex gap-4 opacity-80">
          <a href="#" className="w-5 h-5 text-foreground hover:text-primary transition-colors">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.8354 5.85012C10.8354 5.40986 11.0104 4.98776 11.3217 4.67645C11.633 4.36514 12.0552 4.19012 12.4954 4.19012H14.1554V2.53012L12.4954 2.53012C11.6148 2.53012 10.7707 2.88015 10.1481 3.50278C9.5254 4.12539 9.17539 4.96959 9.17539 5.85012L9.17539 8.34012C9.17539 8.79853 8.8038 9.17012 8.34539 9.17012H6.68539L6.68539 10.8301H8.34539C8.8038 10.8301 9.17539 11.2017 9.17539 11.6601V17.4701H10.8354V11.6601C10.8354 11.2017 11.207 10.8301 11.6654 10.8301H13.5077L13.9227 9.17012H11.6654C11.207 9.17012 10.8354 8.79853 10.8354 8.34012L10.8354 5.85012Z"/>
            </svg>
          </a>
          <a href="#" className="w-5 h-5 text-foreground hover:text-primary transition-colors">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M11.3083 3.02298C12.7334 2.28046 14.5927 2.32673 16.0694 3.49067C16.1416 3.47324 16.2252 3.45108 16.319 3.41934C16.5499 3.34133 16.798 3.23296 17.0332 3.11782C17.2662 3.00368 17.4749 2.88854 17.6256 2.8017C17.7007 2.75849 17.7605 2.72233 17.8008 2.69795C17.8208 2.68578 17.8365 2.67637 17.8462 2.6704L17.8575 2.66392C18.1541 2.47659 18.537 2.49537 18.8131 2.71173C19.0545 2.90101 19.1688 3.20529 19.1195 3.50121L19.0879 3.62765V3.62927L19.0871 3.6309C19.0865 3.63252 19.0855 3.63492 19.0846 3.63738C19.0829 3.64226 19.081 3.64882 19.0781 3.65684C19.0725 3.6731 19.0649 3.6958 19.0546 3.72411C19.0341 3.78095 19.0037 3.86151 18.9647 3.95998C18.887 4.15642 18.7717 4.42869 18.6202 4.73729C18.3705 5.24597 18.0021 5.88897 17.5162 6.45727C18.5868 15.1095 9.18603 21.3675 1.60764 16.739L1.24208 16.5072C0.931048 16.3011 0.79645 15.912 0.91219 15.5573C1.02802 15.2029 1.36568 14.9691 1.73814 14.9858C2.86761 15.0372 3.98536 14.8026 4.9479 14.3212C1.32816 12.324 -0.264295 7.59957 1.80136 3.79868L1.85567 3.71195C1.99321 3.51969 2.20817 3.39354 2.44655 3.36909C2.71896 3.34129 2.98782 3.45022 3.1647 3.65927C4.63275 5.39405 6.81758 6.48434 9.08087 6.66234C9.09 5.00828 10.0208 3.69379 11.3083 3.02298Z"/>
            </svg>
          </a>
          <a href="#" className="w-5 h-5 text-foreground hover:text-primary transition-colors">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.4795 11.665C17.4795 10.5643 17.042 9.50906 16.2637 8.73076C15.4855 7.95252 14.4302 7.51498 13.3295 7.51498C12.2289 7.51498 11.1736 7.95252 10.3953 8.73076C9.61711 9.50906 9.17953 10.5643 9.17953 11.665L9.17953 16.645H10.8395L10.8395 11.665C10.8395 11.0045 11.1021 10.3714 11.569 9.90447C12.036 9.43751 12.6691 9.17498 13.3295 9.17498C13.99 9.17498 14.6231 9.43751 15.09 9.90447C15.557 10.3714 15.8195 11.0045 15.8195 11.665V16.645H17.4795V11.665Z"/>
            </svg>
          </a>
          <a href="#" className="w-5 h-5 text-foreground hover:text-primary transition-colors">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M3.99348 3.73667C7.97659 3.16069 12.0218 3.16069 16.005 3.73667L16.8577 3.86878L16.942 3.88743C17.3587 4.00173 17.7388 4.22221 18.0443 4.52775C18.3117 4.79522 18.5139 5.11989 18.6369 5.4761L18.6847 5.6301L18.696 5.67793L18.8022 6.21289C19.2975 8.89499 19.2621 11.6499 18.696 14.3216L18.6847 14.3694C18.5704 14.7862 18.3498 15.1662 18.0443 15.4717C17.7769 15.7392 17.4521 15.9413 17.096 16.0643L16.942 16.1121L16.8577 16.1308C12.6002 16.8362 8.26114 16.8801 3.99348 16.2628L3.14078 16.1308C3.11256 16.126 3.08408 16.1196 3.05649 16.1121C2.6398 15.9978 2.25968 15.7773 1.95415 15.4717C1.6867 15.2043 1.48462 14.8796 1.36164 14.5234L1.31381 14.3694C1.30951 14.3537 1.30584 14.3375 1.30247 14.3216C0.698657 11.472 0.698657 8.52755 1.30247 5.67793L1.31381 5.6301L1.36164 5.4761C1.48462 5.11989 1.6867 4.79522 1.95415 4.52775C2.25968 4.22222 2.6398 4.00173 3.05649 3.88743L3.14078 3.86878L3.99348 3.73667Z"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
