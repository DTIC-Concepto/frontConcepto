"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, Check } from "lucide-react";
import { AuthService } from "../lib/auth";
import { VALID_ROLES, ROLE_DISPLAY_NAMES, RoleType } from "../lib/api";
import NotificationService from "../lib/notifications";
import { useUser } from "../contexts/UserContext";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const [formData, setFormData] = useState({
    correo: "",
    contrasena: "",
    rol: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Verificar si ya hay una sesión activa al cargar la página
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const token = AuthService.getToken();
        const userRole = AuthService.getUserRole();
        
        if (token && userRole) {
          // Ya hay una sesión activa, redirigir según el rol
          if (userRole === 'COORDINADOR' || userRole === 'PROFESOR') {
            router.replace('/asignaturas');
          } else {
            router.replace('/dashboard');
          }
        }
      } catch (error) {
        // Si hay error al verificar, no hacer nada (dejar en login)
        console.log('No hay sesión activa');
      }
    };
    
    checkExistingSession();
  }, [router]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsRoleDropdownOpen(false);
      }
    };

    if (isRoleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRoleDropdownOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que todos los campos estén llenos
    if (!formData.correo || !formData.contrasena || !formData.rol) {
      NotificationService.warning(
        "Campos requeridos",
        "Por favor, completa todos los campos antes de continuar."
      );
      return;
    }

    setIsLoading(true);

    try {
      // Intentar hacer login
      const response = await AuthService.login({
        correo: formData.correo,
        contrasena: formData.contrasena,
        rol: formData.rol,
      });

      // Si el login es exitoso, configurar usuario en contexto
      // Usar el rol que viene del backend en lugar de hardcodearlo
      const userRole = response.user?.rol || response.user?.role || formData.rol;
      // Intentar obtener el nombre completo del usuario desde la respuesta del backend
      const fullName = response.user?.nombres 
        ? `${response.user.nombres} ${response.user.apellidos || ''}`.trim()
        : response.user?.nombre || formData.correo.split('@')[0];
      
      setUser({
        id: response.user?.id || '1',
        name: fullName,
        email: formData.correo,
        role: userRole,
      });

      // Mostrar notificación y redirigir
      NotificationService.success(
        "¡Bienvenido!",
        "Has iniciado sesión correctamente."
      );

      // Redirigir según el rol del usuario
      if (userRole === 'COORDINADOR' || userRole === 'PROFESOR') {
        router.push("/asignaturas");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      // Mostrar error de credenciales inválidas
      NotificationService.error(
        "Credenciales inválidas",
        "El correo, contraseña o rol son incorrectos. Por favor, verifica tus datos."
      );
      console.error("Error en login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header with Logo */}
      <div className="flex items-center justify-center pt-12 pb-8">
        <div className="flex items-center gap-2">
          <svg
            className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0"
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="64" height="64" stroke="white" />
            <path
              d="M25.1709 42.8977C25.6969 40.9347 27.7147 39.7697 29.6778 40.2957C31.641 40.8217 32.806 42.8395 32.28 44.8026L29.4947 55.1977C29.1987 56.3019 28.0636 56.9572 26.9594 56.6614L23.8491 55.8279C22.7449 55.5321 22.0896 54.397 22.3855 53.2928L25.1709 42.8977Z"
              fill="#003366"
            />
            <path
              d="M37.9118 37.7736C39.3488 36.3365 41.6792 36.3365 43.1162 37.7736L50.9576 45.615C51.766 46.4234 51.766 47.7342 50.9576 48.5424L48.6808 50.8192C47.8724 51.6276 46.5618 51.6276 45.7534 50.8192L37.9118 42.9778C36.4747 41.5408 36.4747 39.2109 37.9118 37.7736Z"
              fill="#003366"
            />
            <path
              d="M19.803 31.2601C21.7662 30.7341 23.784 31.8993 24.31 33.8623C24.836 35.8254 23.6711 37.8434 21.708 38.3694L10.6428 41.3343C9.53853 41.6301 8.40345 40.9748 8.10756 39.8706L7.27418 36.7603C6.97828 35.6561 7.6336 34.521 8.73787 34.2252L19.803 31.2601Z"
              fill="#003366"
            />
            <path
              d="M41.4252 2.68082C42.5294 2.97672 43.1847 4.11177 42.8889 5.21604L35.3332 33.4139C34.8072 35.377 32.7894 36.542 30.8261 36.0162C28.863 35.4902 27.6981 33.4721 28.2239 31.5091L35.7794 3.31114C36.0754 2.20686 37.2104 1.55153 38.3147 1.84741L41.4252 2.68082Z"
              fill="#003366"
            />
            <path
              d="M57.0022 26.768C57.298 27.8722 56.6427 29.0073 55.5385 29.3033L44.6156 32.2298C42.6525 32.7558 40.6347 31.5909 40.1087 29.6278C39.5827 27.6645 40.7477 25.6468 42.7107 25.1207L53.6336 22.1941C54.7379 21.8982 55.8729 22.5535 56.1687 23.6577L57.0022 26.768Z"
              fill="#003366"
            />
            <path
              d="M26.3254 20.9836C27.7627 22.4207 27.7627 24.7506 26.3254 26.1879C24.8884 27.6249 22.5584 27.6249 21.1213 26.1879L8.15902 13.2255C7.35064 12.4172 7.35064 11.1065 8.15902 10.2981L10.4358 8.02132C11.2442 7.21294 12.5548 7.21294 13.3632 8.02132L26.3254 20.9836Z"
              fill="#003366"
            />
          </svg>
          <h1 className="text-[#003366] font-montserrat text-3xl md:text-5xl font-bold italic">
            POLIACREDITA
          </h1>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md bg-white rounded border border-white shadow-[0_0_2px_0_rgba(23,26,31,0.08),0_0_1px_0_rgba(23,26,31,0.05)] p-8">
          <h2 className="text-[#171A1F] text-center font-montserrat text-2xl md:text-3xl font-semibold mb-2">
            Iniciar Sesión
          </h2>
          <p className="text-[#565D6D] text-center text-sm mb-8">
            Introduce tus credenciales para acceder a Poliacredita
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-[#171A1F] text-xs font-open-sans mb-3"
              >
                Correo Institucional
              </label>
              <input
                id="email"
                type="email"
                placeholder="correo@epn.edu.ec"
                value={formData.correo}
                onChange={(e) =>
                  setFormData({ ...formData, correo: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md border border-[#DEE1E6] bg-white text-[#565D6D] text-sm placeholder:text-[#565D6D] focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] shadow-sm"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[#171A1F] text-xs font-open-sans mb-3"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="********"
                value={formData.contrasena}
                onChange={(e) =>
                  setFormData({ ...formData, contrasena: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md border border-[#DEE1E6] bg-white text-[#565D6D] text-sm placeholder:text-[#565D6D] focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] shadow-sm"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-[#171A1F] text-xs font-open-sans mb-3"
              >
                Rol
              </label>
              <div className="relative dropdown-container">
                <div
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="w-full px-3 py-2 rounded-md border border-[#DEE1E6] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] shadow-sm cursor-pointer flex items-center justify-between"
                >
                  <span className={formData.rol ? 'text-[#171A1F]' : 'text-[#565D6D]'}>
                    {formData.rol ? ROLE_DISPLAY_NAMES[formData.rol as RoleType] : 'Seleccionar un rol'}
                  </span>
                  <div className="flex flex-col items-center">
                    <ChevronUp className="w-3 h-3 text-[#565D6D]" />
                    <ChevronDown className="w-3 h-3 text-[#565D6D] -mt-0.5" />
                  </div>
                </div>
                
                {isRoleDropdownOpen && (
                  <div className="absolute z-[9999] w-full mt-1 bg-white border border-[#DEE1E6] rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {VALID_ROLES.map((role) => (
                      <div
                        key={role}
                        onClick={() => {
                          setFormData({ ...formData, rol: role });
                          setIsRoleDropdownOpen(false);
                        }}
                        className="px-3 py-2 hover:bg-[#F3F4F6] cursor-pointer text-sm text-[#171A1F] flex items-center justify-between"
                      >
                        <span>{ROLE_DISPLAY_NAMES[role]}</span>
                        {formData.rol === role && (
                          <Check className="w-4 h-4 text-[#003366]" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#003366] text-white font-open-sans text-sm py-2.5 rounded-md hover:bg-[#003366]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <svg 
                    className="animate-spin h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                className="text-[#003366] text-sm font-open-sans hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
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
            <p className="text-[#171A1F] opacity-80 text-sm font-open-sans">
              © 2025 POLIACREDITA EUR-ACE. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4 opacity-80">
              <a href="#" className="hover:opacity-100 transition-opacity">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="#171A1F"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.4795 11.665C17.4795 10.5643 17.042 9.50906 16.2637 8.73076C15.4855 7.95252 14.4302 7.51498 13.3295 7.51498C12.2289 7.51498 11.1736 7.95252 10.3953 8.73076C9.61711 9.50906 9.17953 10.5643 9.17953 11.665L9.17953 16.645H10.8395L10.8395 11.665C10.8395 11.0045 11.1021 10.3714 11.569 9.90447C12.036 9.43751 12.6691 9.17498 13.3295 9.17498C13.99 9.17498 14.6231 9.43751 15.09 9.90447C15.557 10.3714 15.8195 11.0045 15.8195 11.665V16.645H17.4795V11.665ZM19.1395 17.475C19.1395 17.9334 18.7679 18.305 18.3095 18.305H14.9895C14.5311 18.305 14.1595 17.9334 14.1595 17.475L14.1595 11.665C14.1595 11.4449 14.072 11.2338 13.9163 11.0782C13.7607 10.9225 13.5496 10.835 13.3295 10.835C13.1094 10.835 12.8983 10.9225 12.7427 11.0782C12.587 11.2338 12.4995 11.4449 12.4995 11.665L12.4995 17.475C12.4995 17.9334 12.1279 18.305 11.6695 18.305H8.34953C7.89114 18.305 7.51953 17.9334 7.51953 17.475L7.51953 11.665C7.51953 10.1241 8.13128 8.64594 9.22087 7.55631C10.3105 6.46673 11.7886 5.85498 13.3295 5.85498C14.8704 5.85498 16.3486 6.46673 17.4382 7.55631C18.5278 8.64594 19.1395 10.1241 19.1395 11.665L19.1395 17.475Z" />
                  <path d="M4.98984 6.68994L5.07495 6.69399C5.49338 6.7366 5.81984 7.09027 5.81984 7.51994L5.81984 17.4799C5.81984 17.9383 5.44824 18.3099 4.98984 18.3099H1.66984C1.21145 18.3099 0.839844 17.9383 0.839844 17.4799L0.839844 7.51994L0.843894 7.43483C0.886498 7.01641 1.24017 6.68994 1.66984 6.68994L4.98984 6.68994ZM2.49984 16.6499H4.15984L4.15984 8.34994H2.49984L2.49984 16.6499Z" />
                  <path d="M4.15984 3.32984C4.15984 2.87145 3.78824 2.49984 3.32984 2.49984C2.87145 2.49984 2.49984 2.87145 2.49984 3.32984C2.49984 3.78824 2.87145 4.15984 3.32984 4.15984C3.78824 4.15984 4.15984 3.78824 4.15984 3.32984ZM5.81984 3.32984C5.81984 4.70503 4.70503 5.81984 3.32984 5.81984C1.95466 5.81984 0.839844 4.70503 0.839844 3.32984C0.839844 1.95466 1.95466 0.839844 3.32984 0.839844C4.70503 0.839844 5.81984 1.95466 5.81984 3.32984Z" />
                </svg>
              </a>
              <a href="#" className="hover:opacity-100 transition-opacity">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="#171A1F"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M11.3083 3.02298C12.7334 2.28046 14.5927 2.32673 16.0694 3.49067C16.1416 3.47324 16.2252 3.45108 16.319 3.41934C16.5499 3.34133 16.798 3.23296 17.0332 3.11782C17.2662 3.00368 17.4749 2.88854 17.6256 2.8017C17.7007 2.75849 17.7605 2.72233 17.8008 2.69795C17.8208 2.68578 17.8365 2.67637 17.8462 2.6704C17.8507 2.66754 17.8539 2.66514 17.8559 2.66392H17.8575C18.1541 2.47659 18.537 2.49537 18.8131 2.71173C19.0545 2.90101 19.1688 3.20529 19.1195 3.50121L19.0879 3.62765V3.62927L19.0871 3.6309C19.0865 3.63252 19.0855 3.63492 19.0846 3.63738C19.0829 3.64226 19.081 3.64882 19.0781 3.65684C19.0725 3.6731 19.0649 3.6958 19.0546 3.72411C19.0341 3.78095 19.0037 3.86151 18.9647 3.95998C18.887 4.15642 18.7717 4.42869 18.6202 4.73729C18.3705 5.24597 18.0021 5.88897 17.5162 6.45727C18.5868 15.1095 9.18603 21.3675 1.60764 16.739L1.24208 16.5072C0.931048 16.3011 0.79645 15.912 0.91219 15.5573C1.02802 15.2029 1.36568 14.9691 1.73814 14.9858C2.86761 15.0372 3.98536 14.8026 4.9479 14.3212C1.32816 12.324 -0.264295 7.59957 1.80136 3.79868L1.85567 3.71195C1.99321 3.51969 2.20817 3.39354 2.44655 3.36909C2.71896 3.34129 2.98782 3.45022 3.1647 3.65927C4.63275 5.39405 6.81758 6.48434 9.08087 6.66234C9.09 5.00828 10.0208 3.69379 11.3083 3.02298ZM15.2443 4.96749C14.2732 4.06135 13.019 4.00446 12.0758 4.49575C11.1506 4.97777 10.5222 5.98652 10.8122 7.34077C10.8638 7.58163 10.8061 7.83346 10.6541 8.0273C10.5021 8.22116 10.2714 8.3378 10.0252 8.34503C7.38948 8.42251 4.7595 7.43798 2.80806 5.67104C1.84537 8.80879 3.64676 12.378 6.91915 13.3599C7.20842 13.4467 7.42816 13.684 7.49221 13.9791C7.54821 14.2374 7.47745 14.5046 7.30659 14.7005L7.22716 14.78C6.45425 15.4562 5.53936 15.9517 4.55965 16.2633C10.5445 18.0928 16.8921 13.0098 15.8214 6.31786C15.7795 6.05522 15.866 5.78864 16.054 5.60052C16.2049 5.44964 16.3453 5.27832 16.4771 5.0988C16.2622 5.15173 16.0352 5.1912 15.8108 5.1912C15.6006 5.1912 15.398 5.11093 15.2443 4.96749Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
