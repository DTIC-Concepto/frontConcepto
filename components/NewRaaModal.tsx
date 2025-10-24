"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { RaaService, CreateRaaRequest, RAA_TYPES } from "@/lib/raa";
import NotificationService from "@/lib/notifications";

interface NewRaaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRaaCreated: () => void;
  asignaturaId: number;
}

export default function NewRaaModal({
  isOpen,
  onClose,
  onRaaCreated,
  asignaturaId,
}: NewRaaModalProps) {
  const [formData, setFormData] = useState({
    codigo: "",
    tipo: "" as "" | "Conocimientos" | "Destrezas" | "Valores y actitudes",
    descripcion: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = () => {
    setFormData({
      codigo: "",
      tipo: "",
      descripcion: "",
    });
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (!asignaturaId) {
        NotificationService.error(
          'Error',
          'No se encontró el ID de la asignatura.'
        );
        return;
      }

      const errors = RaaService.validateRaa({
        ...formData,
        asignaturaId,
        estadoActivo: true
      } as CreateRaaRequest);

      if (errors.length > 0) {
        NotificationService.warning(
          'Datos inválidos',
          errors.join(', ')
        );
        return;
      }

      const raaData: CreateRaaRequest = {
        codigo: formData.codigo.trim(),
        tipo: formData.tipo as "Conocimientos" | "Destrezas" | "Valores y actitudes",
        descripcion: formData.descripcion.trim(),
        asignaturaId,
        estadoActivo: true
      };

      await RaaService.createRaa(raaData);

      NotificationService.success(
        'RAA creado',
        `El resultado de aprendizaje ${formData.codigo} ha sido creado exitosamente.`
      );

      handleCancel();
      onRaaCreated();
    } catch (error) {
      console.error('Error creando RAA:', error);
      NotificationService.error(
        'Error al crear RAA',
        error instanceof Error ? error.message : 'Ha ocurrido un error inesperado'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleCancel}
      />
      
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh]" style={{ zIndex: 10000 }}>
        <div className="px-6 pt-6 pb-4 border-b border-[#DEE1E6]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[#171A1F] font-montserrat">
                Resultado de Aprendizaje (RAA)
              </h2>
              <p className="mt-1 text-sm text-[#565D6D] font-open-sans">
                Asegúrese de que el código sea único y la descripción sea clara.
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

        <div className="px-6 py-6 space-y-5 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center gap-4">
            <label className="w-28 text-right text-sm text-[#171A1F] font-open-sans">
              Código<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              placeholder="Ej: 1.1"
              className="flex-1 px-3 py-2 rounded-md border border-[#DEE1E6] bg-white text-[#171A1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] shadow-sm placeholder-gray-400"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-28 text-right text-sm text-[#171A1F] font-open-sans">
              Tipo<span className="text-red-500">*</span>
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
              className="flex-1 px-3 py-2 rounded-md border border-[#DEE1E6] bg-white text-[#171A1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] shadow-sm appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23565D6D' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
              disabled={isLoading}
            >
              <option value="" className="text-[#565D6D]">Seleccionar tipo...</option>
              {RAA_TYPES.map((type) => (
                <option key={type.value} value={type.value} className="text-[#171A1F] py-2">
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-start gap-4">
            <label className="w-28 text-right text-sm text-[#171A1F] font-open-sans pt-2">
              Descripción<span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción detallada del resultado de aprendizaje..."
              rows={4}
              className="flex-1 px-3 py-2 rounded-md border border-[#DEE1E6] bg-white text-[#171A1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] shadow-sm placeholder-gray-400 resize-none"
              disabled={isLoading}
            />
          </div>
        </div>

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
            disabled={isLoading || !formData.codigo.trim() || !formData.tipo || !formData.descripcion.trim()}
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
