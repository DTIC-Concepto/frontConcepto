"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import CoordinadorRoute from "@/components/CoordinadorRoute";
import { X, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { type OPP, type RA } from "@/lib/mockData";

export default function JustificarRelacion() {
  const router = useRouter();
  const [selectedOPP, setSelectedOPP] = useState<OPP | null>(null);
  const [selectedRA, setSelectedRA] = useState<RA | null>(null);
  const [justification, setJustification] = useState('');
  const [currentStep, setCurrentStep] = useState(3);

  // Cargar las selecciones de los pasos anteriores
  useEffect(() => {
    const storedOPP = localStorage.getItem('selectedOPP');
    const storedRA = localStorage.getItem('selectedRA');
    
    if (storedOPP) {
      setSelectedOPP(JSON.parse(storedOPP));
    }
    
    if (storedRA) {
      setSelectedRA(JSON.parse(storedRA));
    }
    
    // Si falta alguna selección, redirigir al inicio del wizard
    if (!storedOPP || !storedRA) {
      router.push('/mapeos/ra-vs-opp/seleccion');
    }
  }, [router]);

  const canSave = justification.trim().length > 0;

  const handleSave = () => {
    if (canSave && selectedOPP && selectedRA) {
      // Aquí guardarías la relación en el backend
      console.log('Guardando relación:', {
        oppCode: selectedOPP.code,
        raCode: selectedRA.code,
        justification: justification
      });
      
      // Limpiar localStorage
      localStorage.removeItem('selectedOPP');
      localStorage.removeItem('selectedRA');
      
      // Redirigir de vuelta a la matriz
      router.push('/mapeos/ra-vs-opp');
    }
  };

  const handleCancel = () => {
    // Limpiar localStorage
    localStorage.removeItem('selectedOPP');
    localStorage.removeItem('selectedRA');
    router.push('/mapeos/ra-vs-opp');
  };

  return (
    <CoordinadorRoute>
      <Layout>
        <div className="p-8 space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-[#171A1F] font-montserrat">
              Matriz: Objetivos de Carrera (OPP) y Resultados de Aprendizaje (RA)
            </h1>
          </div>

          {/* Steps Indicator */}
          <div className="flex items-center justify-center gap-16">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#003366] border-2 border-gray-300 flex items-center justify-center">
                <span className="text-white font-medium font-open-sans">1</span>
              </div>
              <span className="text-sm text-[#565D6D] mt-2 font-open-sans">Seleccionar</span>
              <span className="text-sm text-[#565D6D] font-open-sans">Objetivos de carrera (OPP)</span>
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
              {selectedOPP && (
                <div>
                  <h3 className="text-sm font-semibold text-[#171A1F] mb-1 font-open-sans">Objetivo de Carrera ({selectedOPP.code}):</h3>
                  <p className="text-sm text-[#565D6D] font-open-sans">
                    {selectedOPP.description}
                  </p>
                </div>
              )}

              {selectedRA && (
                <div>
                  <h3 className="text-sm font-semibold text-[#171A1F] mb-1 font-open-sans">Resultado de aprendizaje de carrera ({selectedRA.code}):</h3>
                  <p className="text-sm text-[#565D6D] font-open-sans">
                    {selectedRA.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Justification Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#171A1F] font-montserrat">Justifique la relación de OPP vs RA</h2>

            <div>
              <label className="block text-sm text-[#565D6D] mb-2 font-open-sans">Justificación:</label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Escriba la justificación detallada aquí para la relación entre el Objetivo de Carrera y el Resultado de Aprendizaje seleccionados."
                className="w-full h-32 px-4 py-3 border border-[#DEE1E6] rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] font-open-sans text-sm"
              />
              <p className="text-xs text-[#565D6D] mt-1 font-open-sans">
                Mínimo 10 caracteres ({justification.length}/10)
              </p>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => router.push('/mapeos/ra-vs-opp/seleccion-ra')}
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
              <Save className="w-4 h-4" />
              Guardar
            </button>
          </div>
        </div>
      </Layout>
    </CoordinadorRoute>
  );
}