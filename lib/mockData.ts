export interface OPP {
  code: string;
  description: string;
}

export interface RA {
  code: string;
  type: 'RG' | 'RE';
  description?: string;
}

export interface Relationship {
  oppCode: string;
  raCode: string;
  justification?: string;
}

export const oppList: OPP[] = [
  {
    code: 'OPP1',
    description: 'Comprender los principios fundamentales de la ingeniería de software.',
  },
  {
    code: 'OPP2',
    description: 'Diseñar y desarrollar sistemas de software escalables y seguros.',
  },
  {
    code: 'OPP3',
    description: 'Aplicar metodologías ágiles en la gestión de proyectos de software.',
  },
  {
    code: 'OPP4',
    description: 'Integrar herramientas y tecnologías modernas en el ciclo de vida de desarrollo.',
  },
  {
    code: 'OPP5',
    description: 'Comprender los principios fundamentales de la ingeniería de software.',
  },
  {
    code: 'OPP6',
    description: 'Aplicar teorías, metodologías, estándares y tecnologías apropiadas, para crear soluciones de software, mediante análisis, diseño, desarrollo, implementación, verificación, documentación y gestión de proyectos con eficiencia y calidad.',
  },
  {
    code: 'OPP7',
    description: 'Diseñar, desarrollar e implementar sistemas de software complejos, utilizando patrones de diseño y arquitecturas escalables, asegurando su robustez y mantenibilidad a lo largo del ciclo de vida del producto.',
  },
];

export const raList: RA[] = [
  { 
    code: 'RG1', 
    type: 'RG',
    description: 'Aplicar conocimientos de matemáticas, ciencias e ingeniería para resolver problemas complejos de software.'
  },
  { 
    code: 'RG2', 
    type: 'RG',
    description: 'Identificar, formular y resolver problemas de ingeniería mediante el análisis y síntesis.'
  },
  { 
    code: 'RG3', 
    type: 'RG',
    description: 'Diseñar sistemas, componentes o procesos que satisfagan necesidades específicas dentro de restricciones realistas.'
  },
  { 
    code: 'RE1', 
    type: 'RE',
    description: 'Desarrollar software aplicando principios de ingeniería de software y estándares de calidad.'
  },
  { 
    code: 'RE2', 
    type: 'RE',
    description: 'Diseñar, desarrollar e implementar sistemas de software complejos, utilizando patrones de diseño y arquitecturas escalables, asegurando su robustez y mantenibilidad a lo largo del ciclo de vida del producto.'
  },
  { 
    code: 'RE3', 
    type: 'RE',
    description: 'Gestionar proyectos de software aplicando metodologías ágiles y tradicionales.'
  },
  { 
    code: 'RE4', 
    type: 'RE',
    description: 'Aplicar técnicas de testing y aseguramiento de calidad en el desarrollo de software.'
  },
  { 
    code: 'RE5', 
    type: 'RE',
    description: 'Integrar sistemas y tecnologías emergentes en soluciones de software.'
  },
  { 
    code: 'RE6', 
    type: 'RE',
    description: 'Analizar y diseñar bases de datos eficientes para aplicaciones de software.'
  },
  { 
    code: 'RE7', 
    type: 'RE',
    description: 'Desarrollar interfaces de usuario intuitivas y accesibles.'
  },
  { 
    code: 'RE8', 
    type: 'RE',
    description: 'Implementar medidas de seguridad informática en aplicaciones de software.'
  },
];

export const initialRelationships: Relationship[] = [
  { oppCode: 'OPP1', raCode: 'RE1' },
  { oppCode: 'OPP2', raCode: 'RE2' },
  { oppCode: 'OPP3', raCode: 'RG2' },
  { oppCode: 'OPP4', raCode: 'RG3' },
  { oppCode: 'OPP5', raCode: 'RE3' },
  { oppCode: 'OPP6', raCode: 'RG1' },
  { oppCode: 'OPP7', raCode: 'RE7' },
];