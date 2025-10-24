import { X, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface EditRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  raaText?: string;
  raText?: string;
  nivelAporte?: string;
  justificacion?: string;
  onSave?: (data: { nivelAporte: string; justificacion: string }) => void;
  onDelete?: () => void;
}

export function EditRelationshipModal({
  isOpen,
  onClose,
  raaText = "Aplicar teorías, metodologías, estándares y tecnologías apropiadas, para crear soluciones de software, mediante el análisis, diseño, desarrollo, implementación, verificación, documentación y gestión.",
  raText = "Aplicar teorías, metodologías, estándares y tecnologías apropiadas, para crear soluciones de software, mediante el análisis, diseño, desarrollo, implementación, verificación, documentación y gestión.",
  nivelAporte = "Alto",
  justificacion = "Comprender los conceptos fundamentales para diseñar e implementar aplicaciones web de características avanzadas con características de rendimiento y seguridad.",
  onSave,
  onDelete,
}: EditRelationshipModalProps) {
  const [selectedNivel, setSelectedNivel] = useState(nivelAporte);
  const [justificacionText, setJustificacionText] = useState(justificacion);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave?.({ nivelAporte: selectedNivel, justificacion: justificacionText });
    onClose();
  };

  const handleDelete = () => {
    onDelete?.();
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-[600px] bg-white rounded-[10px] shadow-[0_0_2px_0_rgba(23,26,31,0.08),0_0_1px_0_rgba(23,26,31,0.05)]">
          {/* Header */}
          <div className="h-[60px] bg-blue-600 rounded-t-[10px] flex items-center justify-between px-4">
            <h2 className="text-[20px] font-bold text-white leading-[28px] font-roboto">
              Editar la relación
            </h2>
            <button
              onClick={onClose}
              className="w-[18px] h-[18px] flex items-center justify-center hover:opacity-80 transition-opacity"
              aria-label="Cerrar"
            >
              <X className="w-[18px] h-[18px] text-[#A9CED6]" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pt-[27px] pb-6">
            {/* Title */}
            <h3 className="text-[18px] font-bold text-gray-900 mb-[13px] leading-[28px] font-roboto">
              Resultados de aprendizaje
            </h3>

            {/* RAA Section */}
            <div className="mb-6">
              <label className="block text-[12px] text-gray-900 mb-[14px] leading-[20px] font-roboto">
                Resultado de aprendizaje de asignatura:
              </label>
              <div className="text-[14px] text-gray-500 leading-[22px] font-roboto">
                {raaText}
              </div>
            </div>

            {/* RA Section */}
            <div className="mb-6">
              <label className="block text-[12px] text-gray-900 mb-[14px] leading-[20px] font-roboto">
                Resultado de aprendizaje de carrera:
              </label>
              <div className="text-[14px] text-gray-500 leading-[22px] font-roboto bg-white rounded-md py-0">
                {raText}
              </div>
            </div>

            {/* Nivel de aporte */}
            <div className="mb-6">
              <label className="block text-[14px] text-gray-900 mb-[21px] leading-[14px] font-roboto">
                Nivel de aporte
              </label>
              <div className="relative w-[276px]">
                <select
                  className="w-full h-[39px] px-3 pr-10 rounded-md border border-[#DEE1E6] text-[14px] text-gray-900 leading-[22px] font-opensans appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
                  value={selectedNivel}
                  onChange={(e) => setSelectedNivel(e.target.value)}
                >
                  <option value="Alto">Alto</option>
                  <option value="Medio">Medio</option>
                  <option value="Bajo">Bajo</option>
                </select>
                <svg
                  className="absolute right-[5.25px] top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.5462 5.51655C11.8078 5.2549 12.232 5.2549 12.4936 5.51655C12.7553 5.7782 12.7553 6.20232 12.4936 6.46397L8.47359 10.484C8.21195 10.7456 7.78784 10.7456 7.52621 10.484L3.50619 6.46397L3.46039 6.41294C3.24576 6.14978 3.26089 5.76185 3.50619 5.51655C3.75149 5.27125 4.13942 5.25612 4.40258 5.47075L4.45361 5.51655L7.9999 9.06285L11.5462 5.51655Z"
                    fill="#565D6D"
                  />
                </svg>
              </div>
            </div>

            {/* Justificación */}
            <div className="mb-4">
              <label className="block text-[14px] text-gray-900 mb-[14px] leading-[14px] font-roboto">
                Justificación
              </label>
              <div className="relative">
                <textarea
                  className="w-full h-[99px] px-3 py-2 rounded-md border border-[#DEE1E6] text-[14px] text-gray-900 leading-[22px] font-roboto resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
                  value={justificacionText}
                  onChange={(e) => setJustificacionText(e.target.value)}
                  maxLength={500}
                />
                <svg
                  className="absolute right-[2px] bottom-[2px] w-3 h-3 pointer-events-none"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_resize)">
                    <path
                      d="M13.9397 11.167L0.740417 11.167C0.219718 11.167 -0.202393 11.5891 -0.202393 12.1098V12.1098C-0.202393 12.6305 0.219718 13.0526 0.740417 13.0526L13.9397 13.0526C14.4604 13.0526 14.8825 12.6305 14.8825 12.1098C14.8825 11.5891 14.4604 11.167 13.9397 11.167Z"
                      fill="#DEE1E6"
                    />
                    <path
                      d="M11.7286 11.167L6.07172 11.167C5.55102 11.167 5.12891 11.5891 5.12891 12.1098V12.1098C5.12891 12.6305 5.55102 13.0526 6.07172 13.0526L11.7286 13.0526C12.2493 13.0526 12.6714 12.6305 12.6714 12.1098C12.6714 11.5891 12.2493 11.167 11.7286 11.167Z"
                      fill="#DEE1E6"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_resize">
                      <rect width="12" height="12" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <p className="text-[14px] text-gray-500 mt-[11px] leading-[20px] font-roboto">
                Máximo: 500 caracteres
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="h-[73px] border-t border-[#DEE1E6] px-6 flex items-center justify-end gap-[7px]">
            <button
              onClick={handleDelete}
              className="inline-flex h-10 px-4 items-center justify-center gap-4 rounded-md bg-destructive hover:bg-destructive/90 text-white text-[14px] leading-[22px] font-roboto transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
            <button
              onClick={handleSave}
              className="inline-flex h-10 px-4 items-center justify-center gap-4 rounded-md bg-blue-600 hover:bg-blue-600/90 text-white text-[14px] leading-[22px] font-roboto transition-colors"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
