"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { CreateFacultyRequest } from "@/lib/api";
import { FacultiesService } from "@/lib/faculties";
import NotificationService from "@/lib/notifications";

interface NewFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewFacultyModal({ isOpen, onClose, onSuccess }: NewFacultyModalProps) {
  const [formData, setFormData] = useState<CreateFacultyRequest>({
    codigo: "",
    nombre: "",
    descripcion: "",
    estadoActivo: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<CreateFacultyRequest>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateFacultyRequest> = {};
    
    if (!formData.codigo.trim()) {
      newErrors.codigo = "El código es requerido";
    } else if (formData.codigo.length < 2 || formData.codigo.length > 10) {
      newErrors.codigo = "El código debe tener entre 2 y 10 caracteres";
    }
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (formData.nombre.length < 3 || formData.nombre.length > 200) {
      newErrors.nombre = "El nombre debe tener entre 3 y 200 caracteres";
    }
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción es requerida";
    } else if (formData.descripcion.length < 10 || formData.descripcion.length > 500) {
      newErrors.descripcion = "La descripción debe tener entre 10 y 500 caracteres";
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
      await FacultiesService.createFaculty(formData);
      
      NotificationService.success(
        'Facultad creada',
        'La facultad ha sido creada exitosamente'
      );
      
      // Resetear formulario
      setFormData({
        codigo: "",
        nombre: "",
        descripcion: "",
        estadoActivo: true
      });
      setErrors({});
      
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Error al crear facultad:', error);
      NotificationService.error(
        'Error al crear facultad',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateFacultyRequest, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        codigo: "",
        nombre: "",
        descripcion: "",
        estadoActivo: true
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nueva Facultad</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Código */}
          <div>
            <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
              Código *
            </label>
            <input
              type="text"
              id="codigo"
              value={formData.codigo}
              onChange={(e) => handleInputChange('codigo', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.codigo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: FIEE, FICM"
              disabled={isLoading}
              maxLength={10}
            />
            {errors.codigo && (
              <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nombre completo de la facultad"
              disabled={isLoading}
              maxLength={200}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                errors.descripcion ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Descripción detallada de la facultad"
              disabled={isLoading}
              maxLength={500}
            />
            {errors.descripcion && (
              <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.descripcion.length}/500 caracteres
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#003366] border border-transparent rounded-md hover:bg-[#003366]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creando...' : 'Crear Facultad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}