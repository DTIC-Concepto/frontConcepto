"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { LearningOutcomesService, CreateLearningOutcomeRequest, LEARNING_OUTCOME_TYPES } from "@/lib/learning-outcomes";
import { UserCareerService } from "@/lib/user-career";
import NotificationService from "@/lib/notifications";

interface NewLearningOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOutcomeCreated: () => void;
}

export default function NewLearningOutcomeModal({
  isOpen,
  onClose,
  onOutcomeCreated,
}: NewLearningOutcomeModalProps) {
  const [formData, setFormData] = useState({
    codigo: "",
    descripcion: "",
    tipo: "GENERAL" as "GENERAL" | "ESPECIFICO",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = () => {
    setFormData({
      codigo: "",
      descripcion: "",
      tipo: "GENERAL",
    });
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // TODO: Hacer dinámico en el futuro - por ahora hardcodeado
      const carreraId = 1;

      // Validar campos
      const errors = LearningOutcomesService.validateLearningOutcome({
        ...formData,
        carreraId
      });

      if (errors.length > 0) {
        NotificationService.warning(
          'Datos inválidos',
          errors.join(', ')
        );
        return;
      }

      const outcomeData: CreateLearningOutcomeRequest = {
        ...formData,
        carreraId
      };

      console.log('Creando resultado de aprendizaje con datos:', outcomeData);
      await LearningOutcomesService.createLearningOutcome(outcomeData);

      NotificationService.success(
        'Resultado creado',
        `El resultado de aprendizaje ${formData.codigo} ha sido creado exitosamente.`
      );

      handleCancel();
      onOutcomeCreated();
    } catch (error) {
      console.error('Error creando resultado:', error);
      NotificationService.error(
        'Error al crear resultado',
        error instanceof Error ? error.message : 'Ha ocurrido un error inesperado'
      );
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
              Agregar Resultado de Aprendizaje
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
              placeholder="RAXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent font-open-sans"
              disabled={isLoading}
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-open-sans">
              Tipo *
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value as "GENERAL" | "ESPECIFICO" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent font-open-sans"
              disabled={isLoading}
            >
              {LEARNING_OUTCOME_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-open-sans">
              Descripción *
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción detallada del resultado de aprendizaje..."
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
            {isLoading ? 'Creando...' : 'Crear Resultado'}
          </button>
        </div>
      </div>
    </div>
  );
}