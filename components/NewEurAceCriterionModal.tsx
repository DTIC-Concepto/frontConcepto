"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { EurAceCriteriaService, CreateEurAceCriterionRequest } from "@/lib/eur-ace-criteria";
import NotificationService from "@/lib/notifications";

interface NewEurAceCriterionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCriterionCreated: () => void;
}

export default function NewEurAceCriterionModal({
  isOpen,
  onClose,
  onCriterionCreated,
}: NewEurAceCriterionModalProps) {
  const [formData, setFormData] = useState({
    codigo: "",
    descripcion: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = () => {
    setFormData({
      codigo: "",
      descripcion: "",
    });
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Validar campos
      const errors = EurAceCriteriaService.validateCriterion(formData);

      if (errors.length > 0) {
        NotificationService.warning(
          'Datos inválidos',
          errors.join(', ')
        );
        return;
      }

      const criterionData: CreateEurAceCriterionRequest = {
        ...formData
      };

      await EurAceCriteriaService.createEurAceCriterion(criterionData);

      NotificationService.success(
        'Criterio creado',
        `El criterio EUR-ACE ${formData.codigo} ha sido creado exitosamente.`
      );

      handleCancel();
      onCriterionCreated();
    } catch (error) {
      console.error('Error creando criterio:', error);
      
      let errorMessage = 'Ha ocurrido un error inesperado';
      let errorTitle = 'Error al crear criterio';
      
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('conflict') || error.message.includes('409')) {
          errorTitle = 'Criterio duplicado';
          errorMessage = `El código ${formData.codigo} ya existe. Por favor, utiliza un código diferente.`;
        } else if (error.message.toLowerCase().includes('forbidden') || error.message.includes('403')) {
          errorTitle = 'Sin permisos';
          errorMessage = 'No tienes permisos para crear criterios EUR-ACE.';
        } else if (error.message.toLowerCase().includes('unauthorized') || error.message.includes('401')) {
          errorTitle = 'Sesión expirada';
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        } else {
          errorMessage = error.message;
        }
      }
      
      NotificationService.error(errorTitle, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 font-montserrat">
              Agregar Criterio EUR-ACE
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-open-sans">
              Asegúrese de que el código sea único y la descripción clara.
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Código */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-open-sans">
              Código *
            </label>
            <input
              type="text"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              placeholder="5.4.6"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent font-open-sans"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1 font-open-sans">
              Formato: X.X.X (ejemplo: 5.4.6)
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-open-sans">
              Descripción *
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción del criterio EUR-ACE..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent font-open-sans resize-none"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003366] disabled:opacity-50 disabled:cursor-not-allowed font-open-sans"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !formData.codigo.trim() || !formData.descripcion.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-[#003366] border border-transparent rounded-md shadow-sm hover:bg-[#004080] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003366] disabled:opacity-50 disabled:cursor-not-allowed font-open-sans"
          >
            {isLoading ? 'Creando...' : 'Crear Criterio'}
          </button>
        </div>
      </div>
    </div>
  );
}