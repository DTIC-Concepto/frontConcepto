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
import { X, Save } from "lucide-react";
import { MappingsService } from "@/lib/mappings";
import NotificationService from "@/lib/notifications";
import type { Raa } from "@/lib/raa";

interface RAItem {
  id: number;
  code: string;
  name: string;
  type: 'GENERAL' | 'ESPECIFICO';
}

export default function RaaRaMatrix() {
  const router = useRouter();
  const [nivelAporte, setNivelAporte] = useState<"Alto" | "Medio" | "Bajo" | "">("");
  const [justificacion, setJustificacion] = useState("");
  const [selectedRaa, setSelectedRaa] = useState<Raa | null>(null);
  const [selectedRa, setSelectedRa] = useState<RAItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar RAA y RA seleccionados del localStorage
  useEffect(() => {
    const raaString = typeof window !== 'undefined' 
      ? localStorage.getItem('selected_raa')
      : null;
    const raString = typeof window !== 'undefined' 
      ? localStorage.getItem('selected_ra')
      : null;
    
    if (raaString && raString) {
      try {
        const raa = JSON.parse(raaString);
        const ra = JSON.parse(raString);
        setSelectedRaa(raa);
        setSelectedRa(ra);
      } catch (error) {
        console.error('Error parsing selected items:', error);
        NotificationService.error('Error', 'No se pudieron cargar los elementos seleccionados');
        router.push('/matriz-raa-ra/nueva');
      }
    } else {
      NotificationService.error('Error', 'No se encontraron los elementos seleccionados');
      router.push('/matriz-raa-ra/nueva');
    }
  }, [router]);

  const handleSave = async () => {
    if (!selectedRaa || !selectedRa || !nivelAporte || !justificacion.trim()) {
      NotificationService.error('Error', 'Por favor complete todos los campos');
      return;
    }

    try {
      setIsSaving(true);

      // Preparar datos para el POST
      const mappingData = {
        raaId: selectedRaa.id!,
        raId: selectedRa.id,
        nivelAporte: nivelAporte,
        justificacion: justificacion.trim(),
        estadoActivo: true
      };

      console.log('Creating mapping with data:', mappingData);

      // Llamar al endpoint POST /mappings/raa-ra
      const result = await MappingsService.createRaaRaMapping(mappingData);

      if (result.success) {
        NotificationService.success(
          'Relación creada',
          'La relación entre RAA y RA se ha creado exitosamente'
        );

        // Limpiar localStorage
        localStorage.removeItem('selected_raa');
        localStorage.removeItem('selected_ra');

        // Recargar la matriz si existe la función global
        if (typeof window !== 'undefined' && (window as any).reloadRaaRaMatrix) {
          (window as any).reloadRaaRaMatrix();
        }

        // Redirigir según el origen
        const origin = typeof window !== 'undefined' 
          ? localStorage.getItem('wizard_origin') 
          : null;
        
        if (origin === 'sidebar') {
          router.push('/mapeos/raa-vs-ra');
        } else {
          router.push('/asignaturas/nueva/matriz-raa-ra');
        }
      } else {
        NotificationService.error(
          'Error',
          result.error || 'No se pudo crear la relación'
        );
      }
    } catch (error) {
      console.error('Error guardando relación:', error);
      NotificationService.error(
        'Error',
        'Ocurrió un error al guardar la relación'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/matriz-raa-ra/nueva/paso-2");
  };

  const handleCancel = () => {
    // Limpiar localStorage
    localStorage.removeItem('selected_raa');
    localStorage.removeItem('selected_ra');

    const origin = typeof window !== 'undefined' 
      ? localStorage.getItem('wizard_origin') 
      : null;
    
    if (origin === 'sidebar') {
      router.push('/mapeos/raa-vs-ra');
    } else {
      router.push('/asignaturas/nueva/matriz-raa-ra');
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
              Elementos Seleccionados:
            </h2>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Resultado de Aprendizaje de Asignatura (RAA):
            </h3>
            <div className="flex items-start gap-3">
              <span className="font-semibold text-[#003366] min-w-[60px]">
                {selectedRaa?.codigo || 'N/A'}
              </span>
              <p className="text-base text-gray-500">
                {selectedRaa?.descripcion || 'Sin descripción'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Resultado de Aprendizaje de Carrera (RA):
            </h3>
            <div className="flex items-start gap-3">
              <span className="font-semibold text-[#003366] min-w-[60px]">
                {selectedRa?.code || 'N/A'}
              </span>
              <p className="text-base text-gray-500">
                {selectedRa?.name || 'Sin descripción'}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 font-open-sans">
              Seleccione el nivel de aporte:
            </h3>
            <div className="w-[276px]">
              <Select value={nivelAporte} onValueChange={(value) => setNivelAporte(value as "Alto" | "Medio" | "Bajo")}>
                <SelectTrigger>
                  <SelectValue placeholder="Nivel de Aporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alto">Alto</SelectItem>
                  <SelectItem value="Medio">Medio</SelectItem>
                  <SelectItem value="Bajo">Bajo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 font-open-sans">
              Justifique la relación de RAA vs RA:
            </h3>
            <textarea
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              maxLength={1500}
              className="w-full h-[136px] px-3 py-3 rounded-md border border-gray-200 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#003366] resize-none"
              placeholder="Escribe tu justificación detallada aquí para la relación entre el Resultado de Aprendizaje de Asignatura y el Resultado de Aprendizaje seleccionados."
            />
            <div className="flex justify-end mt-1">
              <p className="text-xs text-gray-500">
                {justificacion.length} de 1500
              </p>
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              className="h-10 px-6 rounded-md shadow-sm"
              onClick={handleBack}
              disabled={isSaving}
            >
              Atrás
            </Button>
            <div className="flex gap-4">
              <Button
                variant="destructive"
                className="gap-2 h-10 px-6 rounded-md shadow-sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="w-4 h-4" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!nivelAporte || !justificacion.trim() || isSaving}
                className={`gap-2 h-10 px-6 rounded-md shadow-sm ${
                  nivelAporte && justificacion.trim() && !isSaving
                    ? "bg-[#003366] hover:bg-[#002244] text-white"
                    : "bg-gray-200 text-white hover:bg-gray-200 cursor-not-allowed"
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
        </div>
      </Layout>
    </AcademicRoute>
  );
}
