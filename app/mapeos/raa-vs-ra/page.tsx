"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { Plus, Info, Search, X } from "lucide-react";
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
import { EditRaaRaMappingModal } from "@/components/EditRaaRaMappingModal";
import NotificationService from "@/lib/notifications";

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
  mappingId?: number;
  raaId: number;
  raId: number;
  nivelAporte?: 'Alto' | 'Medio' | 'Bajo';
  justificacion?: string;
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
  const horizontalScrollbarRef = useRef<HTMLDivElement>(null);
  const verticalScrollbarRef = useRef<HTMLDivElement>(null);
  const [nivelAporteFilter, setNivelAporteFilter] = useState<string>("");

  // Estados para datos dinámicos del backend
  const [raaList, setRaaList] = useState<MatrixRAA[]>([]);
  const [raList, setRaList] = useState<MatrixRA[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAsignatura, setSelectedAsignatura] = useState<Asignatura | null>(null);

  // Estados para el modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<RaaRaMapping | null>(null);

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

  // Los RAs ahora se cargan junto con la matriz cuando se selecciona una asignatura

  // Cargar datos de la matriz cuando se selecciona una asignatura
  const handleAsignaturaSelect = async (asignatura: Asignatura) => {
    setSelectedAsignatura(asignatura);
    setSearchTerm(`${asignatura.codigo} - ${asignatura.nombre}`);
    setShowDropdown(false);
    
    if (!asignatura.id) return;
    
    setIsLoading(true);
    try {
      // Obtener carreraId del usuario
      let carreraId: number | null = null;
      const rawUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
      if (rawUser) {
        const parsedUser = JSON.parse(rawUser);
        carreraId = parsedUser?.carrera?.id ?? parsedUser?.carreraId ?? null;
      }
      
      if (!carreraId) {
        throw new Error('No se encontró el ID de carrera del usuario');
      }

      // Cargar matriz completa usando el nuevo endpoint
      const matrixData = await MappingsService.getRaaRaMatrix(asignatura.id, carreraId);
      
      // Procesar RAAs - Backend envía: code, description, tipo
      setRaaList(
        (matrixData.raas || []).map((raa: any) => ({
          id: raa.id,
          codigo: raa.code || raa.codigo,
          tipo: raa.tipo,
          descripcion: raa.description || raa.descripcion
        }))
      );

      // Procesar RAs - Backend envía: code, name (no description), type
      setRaList(
        (matrixData.ras || []).map((ra: any) => ({
          id: ra.id,
          codigo: ra.code || ra.codigo,
          descripcion: ra.name || ra.description || ra.descripcion,
          tipo: ra.type || ra.tipo
        }))
      );

      // Procesar mappings
      setMappings(
        (matrixData.mappings || [])
          .filter((m: any) => m.hasMapping || m.hasMaping)
          .map((m: any) => ({
            mappingId: m.mappingId || m.id,
            raaId: m.raaId,
            raId: m.raId,
            nivelAporte: m.contributionLevel || m.nivelAporte,
            justificacion: m.justification || m.justificacion || ''
          }))
      );
    } catch (error) {
      console.error('Error cargando datos de la matriz:', error);
      setRaaList([]);
      setRaList([]);
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
      if (!selectedAsignatura?.id) return;

      // Obtener carreraId del usuario
      let carreraId: number | null = null;
      const rawUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
      if (rawUser) {
        const parsedUser = JSON.parse(rawUser);
        carreraId = parsedUser?.carrera?.id ?? parsedUser?.carreraId ?? null;
      }
      
      if (!carreraId) return;

      // Recargar matriz completa
      const matrixData = await MappingsService.getRaaRaMatrix(selectedAsignatura.id, carreraId);
      
      // Procesar mappings y aplicar filtro de nivel de aporte si existe
      let mappingsProcessed = (matrixData.mappings || [])
        .filter((m: any) => m.hasMapping || m.hasMaping)
        .map((m: any) => ({
          mappingId: m.mappingId || m.id,
          raaId: m.raaId,
          raId: m.raId,
          nivelAporte: m.contributionLevel || m.nivelAporte,
          justificacion: m.justification || m.justificacion || ''
        }));

      // Aplicar filtro de nivel de aporte si está seleccionado
      if (nivelAporteFilter && nivelAporteFilter !== "todos") {
        mappingsProcessed = mappingsProcessed.filter(
          (m: any) => m.nivelAporte === nivelAporteFilter
        );
      }

      setMappings(mappingsProcessed);
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

  // Mostrar scrollbars solo cuando hay contenido que se puede desplazar
  const showHorizontalScrollbar = maxScrollX > 0;
  const showVerticalScrollbar = maxScrollY > 0;

  // Sincronizar scrollbars con el estado de scroll
  useEffect(() => {
    if (horizontalScrollbarRef.current && showHorizontalScrollbar) {
      const scrollPercentage = maxScrollX > 0 ? scrollX / maxScrollX : 0;
      const maxScroll = horizontalScrollbarRef.current.scrollWidth - horizontalScrollbarRef.current.clientWidth;
      horizontalScrollbarRef.current.scrollLeft = scrollPercentage * maxScroll;
    }
  }, [scrollX, maxScrollX, showHorizontalScrollbar]);

  useEffect(() => {
    if (verticalScrollbarRef.current && showVerticalScrollbar) {
      const scrollPercentage = maxScrollY > 0 ? scrollY / maxScrollY : 0;
      const maxScroll = verticalScrollbarRef.current.scrollHeight - verticalScrollbarRef.current.clientHeight;
      verticalScrollbarRef.current.scrollTop = scrollPercentage * maxScroll;
    }
  }, [scrollY, maxScrollY, showVerticalScrollbar]);

  const hasRelationship = (raaId: number, raId: number) => {
    return mappings.some(mapping => 
      mapping.raaId === raaId && mapping.raId === raId
    );
  };

  const getRelationshipLevel = (raaId: number, raId: number): 'Alto' | 'Medio' | 'Bajo' | null => {
    const mapping = mappings.find(m => m.raaId === raaId && m.raId === raId);
    return mapping?.nivelAporte || null;
  };

  // Manejar clic en celda con relación
  const handleCellClick = (raaId: number, raId: number) => {
    const mapping = mappings.find(m => m.raaId === raaId && m.raId === raId);
    if (mapping && mapping.mappingId) {
      setSelectedMapping(mapping);
      setIsEditModalOpen(true);
    }
  };

  // Guardar cambios del modal
  const handleSaveMapping = async (mappingId: number, data: { nivelAporte: string; justificacion: string }) => {
    try {
      const result = await MappingsService.updateRaaRaMapping(mappingId, data);
      
      if (result.success) {
        NotificationService.success(
          'Relación actualizada',
          'Los cambios se han guardado correctamente'
        );
        // Recargar la matriz
        await loadMappings();
      } else {
        NotificationService.error(
          'Error',
          result.error || 'No se pudo actualizar la relación'
        );
      }
    } catch (error) {
      console.error('Error guardando cambios:', error);
      NotificationService.error(
        'Error',
        'Ocurrió un error al guardar los cambios'
      );
    }
  };

  // Eliminar relación
  const handleDeleteMapping = async (mappingId: number) => {
    try {
      const result = await MappingsService.deleteRaaRaMapping(mappingId);
      
      if (result.success) {
        NotificationService.success(
          'Relación eliminada',
          'La relación se ha eliminado correctamente'
        );
        // Recargar la matriz
        await loadMappings();
      } else {
        NotificationService.error(
          'Error',
          result.error || 'No se pudo eliminar la relación'
        );
      }
    } catch (error) {
      console.error('Error eliminando relación:', error);
      NotificationService.error(
        'Error',
        'Ocurrió un error al eliminar la relación'
      );
    }
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
    // Marcar que el wizard viene del sidebar
    localStorage.setItem('wizard_origin', 'sidebar');
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
                    className="w-full px-4 py-2 pr-20 border border-[#DEE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] text-sm"
                  />
                  {selectedAsignatura && (
                    <button
                      onClick={() => {
                        setSelectedAsignatura(null);
                        setSearchTerm('');
                        setRaaList([]);
                        setRaList([]);
                        setMappings([]);
                      }}
                      className="absolute right-10 top-1/2 -translate-y-1/2 text-[#565D6D] hover:text-[#171A1F] transition-colors"
                      title="Limpiar selección"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
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

          {/* Horizontal Scrollbar - shown at top when matrix is large */}
          {selectedAsignatura && !isLoading && raaList.length > 0 && raList.length > 0 && showHorizontalScrollbar && (
            <div className="mb-2">
              <div
                ref={horizontalScrollbarRef}
                className="overflow-x-scroll overflow-y-hidden scrollbar-thin"
                style={{ height: '16px' }}
                onScroll={(e) => {
                  const target = e.target as HTMLDivElement;
                  if (target.scrollWidth > target.clientWidth) {
                    const scrollPercentage = target.scrollLeft / (target.scrollWidth - target.clientWidth);
                    setScrollX(scrollPercentage * maxScrollX);
                  }
                }}
              >
                <div style={{ width: `${raList.length * 150}px`, height: '1px' }} />
              </div>
            </div>
          )}

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
              <div className="flex gap-2">
                {/* Matrix container */}
                <div 
                  ref={containerRef}
                  className="relative cursor-grab active:cursor-grabbing select-none mx-auto overflow-hidden flex-1"
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
                              ? `${getCellColor()} cursor-pointer hover:opacity-90`
                              : 'bg-white'
                          }`}
                          style={{
                            left: colIndex * CELL_WIDTH,
                            top: rowIndex * CELL_HEIGHT,
                            width: CELL_WIDTH - 2,
                            height: CELL_HEIGHT - 2
                          }}
                          onClick={(e) => {
                            if (hasMapping) {
                              e.stopPropagation();
                              handleCellClick(raa.id, ra.id);
                            }
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
              
              {/* Vertical Scrollbar - shown on right when matrix is large */}
              {showVerticalScrollbar && (
                <div className="ml-2">
                  <div
                    ref={verticalScrollbarRef}
                    className="overflow-y-scroll overflow-x-hidden scrollbar-thin"
                    style={{ width: '16px', height: '480px' }}
                    onScroll={(e) => {
                      const target = e.target as HTMLDivElement;
                      if (target.scrollHeight > target.clientHeight) {
                        const scrollPercentage = target.scrollTop / (target.scrollHeight - target.clientHeight);
                        setScrollY(scrollPercentage * maxScrollY);
                      }
                    }}
                  >
                    <div style={{ height: `${raaList.length * 150}px`, width: '1px' }} />
                  </div>
                </div>
              )}
            </div>
            </div>
          )}
        </div>

        {/* Modal de edición */}
        {selectedMapping && (
          <EditRaaRaMappingModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedMapping(null);
            }}
            mappingId={selectedMapping.mappingId!}
            raaText={raaList.find(r => r.id === selectedMapping.raaId)?.descripcion || ''}
            raText={raList.find(r => r.id === selectedMapping.raId)?.descripcion || ''}
            nivelAporte={selectedMapping.nivelAporte || 'Medio'}
            justificacion={selectedMapping.justificacion || ''}
            onSave={handleSaveMapping}
            onDelete={handleDeleteMapping}
          />
        )}
      </Layout>
    </AcademicRoute>
  );
}
