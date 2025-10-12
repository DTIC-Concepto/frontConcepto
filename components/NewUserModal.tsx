'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Search, Check } from 'lucide-react';
import { VALID_ROLES, ROLE_DISPLAY_NAMES, RoleType, Faculty } from '@/lib/api';
import { UsersService } from '@/lib/users';
import { FacultiesService } from '@/lib/faculties';
import NotificationService from '@/lib/notifications';

interface RoleSelection {
  rol: RoleType;
  observaciones: string;
}

interface CreateMultiRoleUserRequest {
  nombres: string;
  apellidos: string;
  cedula: string;
  correo: string;
  contrasena: string;
  rolPrincipal: RoleType;
  roles: RoleSelection[];
  facultadId: number;
  estadoActivo: boolean;
  asignadoPor: string;
}

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void; // Callback para refrescar la lista
}

export default function NewUserModal({ isOpen, onClose, onUserCreated }: NewUserModalProps) {
  const [formData, setFormData] = useState<CreateMultiRoleUserRequest>({
    nombres: '',
    apellidos: '',
    cedula: '',
    correo: '',
    contrasena: '',
    rolPrincipal: '' as RoleType,
    roles: [],
    facultadId: 0,
    estadoActivo: true,
    asignadoPor: 'admin@universidad.edu'
  });

  const [selectedRoles, setSelectedRoles] = useState<Set<RoleType>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [facultiesLoading, setFacultiesLoading] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isFacultyDropdownOpen, setIsFacultyDropdownOpen] = useState(false);
  const [facultySearchTerm, setFacultySearchTerm] = useState('');

  // Load faculties when modal opens
  useEffect(() => {
    if (isOpen) {
      loadFaculties();
    }
  }, [isOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsRoleDropdownOpen(false);
        setIsFacultyDropdownOpen(false);
      }
    };

    if (isRoleDropdownOpen || isFacultyDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isRoleDropdownOpen, isFacultyDropdownOpen]);

  const loadFaculties = async () => {
    try {
      setFacultiesLoading(true);
      const facultiesData = await FacultiesService.getAllFaculties({ estadoActivo: true });
      setFaculties(facultiesData);
    } catch (error) {
      console.error('Error loading faculties:', error);
      NotificationService.error(
        'Error al cargar facultades',
        'No se pudieron cargar las facultades disponibles'
      );
    } finally {
      setFacultiesLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'facultadId' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleRoleToggle = (role: RoleType) => {
    const newSelectedRoles = new Set(selectedRoles);
    
    if (newSelectedRoles.has(role)) {
      newSelectedRoles.delete(role);
    } else {
      newSelectedRoles.add(role);
    }
    
    setSelectedRoles(newSelectedRoles);
    
    // Establecer el primer rol seleccionado como principal
    const rolesArray = Array.from(newSelectedRoles);
    if (rolesArray.length > 0) {
      setFormData(prev => ({ 
        ...prev, 
        rolPrincipal: rolesArray[0],
        roles: rolesArray.map(roleName => ({
          rol: roleName,
          observaciones: `Rol asignado: ${ROLE_DISPLAY_NAMES[roleName]}`
        }))
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        rolPrincipal: '' as RoleType,
        roles: []
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Validar que se haya seleccionado al menos un rol
      if (selectedRoles.size === 0) {
        NotificationService.warning(
          'Datos inválidos',
          'Debe seleccionar al menos un rol'
        );
        return;
      }

      // Validar formato básico de cédula (solo números y longitud apropiada)
      if (!/^\d{8,11}$/.test(formData.cedula)) {
        NotificationService.warning(
          'Cédula inválida',
          'La cédula debe contener entre 8 y 11 dígitos numéricos'
        );
        return;
      }

      // Validar formato de correo electrónico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.correo)) {
        NotificationService.warning(
          'Correo inválido',
          'Por favor, ingresa un correo electrónico válido'
        );
        return;
      }

      // Validar que todos los campos requeridos estén llenos
      if (!formData.nombres || !formData.apellidos || !formData.cedula || 
          !formData.correo || !formData.contrasena || !formData.rolPrincipal || !formData.facultadId) {
        NotificationService.warning(
          'Datos inválidos',
          'Todos los campos marcados con * son obligatorios'
        );
        return;
      }

      // Crear usuario usando el nuevo endpoint
      const response = await fetch('/api/usuarios/multi-rol', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Error al crear usuario';
        
        // Mostrar error específico según el tipo
        if (errorMessage.toLowerCase().includes('cédula')) {
          NotificationService.error(
            'Cédula duplicada',
            'Ya existe un usuario registrado con esta cédula. Por favor, verifica el número de cédula.'
          );
        } else if (errorMessage.toLowerCase().includes('correo') || errorMessage.toLowerCase().includes('email')) {
          NotificationService.error(
            'Correo duplicado',
            'Ya existe un usuario registrado con este correo electrónico.'
          );
        } else {
          NotificationService.error(
            'Error al crear usuario',
            errorMessage
          );
        }
        return;
      }

      NotificationService.success(
        'Usuario creado',
        `El usuario ${formData.nombres} ${formData.apellidos} ha sido creado exitosamente.`
      );

      handleCancel();
      onUserCreated(); // Refrescar la lista
    } catch (error) {
      console.error('Error creando usuario:', error);
      // Solo mostrar notificación si no se manejó específicamente antes
      if (error instanceof Error && !error.message.includes('Ya existe')) {
        NotificationService.error(
          'Error inesperado',
          'Ha ocurrido un error inesperado al crear el usuario. Por favor, inténtalo de nuevo.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      cedula: '',
      correo: '',
      contrasena: '',
      rolPrincipal: '' as RoleType,
      roles: [],
      facultadId: 0,
      estadoActivo: true,
      asignadoPor: 'admin@universidad.edu'
    });
    setSelectedRoles(new Set());
    setIsRoleDropdownOpen(false);
    setIsFacultyDropdownOpen(false);
    setFacultySearchTerm('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleCancel}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh]" style={{ zIndex: 10000 }}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#DEE1E6]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[#171A1F] font-montserrat">
                Nuevo Usuario
              </h2>
              <p className="mt-1 text-sm text-[#565D6D] font-open-sans">
                Completa los detalles del usuario. Haz clic en guardar cuando hayas terminado.
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-[#565D6D] hover:text-[#171A1F] transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Nombres */}
          <div className="flex items-center gap-4">
            <label className="w-28 text-right text-sm text-[#171A1F] font-open-sans">
              Nombres<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 rounded-md border border-[#DEE1E6] bg-white text-[#171A1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] shadow-sm"
              placeholder="Ej: Juan Carlos"
            />
          </div>

          {/* Apellidos */}
          <div className="flex items-center gap-4">
            <label className="w-28 text-right text-sm text-[#171A1F] font-open-sans">
              Apellidos<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 rounded-md border border-[#DEE1E6] bg-white text-[#171A1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] shadow-sm"
              placeholder="Ej: Pérez González"
            />
          </div>

          {/* Cédula */}
          <div className="flex items-center gap-4">
            <label className="w-28 text-right text-sm text-[#171A1F] font-open-sans">
              Cédula<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleInputChange}
              maxLength={10}
              className="flex-1 px-3 py-2 rounded-md border border-[#DEE1E6] bg-white text-[#171A1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] shadow-sm"
              placeholder="1234567890"
            />
          </div>

          {/* Email */}
          <div className="flex items-center gap-4">
            <label className="w-28 text-right text-sm text-[#171A1F] font-open-sans">
              Correo<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 rounded-md border border-[#DEE1E6] bg-white text-[#171A1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] shadow-sm"
              placeholder="usuario@epn.edu.ec"
            />
          </div>

          {/* Contraseña */}
          <div className="flex items-center gap-4">
            <label className="w-28 text-right text-sm text-[#171A1F] font-open-sans">
              Contraseña<span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 rounded-md border border-[#DEE1E6] bg-white text-[#171A1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] shadow-sm"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {/* Rol */}
          <div className="flex items-center gap-4">
            <label className="w-28 text-right text-sm text-[#171A1F] font-open-sans">
              Rol<span className="text-red-500">*</span>
            </label>
            <div className="flex-1 relative dropdown-container">
              <div
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="w-full px-3 py-2 rounded-md border border-[#DEE1E6] bg-white text-[#171A1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] shadow-sm cursor-pointer flex items-center justify-between"
              >
                <span className={selectedRoles.size > 0 ? 'text-[#171A1F]' : 'text-[#565D6D]'}>
                  {selectedRoles.size > 0 
                    ? `${selectedRoles.size} rol${selectedRoles.size > 1 ? 'es' : ''} seleccionado${selectedRoles.size > 1 ? 's' : ''}`
                    : 'Seleccionar roles...'
                  }
                </span>
                <div className="flex flex-col items-center">
                  <ChevronUp className="w-3 h-3 text-[#565D6D]" />
                  <ChevronDown className="w-3 h-3 text-[#565D6D] -mt-0.5" />
                </div>
              </div>
              
              {isRoleDropdownOpen && (
                <div className="absolute z-[9999] w-full mt-1 bg-white border border-[#DEE1E6] rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {VALID_ROLES.map((role) => (
                    <div
                      key={role}
                      onClick={() => handleRoleToggle(role)}
                      className="px-3 py-2 hover:bg-[#F3F4F6] cursor-pointer text-sm text-[#171A1F] flex items-center justify-between"
                    >
                      <span>{ROLE_DISPLAY_NAMES[role]}</span>
                      <div className={`w-4 h-4 border border-[#DEE1E6] rounded flex items-center justify-center ${
                        selectedRoles.has(role) ? 'bg-[#003366] border-[#003366]' : 'bg-white'
                      }`}>
                        {selectedRoles.has(role) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Facultad */}
          <div className="flex items-center gap-4">
            <label className="w-28 text-right text-sm text-[#171A1F] font-open-sans">
              Facultad<span className="text-red-500">*</span>
            </label>
            <div className="flex-1 relative dropdown-container">
              <div
                onClick={() => setIsFacultyDropdownOpen(!isFacultyDropdownOpen)}
                className="w-full px-3 py-2 rounded-md border border-[#DEE1E6] bg-white text-[#171A1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] shadow-sm cursor-pointer flex items-center justify-between"
              >
                <span className={formData.facultadId ? 'text-[#171A1F]' : 'text-[#565D6D]'}>
                  {formData.facultadId 
                    ? `${faculties.find(f => f.id === formData.facultadId)?.codigo} - ${faculties.find(f => f.id === formData.facultadId)?.nombre}`
                    : 'Seleccionar facultad...'
                  }
                </span>
                <Search className="w-4 h-4 text-[#565D6D]" />
              </div>
              
              {facultiesLoading && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                  <svg className="animate-spin h-4 w-4 text-[#565D6D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                </div>
              )}
              
              {isFacultyDropdownOpen && (
                <div className="absolute z-[9999] w-full mt-1 bg-white border border-[#DEE1E6] rounded-md shadow-lg max-h-60 overflow-hidden">
                  {/* Search input */}
                  <div className="p-3 border-b border-[#DEE1E6]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#565D6D]" />
                      <input
                        type="text"
                        placeholder="Buscar facultad..."
                        value={facultySearchTerm}
                        onChange={(e) => setFacultySearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-[#DEE1E6] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
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
                            setFormData(prev => ({ ...prev, facultadId: faculty.id || 0 }));
                            setIsFacultyDropdownOpen(false);
                            setFacultySearchTerm('');
                          }}
                          className="px-3 py-2 hover:bg-[#F3F4F6] cursor-pointer text-sm text-[#171A1F] flex items-center justify-between"
                        >
                          <span>{faculty.codigo} - {faculty.nombre}</span>
                          <div className={`w-4 h-4 border border-[#DEE1E6] rounded flex items-center justify-center ${
                            formData.facultadId === faculty.id ? 'bg-[#003366] border-[#003366]' : 'bg-white'
                          }`}>
                            {formData.facultadId === faculty.id && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      ))
                    }
                    {faculties.filter(faculty => 
                      faculty.codigo.toLowerCase().includes(facultySearchTerm.toLowerCase()) ||
                      faculty.nombre.toLowerCase().includes(facultySearchTerm.toLowerCase())
                    ).length === 0 && (
                      <div className="px-3 py-2 text-sm text-[#565D6D] text-center">
                        No se encontraron facultades
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F8F9FA] rounded-b-lg flex justify-end gap-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-6 py-2 border border-[#DEE1E6] rounded-md text-[#171A1F] hover:bg-gray-50 transition-colors font-medium font-open-sans text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-[#003366] text-white rounded-md hover:bg-[#003366]/90 transition-colors font-medium font-open-sans text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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