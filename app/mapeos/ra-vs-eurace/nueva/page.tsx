'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { X, Save, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { type EurAceCriterion } from "@/lib/eur-ace-criteria";
import { type LearningOutcome } from "@/lib/learning-outcomes";
import { MappingsService } from "@/lib/mappings";
import NotificationService from "@/lib/notifications";

export default function JustificarRelacion() {
  const router = useRouter();
  const [selectedEURACE, setSelectedEURACE] = useState<EurAceCriterion | null>(null);
  const [selectedRA, setSelectedRA] = useState<LearningOutcome | null>(null);
  const [justification, setJustification] = useState('');
  const [currentStep, setCurrentStep] = useState(3);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar las selecciones de los pasos anteriores
  useEffect(() => {
    const storedEURACE = localStorage.getItem('selectedEURACE');
    const storedRA = localStorage.getItem('selectedRA');
    
    if (storedEURACE) {
      setSelectedEURACE(JSON.parse(storedEURACE));
    }
    
    if (storedRA) {
      setSelectedRA(JSON.parse(storedRA));
    }
    
    // Si falta alguna selección, redirigir al inicio del wizard
    if (!storedEURACE || !storedRA) {
      router.push('/mapeos/ra-vs-eurace/seleccion');
    }
  }, [router]);

  const canSave = justification.trim().length >= 10 && !saving;

  const handleSave = async () => {
    if (!canSave || !selectedEURACE || !selectedRA) return;

    try {
      setSaving(true);
      setError(null);

      // Crear la relación usando el servicio de mappings
      const result = await MappingsService.createEurAceMapping({
        resultadoAprendizajeId: selectedRA.id!,
        eurAceId: selectedEURACE.id!,
        justificacion: justification.trim()
      });

      if (result.success) {
        // Limpiar localStorage
        localStorage.removeItem('selectedEURACE');
        localStorage.removeItem('selectedRA');
        
        // Mostrar notificación de éxito
        NotificationService.success(
          'Relación creada exitosamente',
          `Se ha establecido la relación entre ${selectedRA.codigo} y ${selectedEURACE.codigo}`
        );
        
        // Recargar datos de la matriz si está disponible
        if ((window as any).reloadEurAceMatrix) {
          (window as any).reloadEurAceMatrix();
        }
        
        // Redirigir de vuelta a la matriz
        router.push('/mapeos/ra-vs-eurace');
      } else {
        // Mostrar error como notificación, no crash
        NotificationService.error(
          'Error al crear la relación',
          result.error || 'Error desconocido al crear la relación'
        );
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      NotificationService.error(
        'Error de conexión',
        'Error de conexión con el servidor'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Limpiar localStorage
    localStorage.removeItem('selectedEURACE');
    localStorage.removeItem('selectedRA');
    router.push('/mapeos/ra-vs-eurace');
  };

  return (
    <AcademicRoute>
      <Layout>
        <div className="p-8 space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-[#171A1F] font-montserrat">
              Matriz: Resultados de Aprendizaje (RA) y Criterios EUR-ACE
            </h1>
          </div>

          {/* Steps Indicator */}
          <div className="flex items-center justify-center gap-16">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#003366] border-2 border-gray-300 flex items-center justify-center">
                <span className="text-white font-medium font-open-sans">1</span>
              </div>
              <span className="text-sm text-[#565D6D] mt-2 font-open-sans">Seleccionar</span>
              <span className="text-sm text-[#565D6D] font-open-sans">Criterios EUR-ACE</span>
            </div>

            <div className="w-32 h-0.5 bg-gray-400" />

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#003366] border-2 border-gray-300 flex items-center justify-center">
                <span className="text-white font-medium font-open-sans">2</span>
              </div>
              <span className="text-sm text-[#565D6D] mt-2 font-open-sans">Seleccionar</span>
              <span className="text-sm text-[#565D6D] font-open-sans">Resultados de Aprendizaje (RA)</span>
            </div>

            <div className="w-32 h-0.5 bg-gray-400" />

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#003366] flex items-center justify-center">
                <span className="text-white font-medium font-open-sans">3</span>
              </div>
              <span className="text-sm text-[#565D6D] mt-2 font-open-sans">Justificar Relación</span>
            </div>
          </div>

          {/* Selected Elements */}
          <div className="bg-white rounded-lg border border-[#DEE1E6] p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#171A1F] font-montserrat">Elementos Seleccionados:</h2>

            <div className="space-y-3">
              {selectedEURACE && (
                <div>
                  <h3 className="text-sm font-semibold text-[#171A1F] mb-1 font-open-sans">Criterio EUR-ACE ({selectedEURACE.codigo}):</h3>
                  <p className="text-sm text-[#565D6D] font-open-sans">
                    {selectedEURACE.descripcion}
                  </p>
                </div>
              )}

              {selectedRA && (
                <div>
                  <h3 className="text-sm font-semibold text-[#171A1F] mb-1 font-open-sans">Resultado de aprendizaje ({selectedRA.codigo}):</h3>
                  <p className="text-sm text-[#565D6D] font-open-sans">
                    {selectedRA.descripcion}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-open-sans">{error}</p>
            </div>
          )}

          {/* Justification Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#171A1F] font-montserrat">Justifique la relación de RA vs EUR-ACE</h2>

            <div>
              <label className="block text-sm text-[#565D6D] mb-2 font-open-sans">Justificación:</label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Escriba la justificación detallada aquí para la relación entre el Resultado de Aprendizaje y el Criterio EUR-ACE seleccionados."
                disabled={saving}
                className="w-full h-32 px-4 py-3 border border-[#DEE1E6] rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] font-open-sans text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-[#565D6D] mt-1 font-open-sans">
                Mínimo 10 caracteres ({justification.length}/10)
              </p>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => router.push('/mapeos/ra-vs-eurace/seleccion-ra')}
              className="flex items-center gap-1 text-[#171A1F] hover:text-[#565D6D] font-open-sans text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => (
                <button
                  key={step}
                  className={`w-8 h-8 rounded text-sm font-medium font-open-sans ${
                    currentStep === step
                      ? 'bg-[#171A1F] text-white'
                      : 'text-[#171A1F] hover:bg-[#F3F4F6]'
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>

            <button className="flex items-center gap-1 text-[#565D6D] cursor-not-allowed font-open-sans text-sm">
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-2 bg-[#DC3546] text-white rounded-md hover:bg-[#DC3546]/90 transition-colors font-open-sans text-sm"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-colors font-open-sans text-sm ${
                canSave
                  ? 'bg-[#003366] text-white hover:bg-[#003366]/90'
                  : 'bg-gray-300 text-white cursor-not-allowed'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </Layout>
    </AcademicRoute>
  );
}