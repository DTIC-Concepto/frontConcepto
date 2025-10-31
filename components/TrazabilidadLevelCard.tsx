import { ArrowRight } from "lucide-react";

interface Raa {
  codigo: string;
  descripcion: string;
}

interface TrazabilidadLevelCardProps {
  level: "Alto" | "Medio" | "Bajo";
  raas: Raa[];
  raTitle: string;
  raDescription: string;
  justificationTitle: string;
  justificationDescription: string;
  criterionTitle: string;
  criterionDescription: string;
}

const levelColors = {
  Alto: "bg-[#E8F5E9]",
  Medio: "bg-[#FFF8E1]",
  Bajo: "bg-[#FFEBEE]",
};

export default function TrazabilidadLevelCard({
  level,
  raas,
  raTitle,
  raDescription,
  justificationTitle,
  justificationDescription,
  criterionTitle,
  criterionDescription,
}: TrazabilidadLevelCardProps) {
  return (
    <div
      className={`rounded-[10px] border border-[#DEE1E6] shadow-sm p-4 md:p-6 ${levelColors[level]}`}
    >
      <h2 className="text-[#323234] font-roboto text-lg md:text-xl font-semibold mb-4">
        Nivel de aporte: {level}
      </h2>

      <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-6">
        {/* Columna de RAAs */}
        <div className="w-full lg:flex-1 space-y-4">
          <div>
            <h3 className="text-[#323234] font-roboto text-sm md:text-base font-semibold mb-2">
              R. de Aprendizaje Asignatura
            </h3>
            <div className="space-y-3">
              {raas.map((raa, index) => (
                <div
                  key={index}
                  className="bg-white rounded-[10px] border border-[#DEE1E6] shadow-sm p-3 md:p-4 space-y-3"
                >
                  <div>
                    <p className="text-[#323234] font-roboto text-base md:text-lg font-medium">
                      {raa.codigo}:
                    </p>
                  </div>
                  <div>
                    <p className="text-[#565D6D] font-roboto text-xs md:text-sm leading-5">
                      {raa.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-center pt-24">
          <ArrowRight className="w-6 h-6 text-[#565D6D] flex-shrink-0" />
        </div>

        {/* Columna de RA */}
        <div className="w-full lg:flex-1 space-y-4">
          <div>
            <h3 className="text-[#323234] font-roboto text-sm md:text-base font-semibold mb-2">
              R. de Aprendizaje
            </h3>
            <div className="bg-white rounded-[10px] border border-[#DEE1E6] shadow-sm p-4 md:p-5 min-h-[200px] lg:min-h-[352px]">
              <p className="text-[#323234] font-roboto text-base md:text-lg font-medium mb-4 md:mb-6">
                {raTitle}
              </p>
              <p className="text-[#565D6D] font-roboto text-xs md:text-sm leading-5">
                {raDescription}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-center pt-24">
          <ArrowRight className="w-6 h-6 text-[#565D6D] flex-shrink-0" />
        </div>

        {/* Columna de Justificación */}
        <div className="w-full lg:flex-1 space-y-4">
          <div>
            <h3 className="text-[#323234] font-roboto text-sm md:text-base font-semibold mb-2">
              Justificación RA–EURACE
            </h3>
            <div className="bg-white rounded-[10px] border border-[#DEE1E6] shadow-sm p-4 md:p-5 min-h-[200px] lg:min-h-[352px]">
              <p className="text-[#323234] font-roboto text-base md:text-lg font-medium mb-6 md:mb-10">
                {justificationTitle}
              </p>
              <p className="text-[#565D6D] font-roboto text-xs md:text-sm leading-5">
                {justificationDescription}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-center pt-24">
          <ArrowRight className="w-6 h-6 text-[#565D6D] flex-shrink-0" />
        </div>

        {/* Columna de Criterio EUR-ACE */}
        <div className="w-full lg:flex-1 space-y-4">
          <div>
            <h3 className="text-[#323234] font-roboto text-sm md:text-base font-semibold mb-2">
              Criterio EUR-ACE
            </h3>
            <div className="bg-white rounded-[10px] border border-[#DEE1E6] shadow-sm p-3 md:p-4 min-h-[200px] lg:min-h-[352px]">
              <p className="text-[#323234] font-roboto text-base md:text-lg font-medium leading-7 mb-4 md:mb-6">
                Criterio {criterionTitle}:
              </p>
              <p className="text-[#565D6D] font-roboto text-xs md:text-sm leading-5">
                {criterionDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
