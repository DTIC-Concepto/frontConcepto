import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFB]">
      <div className="text-center">
        <h1 className="text-6xl font-bold font-montserrat text-foreground mb-4">404</h1>
        <p className="text-xl text-muted mb-8">
          Página no encontrada
        </p>
        <Link
          to="/facultades"
          className="inline-flex items-center gap-2 bg-[#003366] text-white px-6 py-3 rounded hover:bg-[#003366]/90 transition-colors"
        >
          <Home className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
