// Mock data expandida para simular grandes cantidades de datos

// Resultados de Aprendizaje (RA) - Combinación de RG y RE
export const raList = [
  { code: "RA1", description: "Analizar problemas complejos de ingeniería", type: "RG" },
  { code: "RA2", description: "Diseñar soluciones para problemas complejos", type: "RG" },
  { code: "RA3", description: "Realizar investigación de problemas complejos", type: "RG" },
  { code: "RA4", description: "Usar técnicas, habilidades y herramientas modernas", type: "RE" },
  { code: "RA5", description: "Trabajo individual y en equipos", type: "RE" },
  { code: "RA6", description: "Comunicación efectiva", type: "RE" },
  { code: "RA7", description: "Ingeniería y sociedad", type: "RE" },
  { code: "RA8", description: "Ética profesional", type: "RE" },
  { code: "RA9", description: "Responsabilidad profesional", type: "RE" },
  { code: "RA10", description: "Aprendizaje continuo", type: "RE" },
  { code: "RA11", description: "Gestión de proyectos", type: "RE" },
  { code: "RA12", description: "Aspectos económicos", type: "RE" }
];

// Objetivos de Carrera (OPP) - Expandida para probar navegación
export const oppList = [
  { code: "OPP1", description: "Desarrollar competencias técnicas en ingeniería de software" },
  { code: "OPP2", description: "Formar profesionales con habilidades de liderazgo" },
  { code: "OPP3", description: "Promover la investigación e innovación tecnológica" },
  { code: "OPP4", description: "Desarrollar capacidades de gestión empresarial" },
  { code: "OPP5", description: "Fomentar la responsabilidad social y ética profesional" },
  { code: "OPP6", description: "Promover el trabajo colaborativo interdisciplinario" },
  { code: "OPP7", description: "Desarrollar competencias en comunicación técnica" },
  { code: "OPP8", description: "Formar profesionales con visión global" },
  { code: "OPP9", description: "Promover la innovación y emprendimiento" },
  { code: "OPP10", description: "Desarrollar habilidades de pensamiento crítico" },
  { code: "OPP11", description: "Fomentar el aprendizaje continuo y autónomo" },
  { code: "OPP12", description: "Promover la sostenibilidad ambiental" },
  { code: "OPP13", description: "Desarrollar competencias digitales avanzadas" },
  { code: "OPP14", description: "Formar líderes en transformación digital" },
  { code: "OPP15", description: "Promover la inclusión y diversidad" },
  { code: "OPP16", description: "Desarrollar competencias en inteligencia artificial" },
  { code: "OPP17", description: "Fomentar la creatividad e innovación" },
  { code: "OPP18", description: "Promover la excelencia académica" },
  { code: "OPP19", description: "Desarrollar habilidades de resolución de problemas" },
  { code: "OPP20", description: "Formar profesionales adaptativos al cambio" }
];

// Criterios EUR-ACE
export const euraceList = [
  { code: "EUR-ACE 1", description: "Conocimiento y comprensión" },
  { code: "EUR-ACE 2", description: "Análisis en ingeniería" },
  { code: "EUR-ACE 3", description: "Diseño en ingeniería" },
  { code: "EUR-ACE 4", description: "Investigación" },
  { code: "EUR-ACE 5", description: "Aplicación práctica de la ingeniería" },
  { code: "EUR-ACE 6", description: "Transferencia de tecnología" },
  { code: "EUR-ACE 7", description: "Responsabilidad profesional y social" }
];

// Relaciones iniciales para RA vs OPP
export const initialRAvsOPPRelationships = [
  { raCode: "RA1", oppCode: "OPP1" },
  { raCode: "RA1", oppCode: "OPP3" },
  { raCode: "RA2", oppCode: "OPP1" },
  { raCode: "RA2", oppCode: "OPP9" },
  { raCode: "RA3", oppCode: "OPP3" },
  { raCode: "RA4", oppCode: "OPP13" },
  { raCode: "RA5", oppCode: "OPP2" },
  { raCode: "RA5", oppCode: "OPP6" },
  { raCode: "RA6", oppCode: "OPP7" },
  { raCode: "RA7", oppCode: "OPP5" },
  { raCode: "RA8", oppCode: "OPP5" },
  { raCode: "RA9", oppCode: "OPP5" },
  { raCode: "RA10", oppCode: "OPP11" },
  { raCode: "RA11", oppCode: "OPP4" },
  { raCode: "RA12", oppCode: "OPP4" }
];

// Relaciones iniciales para RA vs EUR-ACE
export const initialRAvsEURACERelationships = [
  { raCode: "RA1", euraceCode: "EUR-ACE 1" },
  { raCode: "RA1", euraceCode: "EUR-ACE 2" },
  { raCode: "RA2", euraceCode: "EUR-ACE 3" },
  { raCode: "RA3", euraceCode: "EUR-ACE 4" },
  { raCode: "RA4", euraceCode: "EUR-ACE 5" },
  { raCode: "RA5", euraceCode: "EUR-ACE 6" },
  { raCode: "RA6", euraceCode: "EUR-ACE 6" },
  { raCode: "RA7", euraceCode: "EUR-ACE 7" },
  { raCode: "RA8", euraceCode: "EUR-ACE 7" },
  { raCode: "RA9", euraceCode: "EUR-ACE 7" }
];

// Tipos TypeScript
export interface RA {
  code: string;
  description: string;
  type: 'RG' | 'RE';
}

export interface OPP {
  code: string;
  description: string;
}

export interface EURACE {
  code: string;
  description: string;
}

export interface RAvsOPPRelationship {
  raCode: string;
  oppCode: string;
}

export interface RAvsEURACERelationship {
  raCode: string;
  euraceCode: string;
}

// Compatibilidad con nombres anteriores
export const oppListExtended = oppList;
export interface Relationship {
  oppCode: string;
  raCode: string;
}

export const initialRelationships: Relationship[] = [
  { oppCode: "OPP1", raCode: "RA1" },
  { oppCode: "OPP1", raCode: "RA2" },
  { oppCode: "OPP3", raCode: "RA1" },
  { oppCode: "OPP3", raCode: "RA3" },
  { oppCode: "OPP2", raCode: "RA5" },
  { oppCode: "OPP6", raCode: "RA5" },
  { oppCode: "OPP7", raCode: "RA6" },
  { oppCode: "OPP5", raCode: "RA7" },
  { oppCode: "OPP5", raCode: "RA8" },
  { oppCode: "OPP5", raCode: "RA9" },
  { oppCode: "OPP11", raCode: "RA10" },
  { oppCode: "OPP4", raCode: "RA11" },
  { oppCode: "OPP4", raCode: "RA12" },
  { oppCode: "OPP13", raCode: "RA4" },
  { oppCode: "OPP9", raCode: "RA2" }
];