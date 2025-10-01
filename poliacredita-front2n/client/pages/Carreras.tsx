import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Plus, SquarePen, Trash2 } from "lucide-react";

interface Career {
  code: string;
  name: string;
  faculty: string;
  coordinator: string;
}

const careersData: Career[] = [
  { code: "IS-ING", name: "Ingeniería de Software", faculty: "Facultad de Ingeniería de Sistemas", coordinator: "Dr. Juan Pérez" },
  { code: "ADM-NEG", name: "Administración de Empresas", faculty: "Facultad de Ciencias Administrativas", coordinator: "Dra. Ana García" },
  { code: "IC-CIV", name: "Ingeniería Civil", faculty: "Facultad de Ingeniería Civil", coordinator: "Ing. Luis Martínez" },
  { code: "GEO-PET", name: "Geología y Petróleos", faculty: "Facultad de Geología y Petróleos", coordinator: "MSc. Sofía Rodríguez" },
  { code: "IS-RED", name: "Redes y Telecomunicaciones", faculty: "Facultad de Ingeniería de Sistemas", coordinator: "Dr. Juan Pérez" },
];

export default function Carreras() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 md:mb-9">
        <h1 className="text-3xl md:text-4xl font-bold font-montserrat text-foreground">
          Gestión de Carreras
        </h1>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-end mb-6">
        <button className="bg-[#003366] text-white px-4 py-2.5 rounded flex items-center gap-2 text-sm font-medium hover:bg-[#003366]/90 transition-colors whitespace-nowrap">
          <Plus className="w-4 h-4" />
          Nueva Carrera
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded border border-border p-4 mb-6 flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
        <div className="flex-1 lg:max-w-sm flex items-center gap-1.5 px-3 py-2 border border-border rounded bg-white">
          <Search className="w-4 h-4 text-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar carrera..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 text-sm outline-none placeholder:text-muted min-w-0"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-1.5 px-3 py-2 border border-border rounded bg-white sm:min-w-[180px]">
            <span className="text-sm flex-1 truncate">Todas las Facultades</span>
            <ChevronLeft className="w-4 h-4 text-foreground rotate-[-90deg] flex-shrink-0" />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 border border-border rounded bg-white sm:min-w-[180px]">
            <span className="text-sm flex-1 truncate">Todos los Estados</span>
            <ChevronLeft className="w-4 h-4 text-foreground rotate-[-90deg] flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden lg:block bg-white rounded border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F3F4F6]">
                <th className="text-left px-4 py-3.5 text-sm font-normal text-muted w-[100px]">Código</th>
                <th className="text-left px-4 py-3.5 text-sm font-normal text-muted">Nombre</th>
                <th className="text-left px-4 py-3.5 text-sm font-normal text-muted">Facultad</th>
                <th className="text-left px-4 py-3.5 text-sm font-normal text-muted">Coordinador</th>
                <th className="text-center px-4 py-3.5 text-sm font-normal text-muted w-[150px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {careersData.map((career, index) => (
                <tr key={index} className="border-t border-border">
                  <td className="px-4 py-6 text-sm text-foreground">{career.code}</td>
                  <td className="px-4 py-6 text-sm text-foreground">{career.name}</td>
                  <td className="px-4 py-6 text-sm text-foreground">{career.faculty}</td>
                  <td className="px-4 py-6 text-sm text-foreground">{career.coordinator}</td>
                  <td className="px-4 py-6">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-accent rounded transition-colors">
                        <SquarePen className="w-4 h-4 text-[#003366]" />
                      </button>
                      <button className="p-2 hover:bg-accent rounded transition-colors">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards - Mobile/Tablet */}
      <div className="lg:hidden space-y-4">
        {careersData.map((career, index) => (
          <div key={index} className="bg-white rounded border border-border shadow-sm p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-xs text-muted mb-1">Código</div>
                <div className="font-medium text-foreground">{career.code}</div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-accent rounded transition-colors">
                  <SquarePen className="w-4 h-4 text-[#003366]" />
                </button>
                <button className="p-2 hover:bg-accent rounded transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
            <div className="mb-2">
              <div className="text-xs text-muted mb-1">Nombre</div>
              <div className="text-sm text-foreground">{career.name}</div>
            </div>
            <div className="mb-2">
              <div className="text-xs text-muted mb-1">Facultad</div>
              <div className="text-sm text-foreground">{career.faculty}</div>
            </div>
            <div>
              <div className="text-xs text-muted mb-1">Coordinador</div>
              <div className="text-sm text-foreground">{career.coordinator}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 md:gap-6 mt-6 flex-wrap">
        <button className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>
        <div className="flex items-center gap-3 md:gap-4">
          <button className="text-sm text-foreground hover:text-primary transition-colors">1</button>
          <button className="text-sm text-foreground hover:text-primary transition-colors">2</button>
          <button className="text-sm text-foreground hover:text-primary transition-colors">3</button>
        </div>
        <button className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
