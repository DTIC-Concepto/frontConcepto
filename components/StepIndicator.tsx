import { cn } from "@/lib/utils";

interface StepProps {
  number: number;
  title: string;
  subtitle: string;
  active?: boolean;
  completed?: boolean;
}

export function StepIndicator({ number, title, subtitle, active, completed }: StepProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "w-8 h-8 rounded-full border-2 flex items-center justify-center text-base font-normal",
          active || completed
            ? "bg-[#003366] border-gray-200 text-white"
            : "bg-gray-100 border-gray-200 text-gray-500"
        )}
      >
        {number}
      </div>
      <div className="text-center">
        <p
          className={cn(
            "text-sm font-normal",
            active || completed ? "text-gray-500" : "text-gray-500"
          )}
        >
          {title}
        </p>
        <p className="text-sm font-normal text-gray-500 max-w-[188px]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

interface StepsProps {
  currentStep: number;
}

export function Steps({ currentStep }: StepsProps) {
  return (
    <div className="flex items-start justify-center gap-8 mb-8">
      <StepIndicator
        number={1}
        title="Seleccionar"
        subtitle="Resultados de Aprendizaje de  Asignatura (RAA)"
        active={currentStep >= 1}
        completed={currentStep > 1}
      />
      <div className="h-0 border-t-2 border-gray-200 w-[179px] mt-4"></div>
      <StepIndicator
        number={2}
        title="Seleccionar"
        subtitle="Resultados de Aprendizaje (RA)"
        active={currentStep >= 2}
        completed={currentStep > 2}
      />
      <div className="h-0 border-t-2 border-gray-200 w-[179px] mt-4"></div>
      <StepIndicator
        number={3}
        title={currentStep >= 3 ? "Justificar Relación" : "Justificar"}
        subtitle="Justificar Relación"
        active={currentStep >= 3}
      />
    </div>
  );
}
