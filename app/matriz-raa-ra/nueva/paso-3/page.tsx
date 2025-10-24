"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { Steps } from "@/components/StepIndicator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Save, Loader2 } from "lucide-react";
import { MappingsService } from "@/lib/mappings";
import { type Raa } from "@/lib/raa";
import { type LearningOutcome } from "@/lib/learning-outcomes";
import NotificationService from "@/lib/notifications";

export default function RaaRaMatrix() {
  const router = useRouter();
  const [nivelAporte, setNivelAporte] = useState("");
  const [justificacion, setJustificacion] = useState("");
  const [selectedRaa, setSelectedRaa] = useState<Raa | null>(null);
  const [selectedRa, setSelectedRa] = useState<LearningOutcome | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Cargar datos seleccionados desde localStorage
    const raaData = localStorage.getItem('selectedRaa');
    const raData = localStorage.getItem('selectedRa');
    
    if (raaData) {
      setSelectedRaa(JSON.parse(raaData));
    }
    if (raData) {
      setSelectedRa(JSON.parse(raData));
    }
    
    if (!raaData || !raData) {
      NotificationService.warning(
        'Advertencia',
        'No se encontraron elementos seleccionados. Por favor, complete los pasos anteriores.'
      );
      router.push('/matriz-raa-ra/nueva');
    }
  }, [router]);

  const handleSave = async () => {
    if (!selectedRaa || !selectedRa || !nivelAporte || !justificacion) {
      NotificationService.warning('Datos incompletos', 'Por favor complete todos los campos');
      return;
    }

    try {
      setSaving(true);
      
      // Normalizar el nivel de aporte (capitalizar primera letra)
      const nivelNormalizado = nivelAporte.charAt(0).toUpperCase() + nivelAporte.slice(1).toLowerCase();
      
      const result = await MappingsService.createRaaRaMapping({
        raaId: selectedRaa.id!,
        raId: selectedRa.id!,
        nivelAporte: nivelNormalizado as 'Alto' | 'Medio' | 'Bajo',
        justificacion: justificacion
      });

      if (result.success) {
        NotificationService.success(
          'Relación creada',
          'La relación entre RAA y RA se ha creado exitosamente'
        );
        
        // Limpiar localStorage
        localStorage.removeItem('selectedRaa');
        localStorage.removeItem('selectedRa');
        
        // Llamar función de recarga de la matriz si existe
        if (typeof window !== 'undefined' && (window as any).reloadRaaRaMatrix) {
          (window as any).reloadRaaRaMatrix();
        }
        
        // Redirigir según el origen del wizard
        const wizardOrigin = localStorage.getItem('wizard_origin');
        localStorage.removeItem('wizard_origin'); // Limpiar después de usar
        
        if (wizardOrigin === 'sidebar') {
          router.push('/mapeos/raa-vs-ra');
        } else {
          router.push('/asignaturas/nueva/matriz-raa-ra');
        }
      } else {
        // Verificar si el error indica que la relación ya existe
        const errorMessage = result.error || '';
        if (errorMessage.toLowerCase().includes('ya existe') || 
            errorMessage.toLowerCase().includes('duplicad') ||
            errorMessage.toLowerCase().includes('already exists')) {
          NotificationService.warning(
            'Relación existente',
            'Ya se ha establecido una relación entre este RAA y RA. Por favor, seleccione otro elemento.'
          );
        } else {
          NotificationService.error(
            'Error al crear relación',
            result.error || 'No se pudo crear la relación'
          );
        }
      }
    } catch (error) {
      console.error('Error guardando relación:', error);
      NotificationService.error(
        'Error',
        error instanceof Error ? error.message : 'Error desconocido al guardar la relación'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AcademicRoute>
      <Layout>
        <div className="max-w-[1280px] mx-auto p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8 font-open-sans">
            Matriz: Resultados de aprendizaje de Asignatura (RAA) y Resultados de aprendizaje (RA)
          </h1>

          <Steps currentStep={3} />

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1 font-open-sans">
              Elementos Seleccionado:
            </h2>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Resultados de Aprendizaje de Asignatura (RAA):
            </h3>
            {selectedRaa ? (
              <>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {selectedRaa.codigo} - {selectedRaa.tipo}
                </p>
                <p className="text-base text-gray-500">
                  {selectedRaa.descripcion}
                </p>
              </>
            ) : (
              <p className="text-base text-gray-400 italic">Cargando...</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Resultado de aprendizaje de carrera:
            </h3>
            {selectedRa ? (
              <>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {selectedRa.codigo} - {selectedRa.tipo}
                </p>
                <p className="text-base text-gray-500">
                  {selectedRa.descripcion}
                </p>
              </>
            ) : (
              <p className="text-base text-gray-400 italic">Cargando...</p>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 font-open-sans">
              Seleccione el nivel de aporte:
            </h3>
            <Select value={nivelAporte} onValueChange={setNivelAporte} disabled={saving}>
              <SelectTrigger className="w-[276px] h-10">
                <SelectValue placeholder="Nivel de aporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Alto">Alto</SelectItem>
                <SelectItem value="Medio">Medio</SelectItem>
                <SelectItem value="Bajo">Bajo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 font-open-sans">
              Justifique la relación de RAA vs RA:
            </h3>
            <textarea
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              disabled={saving}
              className="w-full h-[136px] px-3 py-3 rounded-md border border-gray-200 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#003366] resize-none disabled:bg-gray-50"
              placeholder="Escribe tu justificación detallada aquí para la relación entre el Resultado de Aprendizaje de Asignatura y el Resultado de Aprendizaje seleccionados."
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="destructive"
              className="gap-2 h-10 px-6 rounded-md shadow-sm"
              onClick={() => {
                const wizardOrigin = localStorage.getItem('wizard_origin');
                localStorage.removeItem('wizard_origin');
                if (wizardOrigin === 'sidebar') {
                  router.push('/mapeos/raa-vs-ra');
                } else {
                  router.push('/asignaturas/nueva/matriz-raa-ra');
                }
              }}
              disabled={saving}
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!nivelAporte || !justificacion || saving || !selectedRaa || !selectedRa}
              className={`gap-2 h-10 px-6 rounded-md shadow-sm ${
                nivelAporte && justificacion && !saving && selectedRaa && selectedRa
                  ? "bg-[#003366] hover:bg-[#002244] text-white"
                  : "bg-gray-200 text-white hover:bg-gray-200 cursor-not-allowed"
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
            </Button>
          </div>
        </div>
      </Layout>
    </AcademicRoute>
  );
}
