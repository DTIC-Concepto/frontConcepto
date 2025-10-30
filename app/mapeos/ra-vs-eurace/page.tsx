'use client'

import { useState, useRef, useCallback, useEffect } from "react";
import { UserCareerService } from "@/lib/user-career";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import CreateMappingModal from "@/components/CreateMappingModal";
import { Plus, Info, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LearningOutcome, LearningOutcomesService } from "@/lib/learning-outcomes";
import { EurAceCriterion, EurAceCriteriaService } from "@/lib/eur-ace-criteria";
import { MappingsService, type MappingResponse, type EurAceMapping } from "@/lib/mappings";
import { Tooltip } from "@/components/ui/tooltip";
import { AuthService } from "@/lib/auth";

// Interfaces para los datos dinámicos
interface MatrixRA {
  id: number;
  code: string;
  description: string;
  type: 'GENERAL' | 'ESPECIFICO';
}

interface MatrixEURACE {
  id: number;
  code: string;
  description: string;
}

export default function MatrizRAvsEURACE() {
  const router = useRouter();
  const [mappings, setMappings] = useState<MappingResponse[]>([]);
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouseX, setLastMouseX] = useState(0);
  const [lastMouseY, setLastMouseY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const horizontalScrollbarRef = useRef<HTMLDivElement>(null);
  const verticalScrollbarRef = useRef<HTMLDivElement>(null);

  // Obtener rol del usuario para controlar permisos de creación
  const [userRole, setUserRole] = useState<string | null>(null);
  const [canCreate, setCanCreate] = useState(false);

  // Estados para datos dinámicos del backend
  const [raList, setRaList] = useState<MatrixRA[]>([]);
  const [euraceList, setEuraceList] = useState<MatrixEURACE[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado para carreraId - ahora dinámico según el usuario autenticado
  const [carreraId, setCarreraId] = useState<number | null>(null);

  // Inicializar datos del usuario solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = AuthService.getUserRole();
      setUserRole(role);
      setCanCreate(role === 'COORDINADOR');
      setCarreraId(UserCareerService.getUserCarreraId());
    }
  }, []);

  // Estados para el modal de creación de mapeo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<{
    raId: number;
    raCode: string;
    raDescription: string;
    eurAceId: number;
    eurAceCode: string;
    eurAceDescription: string;
  } | null>(null);

  // Cargar datos del backend
  useEffect(() => {
    if (carreraId !== null) {
      loadMatrixData();
    }
  }, [carreraId]); // Recargar cuando cambie la carreraId

  // Función para recargar datos (llamar después de crear relaciones)
  const reloadData = useCallback(async () => {
    try {
  const existingMappings = await MappingsService.getEurAceMappings(carreraId ?? undefined);
      setMappings(existingMappings);
    } catch (error) {
      console.error('Error recargando mappings:', error);
    }
  }, [carreraId]);

  // Exponer función de recarga globalmente
  useEffect(() => {
    (window as any).reloadEurAceMatrix = reloadData;
    return () => {
      delete (window as any).reloadEurAceMatrix;
    };
  }, [reloadData]);

  const loadMatrixData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Verificar que estamos en el cliente
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/mappings/ra-eur-ace/matrix/${carreraId ?? ''}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Error al obtener matriz RA-EURACE');
      const data = await response.json();
      setRaList(
        (data.ras || []).map((ra: any) => ({
          id: ra.id,
          code: ra.code,
          description: ra.description,
          type: ra.type
        }))
      );
      setEuraceList(
        (data.eurAceCriteria || []).map((eurace: any) => ({
          id: eurace.id,
          code: eurace.code,
          description: eurace.description
        }))
      );
      setMappings(
        (data.mappings || []).filter((m: any) => m.hasMapping || m.hasMaping).map((m: any) => ({
          id: 0,
          resultadoAprendizajeId: m.raId,
          eurAceId: m.eurAceId,
          justificacion: '',
          fechaCreacion: '',
          fechaModificacion: ''
        }))
      );
    } catch (error) {
      console.error('Error cargando datos de la matriz:', error);
      setRaList([]);
      setEuraceList([]);
      setMappings([]);
    } finally {
      setIsLoading(false);
    }
  }, [carreraId]);

  // Configuración de la tabla - altura aumentada para EUR-ACE
  const CELL_WIDTH = 140;
  const CELL_HEIGHT = 60;
  const HEADER_WIDTH = 140;
  const VISIBLE_COLUMNS = 10;
  const VISIBLE_ROWS = 7; // Volvemos a 7 para mostrar todos los criterios EUR-ACE
  
  // Límites de navegación
  const maxScrollX = Math.max(0, (raList.length - VISIBLE_COLUMNS) * CELL_WIDTH);
  const maxScrollY = Math.max(0, (euraceList.length - VISIBLE_ROWS) * CELL_HEIGHT);

  const showHorizontalScrollbar = raList.length > VISIBLE_COLUMNS;
  const showVerticalScrollbar = euraceList.length > VISIBLE_ROWS;

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

  const hasRelationship = (euraceCode: string, raCode: string) => {
    // Buscar los IDs correspondientes
    const matchingEurace = euraceList.find(eurace => eurace.code === euraceCode);
    const matchingRa = raList.find(ra => ra.code === raCode);
    
    if (!matchingEurace || !matchingRa) return false;
    
    // Verificar que mappings sea un array antes de usar .some()
    if (!Array.isArray(mappings)) {
      console.warn('Mappings no es un array:', mappings);
      return false;
    }
    
    // Verificar si existe una relación entre estos IDs
    // Funciona tanto con la estructura original (raId/eurAceId) como con la transformada (resultadoAprendizajeId/eurAceId)
    const hasRelation = mappings.some(mapping => {
      const mappingAny = mapping as any;
      return mappingAny.eurAceId === matchingEurace.id && 
             (mappingAny.resultadoAprendizajeId === matchingRa.id || mappingAny.raId === matchingRa.id);
    });
    
    return hasRelation;
  };

  // Función para manejar el click en una celda vacía
  const handleCellClick = (euraceCode: string, raCode: string) => {
    // Solo permitir click si no hay relación existente
    if (hasRelationship(euraceCode, raCode)) {
      return;
    }

    // Buscar los datos completos
    const matchingEurace = euraceList.find(eurace => eurace.code === euraceCode);
    const matchingRa = raList.find(ra => ra.code === raCode);

    if (!matchingEurace || !matchingRa) {
      console.error('No se encontraron los datos para la relación');
      return;
    }

    setSelectedMapping({
      raId: matchingRa.id,
      raCode: matchingRa.code,
      raDescription: matchingRa.description,
      eurAceId: matchingEurace.id,
      eurAceCode: matchingEurace.code,
      eurAceDescription: matchingEurace.description
    });
    setIsModalOpen(true);
  };

  // Función para crear un nuevo mapping
  const handleCreateMapping = async (justification: string) => {
    if (!selectedMapping) {
      throw new Error('No hay mapping seleccionado');
    }

    const newMapping: EurAceMapping = {
      resultadoAprendizajeId: selectedMapping.raId,
      eurAceId: selectedMapping.eurAceId,
      justificacion: justification
    };

    const result = await MappingsService.createEurAceMapping(newMapping);
    
    if (!result.success) {
      throw new Error(result.error || 'Error al crear el mapping');
    }

    // Recargar los datos
    await reloadData();
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

  return (
    <AcademicRoute>
      <Layout>
        <div className="p-8 space-y-8 overflow-hidden">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-[#171A1F] font-montserrat">
                  Matriz: Resultados de Aprendizaje (RA) y Criterios EUR-ACE
                </h1>
                <p className="text-sm text-[#565D6D] font-open-sans">
                  La tabla muestra la relación entre los Resultados de Aprendizaje (RA) y los Criterios EUR-ACE.
                </p>
              </div>
              {canCreate && (
                <Button 
                  onClick={() => router.push('/mapeos/ra-vs-eurace/seleccion')}
                  className="bg-[#003366] hover:bg-[#002244] text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Relación
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#2D61A4] rounded" />
                <span className="text-[#171A1F] font-open-sans">Criterios EUR-ACE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <span className="text-[#171A1F] font-open-sans">Resultados de Aprendizaje</span>
              </div>
            </div>
          </div>

          {/* Horizontal Scrollbar - shown at top when matrix is large */}
          {showHorizontalScrollbar && (
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
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
                <span className="ml-3 text-[#565D6D]">Cargando matriz...</span>
              </div>
            </div>
          ) : raList.length === 0 || euraceList.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="text-center text-[#565D6D]">
                <p className="text-lg mb-2">No hay datos disponibles</p>
                <p className="text-sm">
                  {raList.length === 0 ? 'No se encontraron Resultados de Aprendizaje (RA).' : ''}
                  {euraceList.length === 0 ? 'No se encontraron Criterios EUR-ACE.' : ''}
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
                  height: euraceList.length * CELL_HEIGHT
                }}
              >
                {euraceList.map((eurace: MatrixEURACE, rowIndex: number) => 
                  raList.map((ra: MatrixRA, colIndex: number) => {
                    const hasRelation = hasRelationship(eurace.code, ra.code);
                    
                    return (
                      <div 
                        key={`cell-${eurace.id}-${ra.id}`}
                        className={`absolute rounded border border-gray-200 flex items-center justify-center transition-colors ${
                          hasRelation 
                            ? 'bg-white cursor-default' 
                            : 'bg-white cursor-pointer hover:bg-blue-50 hover:border-blue-300'
                        }`}
                        style={{
                          left: colIndex * CELL_WIDTH,
                          top: rowIndex * CELL_HEIGHT,
                          width: CELL_WIDTH - 2,
                          height: CELL_HEIGHT - 2
                        }}
                        onClick={() => !hasRelation && handleCellClick(eurace.code, ra.code)}
                      >
                        {hasRelation && (
                          <div className="absolute inset-0 bg-emerald-500/50 hover:bg-emerald-500/70 rounded flex items-center justify-center transition-colors">
                            <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
                              <path
                                d="M12.8864 3.51118C13.148 3.24953 13.5721 3.24953 13.8337 3.51118C14.0955 3.77283 14.0955 4.19695 13.8337 4.4586L6.46377 11.8286C6.20212 12.0902 5.778 12.0902 5.51635 11.8286L2.16635 8.47859L2.12055 8.42754C1.90591 8.16443 1.92105 7.7765 2.16635 7.53121C2.41164 7.28586 2.79958 7.27072 3.06273 7.48538L3.11377 7.53121L5.99006 10.4075L12.8864 3.51118Z"
                                fill="currentColor"
                              />
                            </svg>
                          </div>
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

              {/* Horizontal Headers (fixed top, scrollable horizontally) */}
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
                      <span className="text-sm font-medium text-[#171A1F] font-open-sans">{ra.code}</span>
                      <Tooltip content={ra.description} position="bottom">
                        <Info className="w-4 h-4 text-[#565D6D] cursor-pointer hover:text-[#171A1F]" />
                      </Tooltip>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vertical Headers (fixed left, scrollable vertically) */}
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
                    height: euraceList.length * CELL_HEIGHT
                  }}
                >
                  {euraceList.map((eurace: MatrixEURACE, index: number) => (
                    <div 
                      key={`header-eurace-${eurace.id}`}
                      className="absolute bg-[#2D61A4] text-white rounded border border-gray-300 flex items-center justify-center px-2 gap-1"
                      style={{
                        left: 2,
                        top: index * CELL_HEIGHT,
                        width: HEADER_WIDTH - 2,
                        height: CELL_HEIGHT - 2
                      }}
                    >
                      <span className="text-sm font-medium font-open-sans text-center flex-1">{eurace.code}</span>
                      <Tooltip content={eurace.description} position="right">
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
                  style={{ width: '16px', height: '420px' }}
                  onScroll={(e) => {
                    const target = e.target as HTMLDivElement;
                    if (target.scrollHeight > target.clientHeight) {
                      const scrollPercentage = target.scrollTop / (target.scrollHeight - target.clientHeight);
                      setScrollY(scrollPercentage * maxScrollY);
                    }
                  }}
                >
                  <div style={{ height: `${euraceList.length * 150}px`, width: '1px' }} />
                </div>
              </div>
            )}
          </div>
          </div>
          )}
        </div>

        {/* Modal para crear mapeo */}
        {selectedMapping && (
          <CreateMappingModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedMapping(null);
            }}
            onSave={handleCreateMapping}
            mappingType="EUR-ACE"
          />
        )}
      </Layout>
    </AcademicRoute>
  );
}