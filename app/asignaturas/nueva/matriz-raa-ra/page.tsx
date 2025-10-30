"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";
import { RaaService, type Raa } from "@/lib/raa";
import { LearningOutcomesService, type LearningOutcome } from "@/lib/learning-outcomes";
import { MappingsService } from "@/lib/mappings";
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
  raaId: number;
  raId: number;
  nivelAporte?: 'Alto' | 'Medio' | 'Bajo';
  mappingId?: number;
  justificacion?: string;
}

export default function MatrizRAAvsRA() {
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
  const [isLoading, setIsLoading] = useState(true);
  const [asignaturaId, setAsignaturaId] = useState<number | null>(null);
  const [asignaturaNombre, setAsignaturaNombre] = useState<string>("");
  const [asignaturaCodigo, setAsignaturaCodigo] = useState<string>("");

  // Estados para el modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<{
    mappingId: number;
    raaId: number;
    raId: number;
    nivelAporte: 'Alto' | 'Medio' | 'Bajo';
    justificacion: string;
  } | null>(null);

  // Cargar datos del backend
  useEffect(() => {
    console.log('🔍 Matriz RAA vs RA - Iniciando carga de datos');
    
    // Obtener asignaturaId, nombre y código del localStorage
    const idFromStorage = typeof window !== 'undefined' 
      ? localStorage.getItem('current_asignatura_id') 
      : null;
    
    console.log('📌 AsignaturaId desde localStorage:', idFromStorage);
    
    if (idFromStorage) {
      const parsedId = parseInt(idFromStorage);
      console.log('✅ AsignaturaId válido:', parsedId);
      setAsignaturaId(parsedId);
      
      // Obtener nombre y código de la asignatura
      if (typeof window !== 'undefined') {
        const nombre = localStorage.getItem('current_asignatura_nombre') || "";
        const codigo = localStorage.getItem('current_asignatura_codigo') || "";
        setAsignaturaNombre(nombre);
        setAsignaturaCodigo(codigo);
      }
      
      loadMatrixData(parsedId);
    } else {
      console.warn('⚠️ No se encontró current_asignatura_id en localStorage');
      setIsLoading(false);
    }
    
    // Exponer función de recarga globalmente para que el wizard pueda llamarla
    (window as any).reloadRaaRaMatrix = () => {
      console.log('♻️ Recargando matriz desde función global');
      if (idFromStorage) {
        loadMatrixData(parseInt(idFromStorage));
      }
    };
    
    return () => {
      delete (window as any).reloadRaaRaMatrix;
    };
  }, []);

  // Recargar datos cuando cambia el filtro de nivel de aporte
  useEffect(() => {
    if (asignaturaId) {
      loadMatrixData(asignaturaId);
    }
  }, [nivelAporteFilter, asignaturaId]);

  const loadMatrixData = async (asigId: number) => {
    try {
      console.log('🔄 loadMatrixData - Iniciando con asignaturaId:', asigId);
      setIsLoading(true);
      
      // Obtener carreraId del usuario logueado
      let carreraId: number | null = null;
      try {
        const rawUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
        console.log('👤 Usuario raw desde localStorage:', rawUser ? 'Encontrado' : 'No encontrado');
        
        if (rawUser) {
          const parsedUser = JSON.parse(rawUser);
          console.log('👤 Usuario parseado:', parsedUser);
          
          // Intentar obtener de carreraIds array primero
          carreraId = parsedUser?.carreraIds?.[0] ?? parsedUser?.carrera?.id ?? parsedUser?.carreraId ?? null;
          console.log('🎓 CarreraId obtenido:', carreraId);
        }
      } catch (error) {
        console.error('❌ Error parseando usuario:', error);
      }
      
      if (!carreraId) {
        console.error('❌ No se encontró carreraId, abortando carga');
        throw new Error('No se encontró carreraId');
      }

      console.log('📡 Llamando a MappingsService.getRaaRaMatrix con:', { asigId, carreraId });
      
      // Usar el nuevo endpoint de matriz que devuelve todo junto
      const matrixData = await MappingsService.getRaaRaMatrix(asigId, carreraId);
      
      console.log('✅ Matrix data recibida:', matrixData);
      console.log('📊 RAAs:', matrixData.raas?.length || 0);
      console.log('📊 RAs:', matrixData.ras?.length || 0);
      console.log('📊 Mappings:', matrixData.mappings?.length || 0);
      
      // Log de muestra de los datos
      if (matrixData.raas?.length > 0) {
        console.log('🔍 Primer RAA:', matrixData.raas[0]);
      }
      if (matrixData.ras?.length > 0) {
        console.log('🔍 Primer RA:', matrixData.ras[0]);
      }

      // Establecer RAAs - El backend envía: code, description, tipo
      const mappedRaas = matrixData.raas.map((raa: any) => ({
        id: raa.id || 0,
        codigo: raa.code || raa.codigo || 'N/A',
        tipo: raa.tipo || 'N/A',
        descripcion: raa.description || raa.descripcion || 'Sin descripción'
      }));
      console.log('📝 RAAs mapeados:', mappedRaas);
      setRaaList(mappedRaas);

      // Establecer RAs - El backend envía: code, name (no descripcion), type
      const mappedRas = matrixData.ras.map((ra: any) => ({
        id: ra.id || 0,
        codigo: ra.code || ra.codigo || 'N/A',
        descripcion: ra.name || ra.descripcion || 'Sin descripción',
        tipo: (ra.type || ra.tipo || 'GENERAL') as 'GENERAL' | 'ESPECIFICO'
      }));
      console.log('📝 RAs mapeados:', mappedRas);
      setRaList(mappedRas);

      // Establecer mappings con el formato correcto incluyendo mappingId y justificacion
      const allMappings = matrixData.mappings
        .filter((m: any) => m.hasMapping)
        .map((m: any) => ({
          raaId: m.raaId,
          raId: m.raId,
          nivelAporte: m.nivelAporte,
          mappingId: m.mappingId,
          justificacion: m.justificacion
        }));

      // Aplicar filtro de nivel de aporte si está seleccionado
      if (nivelAporteFilter && nivelAporteFilter !== "todos") {
        const filtered = allMappings.filter((m: any) => m.nivelAporte === nivelAporteFilter);
        console.log('🔍 Filtrado por nivel:', nivelAporteFilter, '- Resultados:', filtered.length);
        setMappings(filtered);
      } else {
        console.log('📋 Sin filtro - Mostrando todos los mappings:', allMappings.length);
        setMappings(allMappings);
      }

      console.log('✅ loadMatrixData completado exitosamente');
    } catch (error) {
      console.error('❌ Error cargando datos de la matriz:', error);
      NotificationService.error('Error', 'No se pudo cargar la matriz. Por favor, intente nuevamente.');
      setRaaList([]);
      setRaList([]);
      setMappings([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Configuración de la tabla
  const CELL_WIDTH = 140;
  const CELL_HEIGHT = 60;
  const HEADER_WIDTH = 140;
  const VISIBLE_COLUMNS = 10;
  const VISIBLE_ROWS = 8;
  
  // Límites de navegación
  const maxScrollX = Math.max(0, (raList.length - VISIBLE_COLUMNS) * CELL_WIDTH);
  const maxScrollY = Math.max(0, (raaList.length - VISIBLE_ROWS) * CELL_HEIGHT);

  const showHorizontalScrollbar = raList.length > VISIBLE_COLUMNS;
  const showVerticalScrollbar = raaList.length > VISIBLE_ROWS;

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

  // Función para manejar el clic en una celda
  const handleCellClick = (raaId: number, raId: number) => {
    const mapping = mappings.find(m => m.raaId === raaId && m.raId === raId);
    
    if (!mapping || !mapping.mappingId) {
      // Si no hay relación, abrir el wizard para crear una nueva
      console.log('Cell clicked - No mapping, open wizard:', { raaId, raId });
      // TODO: Implementar wizard cuando esté listo
      return;
    }

    // Si hay relación, abrir modal de edición
    setSelectedMapping({
      mappingId: mapping.mappingId,
      raaId: mapping.raaId,
      raId: mapping.raId,
      nivelAporte: (mapping.nivelAporte || 'Medio') as 'Alto' | 'Medio' | 'Bajo',
      justificacion: mapping.justificacion || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveMapping = async (mappingId: number, data: { nivelAporte: string; justificacion: string }) => {
    const result = await MappingsService.updateRaaRaMapping(mappingId, data);

    if (result.success) {
      NotificationService.success('Éxito', 'Relación actualizada correctamente');
      setIsEditModalOpen(false);
      setSelectedMapping(null);
      // Recargar la matriz
      if (asignaturaId) {
        loadMatrixData(asignaturaId);
      }
    } else {
      NotificationService.error('Error', result.error || 'Error al actualizar la relación');
    }
  };

  const handleDeleteMapping = async (mappingId: number) => {
    const result = await MappingsService.deleteRaaRaMapping(mappingId);

    if (result.success) {
      NotificationService.success('Éxito', 'Relación eliminada correctamente');
      setIsEditModalOpen(false);
      setSelectedMapping(null);
      // Recargar la matriz
      if (asignaturaId) {
        loadMatrixData(asignaturaId);
      }
    } else {
      NotificationService.error('Error', result.error || 'Error al eliminar la relación');
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

  const getCellColor = (nivelAporte: 'Alto' | 'Medio' | 'Bajo' | null) => {
    // Color único para todas las relaciones (#059669 al 50%)
    return 'bg-[#059669]/50 hover:bg-[#059669]/70';
  };

  return (
    <AcademicRoute>
      <Layout>
        <div className="p-6 lg:p-12">
          <div className="max-w-7xl mx-auto">
            {/* Título de la Asignatura */}
            {asignaturaNombre && asignaturaCodigo && (
              <h2 className="text-2xl font-bold text-black mb-4">
                {asignaturaNombre} ({asignaturaCodigo})
              </h2>
            )}
            
            {/* Tabs */}
            <div className="bg-[#F3F4F6] rounded-lg p-1 mb-6">
              <Tabs value="matriz" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-transparent gap-1">
                  <TabsTrigger
                    value="pea"
                    className="data-[state=active]:bg-white data-[state=active]:text-[#171A1F] data-[state=inactive]:text-[#565D6D]/50"
                    onClick={() => router.push("/asignaturas/nueva")}
                  >
                    Asignatura (PEA)
                  </TabsTrigger>
                  <TabsTrigger
                    value="raa"
                    className="data-[state=active]:bg-white data-[state=active]:text-[#171A1F] data-[state=inactive]:text-[#565D6D]/50"
                    onClick={() => router.push("/asignaturas/nueva/resultados")}
                  >
                    Resultados de Aprendizaje (RAA)
                  </TabsTrigger>
                  <TabsTrigger
                    value="matriz"
                    className="data-[state=active]:bg-[#003366] data-[state=active]:text-white data-[state=inactive]:text-[#565D6D]/50 font-bold"
                  >
                    Matriz RAA vs RA
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-[#171A1F] font-montserrat">
                    Matriz: Resultados de aprendizaje de Asignatura (RAA) y Resultados de aprendizaje (RA)
                  </h1>
                  <p className="text-sm text-[#565D6D] font-open-sans">
                    La tabla muestra la relación entre los resultados de aprendizaje de la asignatura (RAA) y los resultados de aprendizaje de la carrera (RA).
                  </p>
                </div>
              </div>

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
                onClick={() => {
                  // Marcar que el wizard viene de la pestaña
                  localStorage.setItem('wizard_origin', 'tab');
                  router.push('/matriz-raa-ra/nueva');
                }}
                className="bg-[#003366] hover:bg-[#002244] text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva Relación
              </Button>
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
          ) : !asignaturaId ? (
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="text-center text-[#565D6D]">
                <p className="text-lg mb-2">No hay asignatura seleccionada</p>
                <p className="text-sm">Por favor, cree una asignatura primero desde la pestaña "Datos Básicos".</p>
              </div>
            </div>
          ) : raaList.length === 0 || raList.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="text-center text-[#565D6D]">
                <p className="text-lg mb-2">No hay datos disponibles</p>
                <p className="text-sm">
                  {raaList.length === 0 ? 'No se encontraron Resultados de Aprendizaje de Asignatura (RAA). ' : ''}
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
                            ? getCellColor(nivel)
                            : 'bg-white cursor-pointer hover:bg-blue-50 hover:border-blue-300'
                        }`}
                        style={{
                          left: colIndex * CELL_WIDTH,
                          top: rowIndex * CELL_HEIGHT,
                          width: CELL_WIDTH - 2,
                          height: CELL_HEIGHT - 2
                        }}
                        onClick={() => handleCellClick(raa.id, ra.id)}
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
        </div>
      </Layout>

      {/* Modal de edición */}
      {isEditModalOpen && selectedMapping && (
        <EditRaaRaMappingModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedMapping(null);
          }}
          mappingId={selectedMapping.mappingId}
          raaText={raaList.find(r => r.id === selectedMapping.raaId)?.descripcion || ''}
          raText={raList.find(r => r.id === selectedMapping.raId)?.descripcion || ''}
          nivelAporte={selectedMapping.nivelAporte}
          justificacion={selectedMapping.justificacion}
          onSave={handleSaveMapping}
          onDelete={handleDeleteMapping}
        />
      )}
    </AcademicRoute>
  );
}
