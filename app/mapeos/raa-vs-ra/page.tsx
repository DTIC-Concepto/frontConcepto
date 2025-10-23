"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { Plus, Info, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip } from "@/components/ui/tooltip";
import { RaaService, type Raa } from "@/lib/raa";
import { LearningOutcomesService, type LearningOutcome } from "@/lib/learning-outcomes";
import { MappingsService } from "@/lib/mappings";
import { AsignaturasService, type Asignatura } from "@/lib/asignaturas";

// Interfaces para los datos dinámicos
interface MatrixRAA {
  id: number;
  codigo: string;
  tipo: string;
  descripcion: string;
}

interface MatrixRA {
  id: number;
  codigo: string;
  descripcion: string;
  tipo: 'GENERAL' | 'ESPECIFICO';
}

interface RaaRaMapping {
  raaId: number;
  raId: number;
  nivelAporte?: 'Alto' | 'Medio' | 'Bajo';
}

export default function MapeoRAAvsRA() {
  const router = useRouter();
  const [mappings, setMappings] = useState<RaaRaMapping[]>([]);
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouseX, setLastMouseX] = useState(0);
  const [lastMouseY, setLastMouseY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nivelAporteFilter, setNivelAporteFilter] = useState<string>("");

  // Estados para datos dinámicos del backend
  const [raaList, setRaaList] = useState<MatrixRAA[]>([]);
  const [raList, setRaList] = useState<MatrixRA[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAsignatura, setSelectedAsignatura] = useState<Asignatura | null>(null);

  // Estados para el selector de asignatura
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cargar asignaturas cuando se busca
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await AsignaturasService.getAsignaturas(searchTerm);
        setAsignaturas(data);
        if (searchTerm.trim() || showDropdown) {
          setShowDropdown(true);
        }
      } catch (error) {
        console.error('Error cargando asignaturas:', error);
        setAsignaturas([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, showDropdown]);

  // Cargar RAs de la carrera al montar el componente
  useEffect(() => {
    loadRAs();
  }, []);

  const loadRAs = async () => {
    try {
      const rasData = await LearningOutcomesService.getLearningOutcomes();
      setRaList(
        rasData.map((ra: LearningOutcome) => ({
          id: ra.id || 0,
          codigo: ra.codigo,
          descripcion: ra.descripcion,
          tipo: ra.tipo
        }))
      );
    } catch (error) {
      console.error('Error cargando RAs:', error);
      setRaList([]);
    }
  };

  // Cargar datos de la matriz cuando se selecciona una asignatura
  const handleAsignaturaSelect = async (asignatura: Asignatura) => {
    setSelectedAsignatura(asignatura);
    setSearchTerm(`${asignatura.codigo} - ${asignatura.nombre}`);
    setShowDropdown(false);
    
    if (!asignatura.id) return;
    
    setIsLoading(true);
    try {
      // Cargar RAAs de la asignatura
      const raasData = await RaaService.getRaas(asignatura.id);
      setRaaList(
        raasData.map((raa: Raa) => ({
          id: raa.id || 0,
          codigo: raa.codigo,
          tipo: raa.tipo,
          descripcion: raa.descripcion
        }))
      );

      // Cargar mappings existentes
      await loadMappings();
    } catch (error) {
      console.error('Error cargando datos de la matriz:', error);
      setRaaList([]);
      setMappings([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Recargar mappings cuando cambia el filtro
  useEffect(() => {
    if (selectedAsignatura) {
      loadMappings();
    }
  }, [nivelAporteFilter]);

  const loadMappings = async () => {
    try {
      // Obtener carreraId del usuario
      let carreraId: number | null = null;
      const rawUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
      if (rawUser) {
        const parsedUser = JSON.parse(rawUser);
        carreraId = parsedUser?.carrera?.id ?? parsedUser?.carreraId ?? null;
      }
      
      if (!carreraId) return;

      const filter = nivelAporteFilter && nivelAporteFilter !== "todos" 
        ? (nivelAporteFilter as 'Alto' | 'Medio' | 'Bajo')
        : undefined;
      
      const mappingsData = await MappingsService.getRaaRaMappings(carreraId, filter);
      
      setMappings(
        mappingsData.map((m: any) => ({
          raaId: m.raaId,
          raId: m.resultadoAprendizajeId || m.raId,
          nivelAporte: m.nivelAporte
        }))
      );
    } catch (error) {
      console.error('Error cargando mappings RAA-RA:', error);
      setMappings([]);
    }
  };

  // Función de recarga global
  useEffect(() => {
    (window as any).reloadRaaRaMatrix = () => {
      if (selectedAsignatura) {
        loadMappings();
      }
    };
    
    return () => {
      delete (window as any).reloadRaaRaMatrix;
    };
  }, [selectedAsignatura]);

  // Configuración de la tabla
  const CELL_WIDTH = 140;
  const CELL_HEIGHT = 60;
  const HEADER_WIDTH = 140;
  const VISIBLE_COLUMNS = 10;
  const VISIBLE_ROWS = 8;
  
  // Límites de navegación
  const maxScrollX = Math.max(0, (raList.length - VISIBLE_COLUMNS) * CELL_WIDTH);
  const maxScrollY = Math.max(0, (raaList.length - VISIBLE_ROWS) * CELL_HEIGHT);

  const hasRelationship = (raaId: number, raId: number) => {
    return mappings.some(mapping => 
      mapping.raaId === raaId && mapping.raId === raId
    );
  };

  const getRelationshipLevel = (raaId: number, raId: number): 'Alto' | 'Medio' | 'Bajo' | null => {
    const mapping = mappings.find(m => m.raaId === raaId && m.raId === raId);
    return mapping?.nivelAporte || null;
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setLastMouseX(e.clientX);
    setLastMouseY(e.clientY);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;
    
    const newScrollX = Math.max(0, Math.min(maxScrollX, scrollX - deltaX));
    const newScrollY = Math.max(0, Math.min(maxScrollY, scrollY - deltaY));
    
    setScrollX(newScrollX);
    setScrollY(newScrollY);
    setLastMouseX(e.clientX);
    setLastMouseY(e.clientY);
  }, [isDragging, lastMouseX, lastMouseY, scrollX, scrollY, maxScrollX, maxScrollY]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const getCellColor = () => {
    return 'bg-[#059669]/50 hover:bg-[#059669]/70';
  };

  const handleCreateRelation = () => {
    if (!selectedAsignatura?.id) {
      return;
    }
    // Guardar asignaturaId en localStorage para el wizard
    localStorage.setItem('current_asignatura_id', selectedAsignatura.id.toString());
    router.push('/matriz-raa-ra/nueva');
  };

  return (
    <AcademicRoute>
      <Layout>
        <div className="p-8 space-y-8 overflow-hidden">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-[#171A1F] font-montserrat">
                Matriz: Resultados de aprendizaje de Asignatura (RAA) y Resultados de aprendizaje (RA)
              </h1>
            </div>

            {/* Selector de Asignatura */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#171A1F] font-open-sans">
                Seleccione una materia:
              </label>
              <div ref={searchRef} className="relative max-w-2xl">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={async () => {
                      if (asignaturas.length === 0 && !isSearching) {
                        setIsSearching(true);
                        try {
                          const data = await AsignaturasService.getAsignaturas('');
                          setAsignaturas(data);
                          setShowDropdown(true);
                        } catch (error) {
                          console.error('Error cargando asignaturas:', error);
                        } finally {
                          setIsSearching(false);
                        }
                      } else {
                        setShowDropdown(true);
                      }
                    }}
                    placeholder="Buscar asignatura..."
                    className="w-full px-4 py-2 pr-10 border border-[#DEE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] text-sm"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#565D6D] pointer-events-none" />
                </div>
                
                {isSearching && (
                  <div className="absolute mt-1 w-full bg-white border border-[#DEE1E6] rounded-md shadow-lg p-4 text-center z-50">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#003366] mx-auto"></div>
                  </div>
                )}
                
                {showDropdown && asignaturas.length > 0 && !isSearching && (
                  <div className="absolute mt-1 w-full bg-white border border-[#DEE1E6] rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
                    {asignaturas.map((asignatura) => (
                      <button
                        key={asignatura.id}
                        onClick={() => handleAsignaturaSelect(asignatura)}
                        className="w-full px-4 py-3 text-left hover:bg-[#F3F4F6] transition-colors border-b border-[#DEE1E6] last:border-b-0"
                      >
                        <div className="font-medium text-[#171A1F] text-sm">
                          {asignatura.codigo} - {asignatura.nombre}
                        </div>
                        {asignatura.descripcion && (
                          <div className="text-xs text-[#565D6D] mt-1">
                            {asignatura.descripcion}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mostrar contenido solo si hay asignatura seleccionada */}
            {selectedAsignatura && (
              <>
                <div className="pt-4 border-t border-[#DEE1E6]">
                  <p className="text-sm text-[#565D6D] font-open-sans mb-4">
                    La tabla muestra la relación entre los Resultados de aprendizaje de Asignatura y los resultados de aprendizaje de una carrera.
                  </p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#2D61A4] rounded" />
                      <span className="text-[#171A1F] font-open-sans">Resultados de Aprendizaje de la Asignatura</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded" />
                      <span className="text-[#171A1F] font-open-sans">Resultados de Aprendizaje</span>
                    </div>
                  </div>
                </div>

                {/* Filtro y botón */}
                <div className="flex justify-between items-center pt-2">
                  <div className="w-64">
                    <Select value={nivelAporteFilter} onValueChange={setNivelAporteFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar por Nivel de Aporte" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="Alto">Alto</SelectItem>
                        <SelectItem value="Medio">Medio</SelectItem>
                        <SelectItem value="Bajo">Bajo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    onClick={handleCreateRelation}
                    className="bg-[#003366] hover:bg-[#002244] text-white gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nueva Relación
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Matrix Section */}
          {!selectedAsignatura ? (
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="text-center text-[#565D6D]">
                <p className="text-lg mb-2">Seleccione una asignatura</p>
                <p className="text-sm">Use el buscador para encontrar y seleccionar una asignatura.</p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
                <span className="ml-3 text-[#565D6D]">Cargando matriz...</span>
              </div>
            </div>
          ) : raaList.length === 0 || raList.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="text-center text-[#565D6D]">
                <p className="text-lg mb-2">No hay datos disponibles</p>
                <p className="text-sm">
                  {raaList.length === 0 ? 'No se encontraron Resultados de Aprendizaje de Asignatura (RAA) para esta materia. ' : ''}
                  {raList.length === 0 ? 'No se encontraron Resultados de Aprendizaje de Carrera (RA).' : ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-2 overflow-hidden">
              <div 
                ref={containerRef}
                className="relative cursor-grab active:cursor-grabbing select-none mx-auto overflow-hidden"
                style={{
                  width: HEADER_WIDTH + (VISIBLE_COLUMNS * CELL_WIDTH) + 20,
                  height: CELL_HEIGHT + (VISIBLE_ROWS * CELL_HEIGHT) + 20
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Data Cells (scrollable both directions) */}
                <div 
                  className="absolute z-10"
                  style={{
                    left: HEADER_WIDTH + 4 - scrollX,
                    top: CELL_HEIGHT + 4 - scrollY,
                    width: raList.length * CELL_WIDTH,
                    height: raaList.length * CELL_HEIGHT
                  }}
                >
                  {raaList.map((raa: MatrixRAA, rowIndex: number) => 
                    raList.map((ra: MatrixRA, colIndex: number) => {
                      const hasMapping = hasRelationship(raa.id, ra.id);
                      const nivel = getRelationshipLevel(raa.id, ra.id);
                      
                      return (
                        <div 
                          key={`cell-${raa.id}-${ra.id}`}
                          className={`absolute rounded border border-gray-200 flex items-center justify-center transition-colors ${
                            hasMapping 
                              ? getCellColor()
                              : 'bg-white'
                          }`}
                          style={{
                            left: colIndex * CELL_WIDTH,
                            top: rowIndex * CELL_HEIGHT,
                            width: CELL_WIDTH - 2,
                            height: CELL_HEIGHT - 2
                          }}
                        >
                          {hasMapping && (
                            <svg 
                              className="w-6 h-6 text-white" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={3} 
                                d="M5 13l4 4L19 7" 
                              />
                            </svg>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Top-left corner (fixed) */}
                <div 
                  className="absolute bg-[#E5E7EB] rounded border border-gray-200 z-30"
                  style={{
                    left: 2,
                    top: 2,
                    width: HEADER_WIDTH,
                    height: CELL_HEIGHT
                  }}
                />

                {/* Horizontal Headers (RA - fixed top, scrollable horizontally) */}
                <div 
                  className="absolute z-20 overflow-hidden"
                  style={{
                    left: HEADER_WIDTH + 4,
                    top: 0,
                    width: VISIBLE_COLUMNS * CELL_WIDTH,
                    height: CELL_HEIGHT + 4
                  }}
                >
                  <div 
                    style={{
                      transform: `translateX(-${scrollX}px)`,
                      width: raList.length * CELL_WIDTH
                    }}
                  >
                    {raList.map((ra: MatrixRA, index: number) => (
                      <div 
                        key={`header-ra-${ra.id}`}
                        className="absolute bg-[#E5E7EB] rounded border border-gray-200 flex items-center justify-center gap-1"
                        style={{
                          left: index * CELL_WIDTH,
                          top: 2,
                          width: CELL_WIDTH - 2,
                          height: CELL_HEIGHT - 2
                        }}
                      >
                        <span className="text-sm font-medium text-[#171A1F] font-open-sans">{ra.codigo}</span>
                        <Tooltip content={ra.descripcion} position="bottom">
                          <Info className="w-4 h-4 text-[#565D6D] cursor-pointer hover:text-[#171A1F]" />
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vertical Headers (RAA - fixed left, scrollable vertically) */}
                <div 
                  className="absolute z-20 overflow-hidden"
                  style={{
                    left: 0,
                    top: CELL_HEIGHT + 4,
                    width: HEADER_WIDTH + 4,
                    height: VISIBLE_ROWS * CELL_HEIGHT
                  }}
                >
                  <div 
                    style={{
                      transform: `translateY(-${scrollY}px)`,
                      height: raaList.length * CELL_HEIGHT
                    }}
                  >
                    {raaList.map((raa: MatrixRAA, index: number) => (
                      <div 
                        key={`header-raa-${raa.id}`}
                        className="absolute bg-[#2D61A4] text-white rounded border border-gray-300 flex items-center justify-center px-2 gap-1"
                        style={{
                          left: 2,
                          top: index * CELL_HEIGHT,
                          width: HEADER_WIDTH - 2,
                          height: CELL_HEIGHT - 2
                        }}
                      >
                        <span className="text-sm font-medium font-open-sans text-center flex-1">{raa.codigo}</span>
                        <Tooltip content={`${raa.tipo}: ${raa.descripcion}`} position="right">
                          <Info className="w-4 h-4 text-white cursor-pointer hover:text-gray-200 flex-shrink-0" />
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </AcademicRoute>
  );
}
