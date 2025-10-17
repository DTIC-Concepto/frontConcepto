"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import CreateMappingModal from "@/components/CreateMappingModal";
import { Plus, Info, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LearningOutcome, LearningOutcomesService } from "@/lib/learning-outcomes";
import { ProgramObjective, ProgramObjectivesService } from "@/lib/program-objectives";
import { MappingsService, type MappingResponse, type OppRaMapping } from "@/lib/mappings";
import { Tooltip } from "@/components/ui/tooltip";

// Interfaces para los datos dinámicos
interface MatrixRA {
  id: number;
  code: string;
  description: string;
  type: 'GENERAL' | 'ESPECIFICO';
}

interface MatrixOPP {
  id: number;
  code: string;
  description: string;
}

export default function MatrizRAvsOPP() {
  const router = useRouter();
  const [mappings, setMappings] = useState<MappingResponse[]>([]);
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouseX, setLastMouseX] = useState(0);
  const [lastMouseY, setLastMouseY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Estados para datos dinámicos del backend
  const [raList, setRaList] = useState<MatrixRA[]>([]);
  const [oppList, setOppList] = useState<MatrixOPP[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para el modal de creación de mapeo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<{
    raId: number;
    raCode: string;
    raDescription: string;
    oppId: number;
    oppCode: string;
    oppDescription: string;
  } | null>(null);

  // Cargar datos del backend
  useEffect(() => {
    loadMatrixData();
  }, []);

  // Función para recargar datos (llamar después de crear relaciones)
  const reloadData = useCallback(async () => {
    try {
      const existingMappings = await MappingsService.getOppRaMappings();
      setMappings(existingMappings);
    } catch (error) {
      console.error('Error recargando mappings:', error);
    }
  }, []);

  // Exponer función de recarga globalmente
  useEffect(() => {
    (window as any).reloadOppRaMatrix = reloadData;
    return () => {
      delete (window as any).reloadOppRaMatrix;
    };
  }, [reloadData]);

  const loadMatrixData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar RA (Learning Outcomes) - primero RG luego RE
      const learningOutcomes = await LearningOutcomesService.getLearningOutcomes();
      const raData: MatrixRA[] = learningOutcomes
        .map((ra: LearningOutcome) => ({
          id: ra.id!,
          code: ra.codigo,
          description: ra.descripcion,
          type: ra.tipo
        }))
        .sort((a: MatrixRA, b: MatrixRA) => {
          // Primero GENERAL (RG), luego ESPECIFICO (RE)
          if (a.type === 'GENERAL' && b.type === 'ESPECIFICO') return -1;
          if (a.type === 'ESPECIFICO' && b.type === 'GENERAL') return 1;
          return a.code.localeCompare(b.code);
        });

      // Cargar OPP (Program Objectives)
      const programObjectives = await ProgramObjectivesService.getProgramObjectives();
      const oppData: MatrixOPP[] = programObjectives
        .map((opp: ProgramObjective) => ({
          id: opp.id!,
          code: opp.codigo,
          description: opp.descripcion
        }))
        .sort((a: MatrixOPP, b: MatrixOPP) => a.code.localeCompare(b.code));

      setRaList(raData);
      setOppList(oppData);
      
      // Cargar mappings existentes
      const existingMappings = await MappingsService.getOppRaMappings();
      setMappings(existingMappings);
    } catch (error) {
      console.error('Error cargando datos de la matriz:', error);
      // En caso de error, usar listas vacías
      setRaList([]);
      setOppList([]);
      setMappings([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Configuración de la tabla - altura reducida
  const CELL_WIDTH = 140;
  const CELL_HEIGHT = 60;
  const HEADER_WIDTH = 140;
  const VISIBLE_COLUMNS = 10;
  const VISIBLE_ROWS = 8; // Reducido para menor altura
  
  // Límites de navegación
  const maxScrollX = Math.max(0, (raList.length - VISIBLE_COLUMNS) * CELL_WIDTH);
  const maxScrollY = Math.max(0, (oppList.length - VISIBLE_ROWS) * CELL_HEIGHT);

  const hasRelationship = (oppCode: string, raCode: string) => {
    // Buscar los IDs correspondientes
    const matchingOpp = oppList.find(opp => opp.code === oppCode);
    const matchingRa = raList.find(ra => ra.code === raCode);
    
    if (!matchingOpp || !matchingRa) return false;
    
    // Verificar si existe una relación entre estos IDs
    return mappings.some(mapping => 
      mapping.oppId === matchingOpp.id && 
      mapping.resultadoAprendizajeId === matchingRa.id
    );
  };

  // Función para manejar el clic en una celda
  const handleCellClick = (oppCode: string, raCode: string) => {
    // Solo permitir clic en celdas vacías
    if (hasRelationship(oppCode, raCode)) {
      return;
    }

    const ra = raList.find(r => r.code === raCode);
    const opp = oppList.find(o => o.code === oppCode);

    if (ra && opp) {
      setSelectedMapping({
        raId: ra.id,
        raCode: ra.code,
        raDescription: ra.description,
        oppId: opp.id,
        oppCode: opp.code,
        oppDescription: opp.description
      });
      setIsModalOpen(true);
    }
  };

  // Función para crear un nuevo mapeo
  const handleCreateMapping = async (justification: string) => {
    if (!selectedMapping) {
      throw new Error('No hay mapping seleccionado');
    }

    const result = await MappingsService.createOppRaMapping({
      resultadoAprendizajeId: selectedMapping.raId,
      oppId: selectedMapping.oppId,
      justificacion: justification
    });

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
                  Matriz: Objetivos de Carrera (OPP) y Resultados de aprendizaje (RA)
                </h1>
                <p className="text-sm text-[#565D6D] font-open-sans">
                  La tabla muestra la relación entre los objetivos de carrera (perfil profesional) y los resultados de aprendizaje (perfil de egreso) de una carrera.
                </p>
              </div>
              <Button 
                onClick={() => router.push('/mapeos/ra-vs-opp/seleccion')}
                className="bg-[#003366] hover:bg-[#002244] text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva Relación
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#2D61A4] rounded" />
                <span className="text-[#171A1F] font-open-sans">Objetivos de Carrera</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <span className="text-[#171A1F] font-open-sans">Resultados de Aprendizaje Carrera</span>
              </div>
            </div>
          </div>

          {/* Matrix Section */}
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
                <span className="ml-3 text-[#565D6D]">Cargando matriz...</span>
              </div>
            </div>
          ) : raList.length === 0 || oppList.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="text-center text-[#565D6D]">
                <p className="text-lg mb-2">No hay datos disponibles</p>
                <p className="text-sm">
                  {raList.length === 0 ? 'No se encontraron Resultados de Aprendizaje (RA).' : ''}
                  {oppList.length === 0 ? 'No se encontraron Objetivos de Programa (OPP).' : ''}
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
                  height: oppList.length * CELL_HEIGHT
                }}
              >
                {oppList.map((opp: MatrixOPP, rowIndex: number) => 
                  raList.map((ra: MatrixRA, colIndex: number) => (
                    <div 
                      key={`cell-${opp.id}-${ra.id}`}
                      className={`absolute bg-white rounded border border-gray-200 flex items-center justify-center transition-colors ${
                        hasRelationship(opp.code, ra.code) 
                          ? 'cursor-default' 
                          : 'cursor-pointer hover:bg-blue-50 hover:border-blue-300'
                      }`}
                      style={{
                        left: colIndex * CELL_WIDTH,
                        top: rowIndex * CELL_HEIGHT,
                        width: CELL_WIDTH - 2,
                        height: CELL_HEIGHT - 2
                      }}
                      onClick={() => handleCellClick(opp.code, ra.code)}
                    >
                      {hasRelationship(opp.code, ra.code) && (
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
                  ))
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
                    height: oppList.length * CELL_HEIGHT
                  }}
                >
                  {oppList.map((opp: MatrixOPP, index: number) => (
                    <div 
                      key={`header-opp-${opp.id}`}
                      className="absolute bg-[#2D61A4] text-white rounded border border-gray-300 flex items-center justify-center px-2 gap-1"
                      style={{
                        left: 2,
                        top: index * CELL_HEIGHT,
                        width: HEADER_WIDTH - 2,
                        height: CELL_HEIGHT - 2
                      }}
                    >
                      <span className="text-sm font-medium font-open-sans text-center flex-1">{opp.code}</span>
                      <Tooltip content={opp.description} position="right">
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

        {/* Modal para crear mapeo */}
        {selectedMapping && (
          <CreateMappingModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedMapping(null);
            }}
            onSave={handleCreateMapping}
            mappingType="OPP-RA"
          />
        )}
      </Layout>
    </AcademicRoute>
  );
}