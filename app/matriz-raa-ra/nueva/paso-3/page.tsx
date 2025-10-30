"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { Steps } from "@/components/StepIndicator";
import { Button } from "@/components/ui/button";
import { X, Save, ChevronDown } from "lucide-react";

export default function RaaRaMatrix() {
  const router = useRouter();
  const [nivelAporte, setNivelAporte] = useState("");
  const [justificacion, setJustificacion] = useState("");

  const handleSave = () => {
    // Aquí iría la lógica para guardar la relación
    console.log("Guardando relación...", { nivelAporte, justificacion });
    router.push("/construccion");
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
            <p className="text-base text-gray-500">
              Aplicar teorías, metodologías, estándares y tecnologías apropiadas, para crear soluciones de software, mediante el análisis, diseño, desarrollo, implementación, verificación, documentación y gestión de proyectos con eficiencia y calidad.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Resultado de aprendizaje de carrera:
            </h3>
            <p className="text-base text-gray-500">
              Diseñar, desarrollar e implementar sistemas de software complejos, utilizando patrones de diseño y arquitecturas escalables, asegurando su robustez y mantenibilidad a lo largo del ciclo de vida del producto.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 font-open-sans">
              Seleccione el nivel de aporte:
            </h3>
            <div className="relative">
              <select
                value={nivelAporte}
                onChange={(e) => setNivelAporte(e.target.value)}
                className="w-[276px] h-10 pl-3 pr-8 appearance-none rounded-md border border-gray-200 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#003366]"
              >
                <option value="">Nivel de Aporte</option>
                <option value="alto">Alto</option>
                <option value="medio">Medio</option>
                <option value="bajo">Bajo</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
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

          <div className="flex justify-end gap-4">
            <Button
              variant="destructive"
              className="gap-2 h-10 px-6 rounded-md shadow-sm"
              onClick={() => router.push("/construccion")}
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!nivelAporte || !justificacion}
              className={`gap-2 h-10 px-6 rounded-md shadow-sm ${
                nivelAporte && justificacion
                  ? "bg-[#003366] hover:bg-[#002244]"
                  : "bg-gray-200 text-white hover:bg-gray-200 cursor-not-allowed"
              }`}
            >
              <Save className="w-4 h-4" />
              Guardar
            </Button>
          </div>
        </div>
      </Layout>
    </AcademicRoute>
  );
}
