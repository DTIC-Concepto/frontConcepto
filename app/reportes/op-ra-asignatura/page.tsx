"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Faculty, Career } from "@/lib/api";
import { AuthService } from "@/lib/auth";
import { UserCareerService } from "@/lib/user-career";
import NotificationService from "@/lib/notifications";

interface Asignatura {
  id: number;
  codigo: string;
  nombre: string;
  nivelAporte: string;
}

interface ResultadoAprendizaje {
  ra: {
    id: number;
    codigo: string;
    descripcion: string;
  };
  asignaturas: Asignatura[];
}

interface ObjetivoProgramaData {
  opp: {
    id: number;
    codigo: string;
    descripcion: string;
  };
  resultadosAprendizaje: ResultadoAprendizaje[];
}

interface ReporteData {
  carreraId: number;
  carreraNombre: string;
  opps: ObjetivoProgramaData[];
}

export default function OpRaAsignatura() {
  // Estados para los datos
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [reporteData, setReporteData] = useState<ReporteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para los filtros
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [selectedCareerId, setSelectedCareerId] = useState<string>("");
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
  const [showCareerDropdown, setShowCareerDropdown] = useState(false);

  // Estados para los checkboxes de nivel de aporte
  const [altoChecked, setAltoChecked] = useState(false);
  const [medioChecked, setMedioChecked] = useState(false);
  const [bajoChecked, setBajoChecked] = useState(false);

  // Cargar carreras cuando se selecciona una facultad
  useEffect(() => {
    if (selectedFacultyId) {
      loadCareers(selectedFacultyId);
    } else {
      setCareers([]);
      setSelectedCareerId("");
    }
  }, [selectedFacultyId]);

  // Cargar reporte cuando cambian los filtros relevantes
  useEffect(() => {
    if (selectedCareerId && (altoChecked || medioChecked || bajoChecked)) {
      loadReporte();
    } else {
      setReporteData(null);
    }
  }, [selectedCareerId, altoChecked, medioChecked, bajoChecked]);

  // Cerrar dropdowns cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.faculty-dropdown') && !target.closest('.career-dropdown')) {
        setShowFacultyDropdown(false);
        setShowCareerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadFaculties = async () => {
    if (faculties.length > 0) return;
    
    try {
      setIsLoading(true);
      const userRole = AuthService.getUserRole();
      const userCareerInfo = UserCareerService.getUserCareerInfo();
      
      if (userRole === 'CEI') {
        const response = await AuthService.authenticatedFetch('/api/facultades?estadoActivo=true');
        if (!response.ok) throw new Error('Error al obtener facultades');
        const facultiesData = await response.json();
        const faculties = Array.isArray(facultiesData) ? facultiesData : 
                         (facultiesData.facultades || facultiesData.items || facultiesData.data || []);
        setFaculties(faculties);
      } else {
        if (userCareerInfo.carreraId) {
          // Obtener la carrera directamente desde el endpoint /carreras/{id}
          const careerResponse = await AuthService.authenticatedFetch(`/api/carreras/${userCareerInfo.carreraId}`);
          if (!careerResponse.ok) throw new Error('Error al obtener la carrera del coordinador');
          
          const myCareer = await careerResponse.json();
          
          if (myCareer && myCareer.facultadId) {
            const facultiesResponse = await AuthService.authenticatedFetch('/api/facultades?estadoActivo=true');
            if (!facultiesResponse.ok) throw new Error('Error al obtener facultades');
            const facultiesData = await facultiesResponse.json();
            const allFaculties = Array.isArray(facultiesData) ? facultiesData : 
                               (facultiesData.facultades || facultiesData.items || facultiesData.data || []);
            
            const myFaculty = allFaculties.find((f: Faculty) => Number(f.id) === Number(myCareer.facultadId));
            
            if (myFaculty) {
              setFaculties([myFaculty]);
              setSelectedFacultyId(myFaculty.id.toString());
            }
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar facultades:', error);
      NotificationService.error('Error al cargar facultades', 'No se pudieron cargar las facultades.');
      setFaculties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCareers = async (facultyId: string) => {
    try {
      setIsLoading(true);
      const userRole = AuthService.getUserRole();
      const userCareerInfo = UserCareerService.getUserCareerInfo();
      
      if (userRole === 'CEI') {
        const response = await AuthService.authenticatedFetch(`/api/carreras?facultadId=${facultyId}&estadoActivo=true`);
        if (!response.ok) throw new Error('Error al obtener carreras');
        const careersData = await response.json();
        const careers = careersData.data || (Array.isArray(careersData) ? careersData : 
                       (careersData.carreras || careersData.items || []));
        setCareers(careers);
      } else {
        // Para COORDINADOR, obtener su carrera directamente
        if (userCareerInfo.carreraId) {
          const careerResponse = await AuthService.authenticatedFetch(`/api/carreras/${userCareerInfo.carreraId}`);
          if (!careerResponse.ok) throw new Error('Error al obtener la carrera del coordinador');
          
          const myCareer = await careerResponse.json();
          
          if (myCareer && Number(myCareer.facultadId) === Number(facultyId)) {
            setCareers([myCareer]);
            setSelectedCareerId(myCareer.id.toString());
          } else {
            setCareers([]);
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar carreras:', error);
      NotificationService.error('Error al cargar carreras', 'No se pudieron cargar las carreras.');
      setCareers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReporte = async () => {
    try {
      setIsLoading(true);
      
      const nivelesAporte = [];
      if (altoChecked) nivelesAporte.push('Alto');
      if (medioChecked) nivelesAporte.push('Medio');
      if (bajoChecked) nivelesAporte.push('Bajo');

      const params = new URLSearchParams();
      nivelesAporte.forEach(nivel => params.append('nivelesAporte', nivel));

      const response = await AuthService.authenticatedFetch(
        `/api/reportes/opp-ra-asignaturas/${selectedCareerId}?${params.toString()}`
      );

      if (!response.ok) throw new Error('Error al obtener reporte');

      const data = await response.json();
      console.log('Reporte OPP-RA-Asignaturas cargado:', data);
      setReporteData(data);
    } catch (error) {
      console.error('Error al cargar reporte:', error);
      NotificationService.error('Error al cargar reporte', 'No se pudo cargar el reporte.');
      setReporteData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacultySelect = (facultyId: string) => {
    setSelectedFacultyId(facultyId);
    setShowFacultyDropdown(false);
    setSelectedCareerId("");
  };

  const handleCareerSelect = (careerId: string) => {
    setSelectedCareerId(careerId);
    setShowCareerDropdown(false);
  };

  const getSelectedFacultyName = () => {
    if (!selectedFacultyId) return "Seleccione una facultad";
    const faculty = faculties.find(f => f.id?.toString() === selectedFacultyId);
    return faculty?.nombre || "Seleccione una facultad";
  };

  const getSelectedCareerName = () => {
    if (!selectedCareerId) return "Seleccione una carrera";
    const career = careers.find(c => c.id?.toString() === selectedCareerId);
    return career?.nombre || "Seleccione una carrera";
  };

  const shouldShowTable = () => {
    return selectedFacultyId && selectedCareerId && (altoChecked || medioChecked || bajoChecked) && reporteData && reporteData.opps.length > 0;
  };

  return (
    <AcademicRoute>
      <Layout>
        <div className="bg-[#FAFAFB] min-h-screen p-8">
          <div className="max-w-[1024px] mx-auto space-y-6">
            {/* Title Card */}
            <div className="bg-white rounded-lg border border-[#DEE1E6] shadow-sm p-6">
              <h1 className="text-2xl font-bold text-[#171A1F] mb-2 leading-8">
                Reporte: Objetivos de Carrera vs Resultados de Aprendizaje vs
                Asignaturas
              </h1>
              <p className="text-[#565D6D] text-base">
                Visualice la alineación entre objetivos, resultados y
                asignaturas del programa académico.
              </p>
            </div>

            {/* Filters Card */}
            <div className="bg-white rounded-lg border border-[#DEE1E6] shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Faculty Dropdown - Combobox */}
                <div className="relative faculty-dropdown">
                  <label className="text-[#19191F] text-sm font-medium mb-2 block">
                    Facultad
                  </label>
                  <button
                    onClick={() => {
                      if (faculties.length === 0) {
                        loadFaculties();
                      }
                      setShowFacultyDropdown(!showFacultyDropdown);
                    }}
                    className="w-full px-3 py-2 border border-[#DEE1E6] rounded-md text-sm text-[#171A1F] bg-white text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <span className={!selectedFacultyId ? "text-[#565D6D]" : ""}>
                      {getSelectedFacultyName()}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#565D6D]" />
                  </button>
                  {showFacultyDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-[#DEE1E6] rounded-md shadow-lg max-h-60 overflow-auto">
                      {isLoading ? (
                        <div className="px-3 py-2 text-[#565D6D]">Cargando...</div>
                      ) : faculties.length === 0 ? (
                        <div className="px-3 py-2 text-[#565D6D]">No hay facultades disponibles</div>
                      ) : (
                        faculties.map((faculty) => (
                          <button
                            key={faculty.id}
                            onClick={() => handleFacultySelect(faculty.id?.toString() || "")}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                          >
                            {faculty.nombre}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Career Dropdown - Combobox */}
                <div className="relative career-dropdown">
                  <label className="text-[#19191F] text-sm font-medium mb-2 block">
                    Carrera
                  </label>
                  <button
                    onClick={() => setShowCareerDropdown(!showCareerDropdown)}
                    disabled={!selectedFacultyId}
                    className={`w-full px-3 py-2 border border-[#DEE1E6] rounded-md text-sm text-[#171A1F] bg-white text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !selectedFacultyId ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <span className={!selectedCareerId ? "text-[#565D6D]" : ""}>
                      {getSelectedCareerName()}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#565D6D]" />
                  </button>
                  {showCareerDropdown && selectedFacultyId && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-[#DEE1E6] rounded-md shadow-lg max-h-60 overflow-auto">
                      {isLoading ? (
                        <div className="px-3 py-2 text-[#565D6D]">Cargando...</div>
                      ) : careers.length === 0 ? (
                        <div className="px-3 py-2 text-[#565D6D]">No hay carreras disponibles</div>
                      ) : (
                        careers.map((career) => (
                          <button
                            key={career.id}
                            onClick={() => handleCareerSelect(career.id?.toString() || "")}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                          >
                            {career.nombre}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Level Checkboxes */}
                <div>
                  <label className="text-[#323234] font-roboto text-sm font-medium mb-2 block">
                    Nivel de aporte
                  </label>
                  <div className="flex flex-wrap gap-3 md:gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div 
                        onClick={() => setAltoChecked(!altoChecked)}
                        className="w-5 h-5 md:w-[22px] md:h-[22px] border-2 border-[#323234] rounded-sm flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        {altoChecked && (
                          <div className="w-3 h-3 md:w-[14px] md:h-[14px] bg-[#323234] rounded-sm"></div>
                        )}
                      </div>
                      <span className="text-[#323234] font-roboto text-xs md:text-sm font-light">
                        Alto
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div 
                        onClick={() => setMedioChecked(!medioChecked)}
                        className="w-5 h-5 md:w-[22px] md:h-[22px] border-2 border-[#323234] rounded-sm flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        {medioChecked && (
                          <div className="w-3 h-3 md:w-[14px] md:h-[14px] bg-[#323234] rounded-sm"></div>
                        )}
                      </div>
                      <span className="text-[#323234] font-roboto text-xs md:text-sm font-light">
                        Medio
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div 
                        onClick={() => setBajoChecked(!bajoChecked)}
                        className="w-5 h-5 md:w-[22px] md:h-[22px] border-2 border-[#323234] rounded-sm flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        {bajoChecked && (
                          <div className="w-3 h-3 md:w-[14px] md:h-[14px] bg-[#323234] rounded-sm"></div>
                        )}
                      </div>
                      <span className="text-[#323234] font-roboto text-xs md:text-sm font-light">
                        Bajo
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Table */}
            {isLoading && (
              <div className="bg-white rounded-lg border border-[#DEE1E6] shadow-sm p-6 text-center">
                <p className="text-[#565D6D]">Cargando reporte...</p>
              </div>
            )}

            {!isLoading && !shouldShowTable() && (
              <div className="bg-white rounded-lg border border-[#DEE1E6] shadow-sm p-6 text-center">
                <p className="text-[#565D6D]">
                  Seleccione una facultad, carrera y al menos un nivel de aporte para visualizar el reporte.
                </p>
              </div>
            )}

            {!isLoading && shouldShowTable() && (
              <div className="bg-white rounded-lg border border-[#DEE1E6] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#DEE1E6]">
                        <th className="bg-white text-left px-4 py-4 text-sm font-medium text-[#565D6D] border-r border-[#DEE1E6]/50 w-[400px]">
                          Objetivos de carrera
                        </th>
                        <th className="bg-white text-left px-4 py-4 text-sm font-medium text-[#565D6D] w-[300px]">
                          Resultados de Aprendizaje
                        </th>
                        <th className="bg-white text-left px-4 py-4 text-sm font-medium text-[#565D6D]">
                          Asignaturas
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporteData && reporteData.opps.map((oppData, oppIndex) => (
                        <tr 
                          key={oppData.opp.id} 
                          className={oppIndex < reporteData.opps.length - 1 ? "border-b border-[#F3F4F6]" : ""}
                        >
                          {/* Columna OPP */}
                          <td className="px-4 py-4 bg-white border-r border-[#F3F4F6]/50 align-top">
                            <p className="text-sm text-[#171A1F] leading-5">
                              {oppData.opp.codigo}: {oppData.opp.descripcion}
                            </p>
                          </td>
                          
                          {/* Columna RA */}
                          <td className="px-4 py-4 align-top">
                            <ul className="space-y-3">
                              {oppData.resultadosAprendizaje.map((raData) => (
                                <li key={raData.ra.id} className="flex gap-2">
                                  <span className="text-[#171A1F] mt-0.5">•</span>
                                  <span className="text-sm text-[#171A1F] leading-5">
                                    {raData.ra.codigo}: {raData.ra.descripcion}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </td>
                          
                          {/* Columna Asignaturas */}
                          <td className="px-4 py-4 align-top">
                            <div className="flex flex-wrap gap-2">
                              {/* Recolectar todas las asignaturas de todos los RA */}
                              {(() => {
                                // Usar un Map para evitar duplicados (key: id, value: asignatura)
                                const uniqueAsignaturas = new Map();
                                
                                oppData.resultadosAprendizaje.forEach(raData => {
                                  raData.asignaturas.forEach(asig => {
                                    if (!uniqueAsignaturas.has(asig.id)) {
                                      uniqueAsignaturas.set(asig.id, asig);
                                    }
                                  });
                                });

                                // Ordenar por código
                                return Array.from(uniqueAsignaturas.values())
                                  .sort((a, b) => a.codigo.localeCompare(b.codigo))
                                  .map(asig => (
                                    <span 
                                      key={asig.id}
                                      className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs font-bold text-[#1E2128] whitespace-nowrap"
                                    >
                                      {asig.codigo}: {asig.nombre}
                                    </span>
                                  ));
                              })()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </AcademicRoute>
  );
}
