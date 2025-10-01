import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFB] px-4">
      <div className="text-center max-w-md">
        <h1 className="text-[#171A1F] font-montserrat text-6xl md:text-8xl font-bold mb-4">
          404
        </h1>
        <h2 className="text-[#171A1F] font-montserrat text-2xl md:text-3xl font-semibold mb-4">
          Página no encontrada
        </h2>
        <p className="text-[#565D6D] font-open-sans text-base mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 bg-[#003366] text-white font-open-sans text-sm rounded hover:bg-[#003366]/90 transition-colors"
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
