"use client";

import { useState, useEffect } from "react";
import { X, ChevronUp, ChevronDown, Search, Check } from "lucide-react";
import { CreateCareerRequest, Faculty, User, MODALIDADES, MODALIDAD_DISPLAY_NAMES, ModalidadType } from "@/lib/api";
import { CareersService } from "@/lib/careers";
import { FacultiesService } from "@/lib/faculties";
import { UsersService } from "@/lib/users";
import NotificationService from "@/lib/notifications";

interface NewCareerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewCareerModal({ isOpen, onClose, onSuccess }: NewCareerModalProps) {
  const [formData, setFormData] = useState<CreateCareerRequest>({
    codigo: "",
    nombre: "",
    facultadId: 0,
    coordinadorId: 0,
    duracion: 0,
    modalidad: "PRESENCIAL",
    estadoActivo: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estados para los datos relacionados
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [professors, setProfessors] = useState<User[]>([]);
  const [facultiesLoading, setFacultiesLoading] = useState(false);
  const [professorsLoading, setProfessorsLoading] = useState(false);
  
  // Estados para los dropdowns
  const [isModalidadDropdownOpen, setIsModalidadDropdownOpen] = useState(false);
  const [isFacultyDropdownOpen, setIsFacultyDropdownOpen] = useState(false);
  const [isCoordinatorDropdownOpen, setIsCoordinatorDropdownOpen] = useState(false);
  const [facultySearchTerm, setFacultySearchTerm] = useState('');
  const [coordinatorSearchTerm, setCoordinatorSearchTerm] = useState('');

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsModalidadDropdownOpen(false);
        setIsFacultyDropdownOpen(false);
        setIsCoordinatorDropdownOpen(false);
      }
    };

    if (isModalidadDropdownOpen || isFacultyDropdownOpen || isCoordinatorDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isModalidadDropdownOpen, isFacultyDropdownOpen, isCoordinatorDropdownOpen]);

  const loadInitialData = async () => {
    try {
      setFacultiesLoading(true);
      setProfessorsLoading(true);
      
      const [facultiesData, professorsData] = await Promise.all([
        FacultiesService.getAllFaculties({ estadoActivo: true }),
        UsersService.getUsers({ rol: 'PROFESOR', estadoActivo: true })
      ]);
      
      setFaculties(facultiesData);
      setProfessors(professorsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      NotificationService.error(
        'Error al cargar datos',
        'No se pudieron cargar las facultades y profesores disponibles'
      );
    } finally {
      setFacultiesLoading(false);
      setProfessorsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.codigo.trim()) {
      newErrors.codigo = "El código es requerido";
    } else if (formData.codigo.length < 2 || formData.codigo.length > 20) {
      newErrors.codigo = "El código debe tener entre 2 y 20 caracteres";
    }
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (formData.nombre.length < 5 || formData.nombre.length > 200) {
      newErrors.nombre = "El nombre debe tener entre 5 y 200 caracteres";
    }
    
    if (!formData.facultadId || formData.facultadId === 0) {
      newErrors.facultadId = "La facultad es requerida";
    }
    
    if (!formData.coordinadorId || formData.coordinadorId === 0) {
      newErrors.coordinadorId = "El coordinador es requerido";
    }
    
    if (!formData.duracion || formData.duracion < 1 || formData.duracion > 20) {
      newErrors.duracion = "La duración debe ser entre 1 y 20 semestres";
    }

    if (!formData.modalidad) {
      newErrors.modalidad = "La modalidad es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await CareersService.createCareer(formData);
      
      NotificationService.success(
        'Carrera creada',
        'La carrera ha sido creada exitosamente'
      );
      
      handleCancel();
      onSuccess();
      
    } catch (error) {
      console.error('Error al crear carrera:', error);
      NotificationService.error(
        'Error al crear carrera',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateCareerRequest, value: string | number | ModalidadType | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'facultadId' || field === 'coordinadorId' || field === 'duracion' 
        ? Number(value) || 0 
        : value
    }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      setFormData({
        codigo: "",
        nombre: "",
        facultadId: 0,
        coordinadorId: 0,
        duracion: 0,
        modalidad: "PRESENCIAL",
        estadoActivo: true
      });
      setErrors({});
      setIsModalidadDropdownOpen(false);
      setIsFacultyDropdownOpen(false);
      setIsCoordinatorDropdownOpen(false);
      setFacultySearchTerm('');
      setCoordinatorSearchTerm('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const selectedFaculty = faculties.find(f => f.id === formData.facultadId);
  const selectedCoordinator = professors.find(p => p.id === formData.coordinadorId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh]" style={{ zIndex: 10000 }}>
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Nueva Carrera</h2>
              <p className="mt-2 text-sm text-gray-600">
                Ingrese los detalles para crear una nueva carrera.
              </p>
            </div>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Código */}
          <div className="flex items-center gap-6">
            <label htmlFor="codigo" className="w-32 text-right text-sm text-gray-900">
              Código *
            </label>
            <div className="flex-1">
              <input
                type="text"
                id="codigo"
                value={formData.codigo}
                onChange={(e) => handleInputChange('codigo', e.target.value.toUpperCase())}
                className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                  errors.codigo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="IC001"
                disabled={isLoading}
                maxLength={20}
              />
              {errors.codigo && (
                <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
              )}
            </div>
          </div>

          {/* Nombre */}
          <div className="flex items-center gap-6">
            <label htmlFor="nombre" className="w-32 text-right text-sm text-gray-900">
              Nombre *
            </label>
            <div className="flex-1">
              <input
                type="text"
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingeniería en Sistemas"
                disabled={isLoading}
                maxLength={200}
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
              )}
            </div>
          </div>

          {/* Modalidad */}
          <div className="flex items-center gap-6">
            <label className="w-32 text-right text-sm text-gray-900">
              Modalidad *
            </label>
            <div className="flex-1 relative dropdown-container">
              <div
                onClick={() => setIsModalidadDropdownOpen(!isModalidadDropdownOpen)}
                className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer flex items-center justify-between ${
                  errors.modalidad ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <span className="text-gray-900">
                  {MODALIDAD_DISPLAY_NAMES[formData.modalidad]}
                </span>
                <div className="flex flex-col items-center">
                  <ChevronUp className="w-3 h-3 text-gray-400" />
                  <ChevronDown className="w-3 h-3 text-gray-400 -mt-0.5" />
                </div>
              </div>
              
              {isModalidadDropdownOpen && (
                <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {MODALIDADES.map((modalidad) => (
                    <div
                      key={modalidad}
                      onClick={() => {
                        handleInputChange('modalidad', modalidad);
                        setIsModalidadDropdownOpen(false);
                      }}
                      className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-900 flex items-center justify-between"
                    >
                      <span>{MODALIDAD_DISPLAY_NAMES[modalidad]}</span>
                      {formData.modalidad === modalidad && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              {errors.modalidad && (
                <p className="mt-1 text-sm text-red-600">{errors.modalidad}</p>
              )}
            </div>
          </div>

          {/* Duración */}
          <div className="flex items-center gap-6">
            <label htmlFor="duracion" className="w-32 text-right text-sm text-gray-900">
              Duración<br />(semestres) *
            </label>
            <div className="flex-1">
              <input
                type="number"
                id="duracion"
                value={formData.duracion || ''}
                onChange={(e) => handleInputChange('duracion', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                  errors.duracion ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="10"
                disabled={isLoading}
                min={1}
                max={20}
              />
              {errors.duracion && (
                <p className="mt-1 text-sm text-red-600">{errors.duracion}</p>
              )}
            </div>
          </div>

          {/* Facultad */}
          <div className="flex items-center gap-6">
            <label className="w-32 text-right text-sm text-gray-900">
              Facultad *
            </label>
            <div className="flex-1 relative dropdown-container">
              <div
                onClick={() => setIsFacultyDropdownOpen(!isFacultyDropdownOpen)}
                className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer flex items-center justify-between ${
                  errors.facultadId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <span className={selectedFaculty ? 'text-gray-900' : 'text-gray-400'}>
                  {selectedFaculty ? `${selectedFaculty.codigo} - ${selectedFaculty.nombre}` : 'Buscar una facultad'}
                </span>
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              
              {facultiesLoading && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                  <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                </div>
              )}
              
              {isFacultyDropdownOpen && (
                <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                  {/* Search input */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar facultad..."
                        value={facultySearchTerm}
                        onChange={(e) => setFacultySearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  
                  {/* Faculty list */}
                  <div className="max-h-48 overflow-y-auto">
                    {faculties
                      .filter(faculty => 
                        faculty.codigo.toLowerCase().includes(facultySearchTerm.toLowerCase()) ||
                        faculty.nombre.toLowerCase().includes(facultySearchTerm.toLowerCase())
                      )
                      .map((faculty) => (
                        <div
                          key={faculty.id}
                          onClick={() => {
                            handleInputChange('facultadId', faculty.id || 0);
                            setIsFacultyDropdownOpen(false);
                            setFacultySearchTerm('');
                          }}
                          className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-900 flex items-center justify-between"
                        >
                          <span>{faculty.codigo} - {faculty.nombre}</span>
                          <div className={`w-4 h-4 border border-gray-300 rounded flex items-center justify-center ${
                            formData.facultadId === faculty.id ? 'bg-blue-600 border-blue-600' : 'bg-white'
                          }`}>
                            {formData.facultadId === faculty.id && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
              {errors.facultadId && (
                <p className="mt-1 text-sm text-red-600">{errors.facultadId}</p>
              )}
            </div>
          </div>

          {/* Coordinador */}
          <div className="flex items-center gap-6">
            <label className="w-32 text-right text-sm text-gray-900">
              Coordinador *
            </label>
            <div className="flex-1 relative dropdown-container">
              <div
                onClick={() => setIsCoordinatorDropdownOpen(!isCoordinatorDropdownOpen)}
                className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer flex items-center justify-between ${
                  errors.coordinadorId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <span className={selectedCoordinator ? 'text-gray-900' : 'text-gray-400'}>
                  {selectedCoordinator ? `${selectedCoordinator.nombres} ${selectedCoordinator.apellidos}` : 'Buscar un coordinador'}
                </span>
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              
              {professorsLoading && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                  <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                </div>
              )}
              
              {isCoordinatorDropdownOpen && (
                <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                  {/* Search input */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar coordinador..."
                        value={coordinatorSearchTerm}
                        onChange={(e) => setCoordinatorSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  
                  {/* Coordinators list */}
                  <div className="max-h-48 overflow-y-auto">
                    {professors
                      .filter(professor => 
                        professor.nombres.toLowerCase().includes(coordinatorSearchTerm.toLowerCase()) ||
                        professor.apellidos.toLowerCase().includes(coordinatorSearchTerm.toLowerCase()) ||
                        professor.correo.toLowerCase().includes(coordinatorSearchTerm.toLowerCase())
                      )
                      .map((professor) => (
                        <div
                          key={professor.id}
                          onClick={() => {
                            handleInputChange('coordinadorId', professor.id || 0);
                            setIsCoordinatorDropdownOpen(false);
                            setCoordinatorSearchTerm('');
                          }}
                          className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-900 flex items-center justify-between"
                        >
                          <div>
                            <div>{professor.nombres} {professor.apellidos}</div>
                            <div className="text-xs text-gray-500">{professor.correo}</div>
                          </div>
                          <div className={`w-4 h-4 border border-gray-300 rounded flex items-center justify-center ${
                            formData.coordinadorId === professor.id ? 'bg-blue-600 border-blue-600' : 'bg-white'
                          }`}>
                            {formData.coordinadorId === professor.id && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
              {errors.coordinadorId && (
                <p className="mt-1 text-sm text-red-600">{errors.coordinadorId}</p>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-4 bg-white rounded-b-lg flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg 
                  className="animate-spin h-4 w-4 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}