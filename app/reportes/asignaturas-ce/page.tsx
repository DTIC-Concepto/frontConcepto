"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { Search, ChevronDown, Info, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Faculty, Career } from "@/lib/api";
import { FacultiesService } from "@/lib/faculties";
import { CareersService } from "@/lib/careers";
import NotificationService from "@/lib/notifications";
import { Asignatura, AsignaturasService } from "@/lib/asignaturas";
import { EurAceCriterion, EurAceCriteriaService } from "@/lib/eur-ace-criteria";
import { AuthService } from "@/lib/auth";
import { UserCareerService } from "@/lib/user-career";

export default function AsignaturasEurace() {
  const router = useRouter();

  // Estados para los datos
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [filteredAsignaturas, setFilteredAsignaturas] = useState<Asignatura[]>([]);
  const [eurAceCriteria, setEurAceCriteria] = useState<EurAceCriterion[]>([]);
  const [relationships, setRelationships] = useState<Array<{ 
    asignaturaId: number; 
    criterioId: number; 
    nivelesAporte: string[];
    cantidadRAAs: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCriterion, setHoveredCriterion] = useState<string | null>(null);

  // Estados para los filtros
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [selectedCareerId, setSelectedCareerId] = useState<string>("");
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
  const [showCareerDropdown, setShowCareerDropdown] = useState(false);
  const [searchAsignatura, setSearchAsignatura] = useState<string>("");

  // Estados para los checkboxes de nivel de aporte
  const [altoChecked, setAltoChecked] = useState(false);
  const [medioChecked, setMedioChecked] = useState(false);
  const [bajoChecked, setBajoChecked] = useState(false);

  // Cargar solo criterios EUR-ACE al montar el componente
  useEffect(() => {
    loadEurAceCriteria();
  }, []);

  // Cargar carreras cuando se selecciona una facultad
  useEffect(() => {
    if (selectedFacultyId) {
      loadCareers(selectedFacultyId);
    } else {
      setCareers([]);
      setSelectedCareerId("");
    }
  }, [selectedFacultyId]);

  // Cargar asignaturas cuando se selecciona una carrera
  useEffect(() => {
    if (selectedCareerId) {
      loadAsignaturas(selectedCareerId);
    } else {
      setAsignaturas([]);
      setFilteredAsignaturas([]);
    }
  }, [selectedCareerId]);

  // Filtrar asignaturas cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchAsignatura.trim()) {
      setFilteredAsignaturas(asignaturas);
    } else {
      const term = searchAsignatura.toLowerCase();
      const filtered = asignaturas.filter(asig => 
        asig.codigo.toLowerCase().includes(term) ||
        asig.nombre.toLowerCase().includes(term)
      );
      setFilteredAsignaturas(filtered);
    }
  }, [searchAsignatura, asignaturas]);

  // Cargar relaciones cuando cambian los filtros relevantes
  useEffect(() => {
    if (selectedCareerId && (altoChecked || medioChecked || bajoChecked)) {
      loadRelationships();
    } else {
      setRelationships([]);
    }
  }, [selectedCareerId, altoChecked, medioChecked, bajoChecked]);

  // Debug: Mostrar información útil cuando cambian los datos
  useEffect(() => {
    console.log('=== DEBUG INFO ===');
    console.log('Asignaturas:', filteredAsignaturas.length, filteredAsignaturas.map(a => ({ id: a.id, codigo: a.codigo })));
    console.log('Criterios EUR-ACE:', eurAceCriteria.length, eurAceCriteria.map(c => ({ id: c.id, codigo: c.codigo })));
    console.log('Relaciones:', relationships.length, relationships);
    console.log('Carrera seleccionada:', selectedCareerId);
  }, [filteredAsignaturas, eurAceCriteria, relationships, selectedCareerId]);

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
    // Si ya se cargaron las facultades, no volver a cargar
    if (faculties.length > 0) return;
    
    try {
      setIsLoading(true);
      const userRole = AuthService.getUserRole();
      const userCareerInfo = UserCareerService.getUserCareerInfo();
      
      if (userRole === 'CEI') {
        // CEI puede ver todas las facultades
        const response = await AuthService.authenticatedFetch('/api/facultades?estadoActivo=true');
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error('Error al obtener facultades');
        }
        const facultiesData = await response.json();
        const faculties = Array.isArray(facultiesData) ? facultiesData : 
                         (facultiesData.facultades || facultiesData.items || facultiesData.data || []);
        setFaculties(faculties);
      } else {
        // COORDINADOR/PROFESOR: Obtener su carrera directamente del backend
        console.log('COORDINADOR - carreraId:', userCareerInfo.carreraId);
        
        if (userCareerInfo.carreraId) {
          // Obtener la carrera específica desde el endpoint /carreras/{id}
          const careerResponse = await AuthService.authenticatedFetch(`/api/carreras/${userCareerInfo.carreraId}`);
          
          if (!careerResponse.ok) {
            throw new Error('Error al obtener la carrera del coordinador');
          }
          
          const myCareer = await careerResponse.json();
          console.log('COORDINADOR - Mi carrera desde API:', myCareer);
          
          if (myCareer) {
            if (myCareer.facultadId) {
              console.log('COORDINADOR - facultadId de mi carrera:', myCareer.facultadId);
              
              // Obtener todas las facultades y filtrar la del coordinador
              const facultiesResponse = await AuthService.authenticatedFetch('/api/facultades?estadoActivo=true');
              if (!facultiesResponse.ok) {
                throw new Error('Error al obtener facultades');
              }
              const facultiesData = await facultiesResponse.json();
              const allFaculties = Array.isArray(facultiesData) ? facultiesData : 
                                 (facultiesData.facultades || facultiesData.items || facultiesData.data || []);
              
              console.log('COORDINADOR - Total facultades:', allFaculties.length);
              
              // Filtrar solo la facultad del coordinador (comparar ambos como números)
              const myFaculty = allFaculties.find((f: Faculty) => Number(f.id) === Number(myCareer.facultadId));
              
              console.log('COORDINADOR - Mi facultad encontrada:', myFaculty);
              
              if (myFaculty) {
                setFaculties([myFaculty]);
                setSelectedFacultyId(myFaculty.id.toString());
                console.log('COORDINADOR - Facultad configurada en estado');
              } else {
                console.error('COORDINADOR - No se encontró la facultad con id:', myCareer.facultadId);
              }
            } else {
              // Carrera sin facultadId asignada - crear una facultad temporal
              console.warn('COORDINADOR - Carrera sin facultadId, creando facultad temporal');
              const tempFaculty = {
                id: 0,
                codigo: 'TEMP',
                nombre: `Facultad de ${myCareer.nombre}`,
                descripcion: 'Facultad temporal',
                estadoActivo: true
              } as Faculty;
              setFaculties([tempFaculty]);
              setSelectedFacultyId('0');
            }
          } else {
            // La carrera del coordinador no existe en el sistema
            console.error('COORDINADOR - No se pudo obtener la carrera con id:', userCareerInfo.carreraId);
            NotificationService.error(
              'Carrera no encontrada',
              `Tu usuario tiene asignada la carrera con ID ${userCareerInfo.carreraId}, pero no se pudo obtener del sistema. Por favor contacta al administrador.`
            );
          }
        } else {
          console.error('COORDINADOR - No tiene carreraId');
        }
      }
    } catch (error) {
      console.error('Error al cargar facultades:', error);
      NotificationService.error(
        'Error al cargar facultades',
        'No se pudieron cargar las facultades. Verifique su conexión.'
      );
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
        // CEI puede ver todas las carreras de la facultad seleccionada
        const response = await AuthService.authenticatedFetch(`/api/carreras?facultadId=${facultyId}&estadoActivo=true`);
        if (!response.ok) {
          throw new Error('Error al obtener carreras');
        }
        const careersData = await response.json();
        const careers = careersData.data || (Array.isArray(careersData) ? careersData : 
                       (careersData.carreras || careersData.items || []));
        setCareers(careers);
      } else {
        // COORDINADOR/PROFESOR: Obtener todas las carreras y filtrar la suya
        const response = await AuthService.authenticatedFetch(`/api/carreras?facultadId=${facultyId}&estadoActivo=true`);
        if (!response.ok) {
          throw new Error('Error al obtener carreras');
        }
        const careersData = await response.json();
        const allCareers = careersData.data || (Array.isArray(careersData) ? careersData : 
                       (careersData.carreras || careersData.items || []));
        
        // Filtrar solo la carrera del coordinador (comparar como números)
        const myCareer = allCareers.find((c: Career) => Number(c.id) === Number(userCareerInfo.carreraId));
        
        if (myCareer) {
          setCareers([myCareer]);
          setSelectedCareerId(myCareer.id.toString());
        }
      }
    } catch (error) {
      console.error('Error al cargar carreras:', error);
      NotificationService.error(
        'Error al cargar carreras',
        'No se pudieron cargar las carreras. Verifique su conexión.'
      );
      setCareers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAsignaturas = async (careerId: string) => {
    try {
      setIsLoading(true);
      // Llamar directamente al endpoint de asignaturas filtrado por carrera
      const response = await AuthService.authenticatedFetch(`/api/asignaturas?carreraId=${careerId}&search=`);
      if (!response.ok) {
        throw new Error('Error al obtener asignaturas');
      }
      const asignaturasData = await response.json();
      // Extraer el array de asignaturas
      const asigs = asignaturasData.data || (Array.isArray(asignaturasData) ? asignaturasData : []);
      setAsignaturas(asigs);
      setFilteredAsignaturas(asigs);
    } catch (error) {
      console.error('Error al cargar asignaturas:', error);
      NotificationService.error(
        'Error al cargar asignaturas',
        'No se pudieron cargar las asignaturas. Verifique su conexión.'
      );
      setAsignaturas([]);
      setFilteredAsignaturas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEurAceCriteria = async () => {
    try {
      const criteria = await EurAceCriteriaService.getEurAceCriteria();
      setEurAceCriteria(criteria);
    } catch (error) {
      console.error('Error al cargar criterios EUR-ACE:', error);
      NotificationService.error(
        'Error al cargar criterios',
        'No se pudieron cargar los criterios EUR-ACE.'
      );
      setEurAceCriteria([]);
    }
  };

  const loadRelationships = async () => {
    if (!selectedCareerId) return;

    try {
      // Construir array de niveles seleccionados
      const nivelesAporte: string[] = [];
      if (altoChecked) nivelesAporte.push('Alto');
      if (medioChecked) nivelesAporte.push('Medio');
      if (bajoChecked) nivelesAporte.push('Bajo');

      if (nivelesAporte.length === 0) {
        setRelationships([]);
        return;
      }

      // Construir URL con parámetros
      const params = new URLSearchParams();
      nivelesAporte.forEach(nivel => params.append('nivelesAporte', nivel));
      if (searchAsignatura.trim()) {
        params.append('search', searchAsignatura.trim());
      }

      const url = `/api/reportes/matriz-asignaturas-eurace/${selectedCareerId}?${params.toString()}`;
      console.log('Cargando relaciones desde:', url);
      
      const response = await AuthService.authenticatedFetch(url);

      if (!response.ok) {
        console.error('Error response:', response.status, response.statusText);
        throw new Error('Error al obtener relaciones');
      }

      const data = await response.json();
      console.log('Datos recibidos del backend:', data);
      
      // Parsear las relaciones según el formato del backend
      // Formato: { asignaturas: [], eurAceCriteria: [], mappings: [], ... }
      let relations = [];
      
      if (data.mappings && Array.isArray(data.mappings)) {
        // Filtrar solo las que tienen mapping y mapear correctamente
        relations = data.mappings
          .filter((m: any) => m.hasMapping === true)
          .map((m: any) => ({
            asignaturaId: m.asignaturaId,
            criterioId: m.eurAceId,
            nivelesAporte: m.nivelesAporte || [],
            cantidadRAAs: m.cantidadRAAs || 0
          }));
        
        console.log('Mappings filtrados (hasMapping=true):', relations.length, 'de', data.mappings.length);
      }
      
      console.log('Relaciones procesadas:', relations);
      setRelationships(relations);
    } catch (error) {
      console.error('Error al cargar relaciones:', error);
      setRelationships([]);
    }
  };

  const handleFacultySelect = (facultyId: string) => {
    setSelectedFacultyId(facultyId);
    setShowFacultyDropdown(false);
    setSelectedCareerId(""); // Resetear carrera cuando cambia facultad
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

  // Determinar si se debe mostrar la tabla
  const shouldShowTable = () => {
    return selectedFacultyId && selectedCareerId && (altoChecked || medioChecked || bajoChecked);
  };

  const hasRelationship = (asignaturaId: number, criterioId: number) => {
    const hasRel = relationships.some(rel => {
      // Convertir a números para asegurar comparación correcta
      const relAsigId = Number(rel.asignaturaId);
      const relCritId = Number(rel.criterioId);
      return relAsigId === asignaturaId && relCritId === criterioId;
    });
    return hasRel;
  };

  const handleCellClick = (asignatura: Asignatura, criterioId: number) => {
    // Solo navegar si hay relación
    if (asignatura.id && hasRelationship(asignatura.id, criterioId)) {
      // Navegar a la página de detalle con el código de la asignatura y el carreraId
      router.push(`/reportes/asignaturas-ce/${asignatura.codigo}?carreraId=${selectedCareerId}`);
    }
  };

  return (
    <AcademicRoute>
      <Layout>
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="bg-white rounded-[10px] border border-[#DEE1E6] shadow-sm p-4 md:p-6">
            <h1 className="text-[#323234] font-sans text-xl md:text-2xl font-bold -tracking-[0.6px] mb-2">
              Reporte: Asignatura vs Criterios EURACE
            </h1>
            <p className="text-[#565D6D] font-roboto text-xs md:text-sm">
              Visualización detallada de la contribución de asignaturas a los
              criterios EUR-ACE.
            </p>
          </div>

          <div className="bg-white rounded-[10px] border border-[#DEE1E6] shadow-sm p-4 md:p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-6">
              <div>
                <label className="text-[#323234] font-roboto text-sm font-medium mb-3 block">
                  Facultad
                </label>
                <div className="relative faculty-dropdown">
                  <Input
                    className="pr-10 border-[#DEE1E6] cursor-pointer"
                    value={getSelectedFacultyName()}
                    readOnly
                    onClick={() => {
                      setShowFacultyDropdown(!showFacultyDropdown);
                      if (faculties.length === 0) {
                        loadFaculties();
                      }
                    }}
                  />
                  <ChevronDown 
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#565D6D] pointer-events-none" 
                  />
                  {showFacultyDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-[#DEE1E6] rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {isLoading ? (
                        <div className="p-3 text-center text-[#565D6D] text-sm">
                          Cargando...
                        </div>
                      ) : faculties.length === 0 ? (
                        <div className="p-3 text-center text-[#565D6D] text-sm">
                          No hay facultades disponibles
                        </div>
                      ) : (
                        faculties.map((faculty) => (
                          <div
                            key={faculty.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer text-[#323234] text-sm"
                            onClick={() => handleFacultySelect(faculty.id?.toString() || "")}
                          >
                            {faculty.nombre}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[#323234] font-roboto text-sm font-medium mb-3 block">
                  Carrera
                </label>
                <div className="relative career-dropdown">
                  <Input
                    className="pr-10 border-[#DEE1E6] cursor-pointer"
                    value={getSelectedCareerName()}
                    readOnly
                    onClick={() => selectedFacultyId && setShowCareerDropdown(!showCareerDropdown)}
                    disabled={!selectedFacultyId}
                  />
                  <ChevronDown 
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#323234] pointer-events-none" 
                  />
                  {showCareerDropdown && selectedFacultyId && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-[#DEE1E6] rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {isLoading ? (
                        <div className="p-3 text-center text-[#565D6D] text-sm">
                          Cargando...
                        </div>
                      ) : careers.length === 0 ? (
                        <div className="p-3 text-center text-[#565D6D] text-sm">
                          No hay carreras disponibles
                        </div>
                      ) : (
                        careers.map((career) => (
                          <div
                            key={career.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer text-[#323234] text-sm"
                            onClick={() => handleCareerSelect(career.id?.toString() || "")}
                          >
                            {career.nombre}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

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

            {shouldShowTable() && (
              <p className="text-[#323234] font-roboto text-sm md:text-base">
                Haga clic en un cruce para ver el detalle de la relación:
              </p>
            )}
          </div>

          {shouldShowTable() && (
            <div className="bg-white rounded-[10px] border border-[#DEE1E6] shadow-sm p-3 md:p-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-separate" style={{ borderSpacing: '2px' }}>
                  <thead>
                    <tr>
                      {/* Celda de intersección con búsqueda - estilo RAA vs RA */}
                      <th className="px-0 py-0 sticky left-0 z-20" style={{ minWidth: '280px' }}>
                        <div className="bg-white rounded border border-[#DEE1E6] h-[50px] flex items-center px-3">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={searchAsignatura}
                              onChange={(e) => setSearchAsignatura(e.target.value)}
                              placeholder="Buscar asignatura..."
                              className="w-full px-4 py-2 pr-10 border border-[#DEE1E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] text-sm placeholder:font-semibold"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#565D6D] pointer-events-none" />
                          </div>
                        </div>
                      </th>
                      {/* Headers horizontales: Criterios EUR-ACE - color #2D61A4 */}
                      {eurAceCriteria.map((criterion) => (
                        <th key={criterion.codigo} className="px-0 py-0 relative group" style={{ minWidth: '80px' }}>
                          <div className="bg-[#2D61A4] rounded px-2 py-2 h-[50px] flex flex-col items-center justify-center gap-1 relative">
                            <div
                              className="absolute top-1 cursor-help"
                              onMouseEnter={() => setHoveredCriterion(criterion.codigo)}
                              onMouseLeave={() => setHoveredCriterion(null)}
                            >
                              <Info className="w-3 h-3 text-white" />
                            </div>
                            {hoveredCriterion === criterion.codigo && (
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#171A1F] text-white text-xs rounded-md p-3 shadow-lg z-50 pointer-events-none font-open-sans">
                                <div className="font-semibold mb-1">{criterion.codigo}</div>
                                <div className="text-[#DEE1E6] font-normal">{criterion.descripcion}</div>
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#171A1F] rotate-45"></div>
                              </div>
                            )}
                            <span className="text-xs font-medium text-white mt-4">
                              {criterion.codigo}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAsignaturas.length === 0 ? (
                      <tr>
                        <td colSpan={eurAceCriteria.length + 1} className="text-center py-8">
                          <span className="text-[#565D6D] text-sm">
                            {searchAsignatura ? 'No se encontraron asignaturas' : 'No hay asignaturas disponibles'}
                          </span>
                        </td>
                      </tr>
                    ) : (
                      filteredAsignaturas.map((asignatura) => (
                        <tr key={asignatura.id}>
                          {/* Header vertical: Asignatura - fondo blanco, texto negro */}
                          <td className="px-0 py-0 sticky left-0 z-10" style={{ minWidth: '280px' }}>
                            <div className="bg-white border border-[#DEE1E6] rounded px-3 py-2 h-[45px] flex items-center">
                              <span className="text-xs font-medium text-[#171A1F] truncate" title={`${asignatura.codigo} - ${asignatura.nombre}`}>
                                {asignatura.codigo} - {asignatura.nombre}
                              </span>
                            </div>
                          </td>
                          {/* Celdas de la matriz */}
                          {eurAceCriteria.map((criterion) => {
                            const hasRel = asignatura.id && criterion.id && hasRelationship(asignatura.id, criterion.id);
                            return (
                              <td key={`${asignatura.id}-${criterion.id}`} className="px-0 py-0">
                                <div 
                                  onClick={() => criterion.id && handleCellClick(asignatura, criterion.id)}
                                  className={`rounded h-[45px] flex items-center justify-center transition-colors relative ${
                                    hasRel 
                                      ? 'bg-emerald-500/50 cursor-pointer hover:bg-emerald-500/70' 
                                      : 'bg-white border border-gray-100'
                                  }`}
                                >
                                  {hasRel && (
                                    <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
                                      <path
                                        d="M12.8864 3.51118C13.148 3.24953 13.5721 3.24953 13.8337 3.51118C14.0955 3.77283 14.0955 4.19695 13.8337 4.4586L6.46377 11.8286C6.20212 12.0902 5.778 12.0902 5.51635 11.8286L2.16635 8.47859L2.12055 8.42754C1.90591 8.16443 1.92105 7.7765 2.16635 7.53121C2.41164 7.28586 2.79958 7.27072 3.06273 7.48538L3.11377 7.53121L5.99006 10.4075L12.8864 3.51118Z"
                                        fill="currentColor"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </AcademicRoute>
  );
}
