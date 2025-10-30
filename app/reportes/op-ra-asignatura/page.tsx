"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { ChevronDown } from "lucide-react";

export default function OpRaAsignatura() {
  const [selectedFaculty, setSelectedFaculty] = useState("Sistemas");
  const [selectedCareer, setSelectedCareer] = useState("Software");
  const [filters, setFilters] = useState({
    alto: true,
    medio: true,
    bajo: true,
  });

  return (
    <AcademicRoute>
      <Layout>
        <div className="bg-[#FAFAFB] min-h-screen p-8">
          <div className="max-w-[1024px] mx-auto space-y-6">
            {/* Title Card */}
            <div className="bg-white rounded-lg border border-[#DEE1E6] shadow-sm p-6">
              <h1 className="text-2xl font-bold text-[#171A1F] mb-2 leading-8">
                Reporte: Objetivos de Carrera vs Resultados de Aprendizaje vs
                Asignaturas
              </h1>
              <p className="text-[#565D6D] text-base">
                Visualice la alineación entre objetivos, resultados y
                asignaturas del programa académico.
              </p>
            </div>

            {/* Filters Card */}
            <div className="bg-white rounded-lg border border-[#DEE1E6] shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Faculty Dropdown */}
                <div>
                  <label className="text-[#19191F] text-sm font-medium mb-2 block">
                    Facultad
                  </label>
                  <div className="relative">
                    <select
                      value={selectedFaculty}
                      onChange={(e) => setSelectedFaculty(e.target.value)}
                      className="w-full px-3 py-2 border border-[#DEE1E6] rounded-md text-sm text-[#171A1F] appearance-none bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Sistemas">Sistemas</option>
                      <option value="Ingeniería">Ingeniería</option>
                      <option value="Ciencias">Ciencias</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#565D6D] pointer-events-none" />
                  </div>
                </div>

                {/* Career Dropdown */}
                <div>
                  <label className="text-[#19191F] text-sm font-medium mb-2 block">
                    Carrera
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCareer}
                      onChange={(e) => setSelectedCareer(e.target.value)}
                      className="w-full px-3 py-2 border border-[#DEE1E6] rounded-md text-sm text-[#171A1F] appearance-none bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Software">Software</option>
                      <option value="Sistemas">Sistemas</option>
                      <option value="Computación">Computación</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#565D6D] pointer-events-none" />
                  </div>
                </div>

                {/* Level Checkboxes */}
                <div>
                  <label className="text-[#19191F] text-sm font-medium mb-2 block">
                    Nivel de aporte
                  </label>
                  <div className="flex gap-4 pt-1">
                    {[
                      { key: "alto", label: "Alto" },
                      { key: "medio", label: "Medio" },
                      { key: "bajo", label: "Bajo" },
                    ].map(({ key, label }) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div className="relative w-[22px] h-[22px]">
                          <input
                            type="checkbox"
                            checked={filters[key as keyof typeof filters]}
                            onChange={(e) =>
                              setFilters({ ...filters, [key]: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-[22px] h-[22px] border-2 border-[#323234] rounded peer-checked:bg-[#323234] transition-colors">
                            {filters[key as keyof typeof filters] && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-sm"></div>
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-[#19191F]">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Report Table */}
            <div className="bg-white rounded-lg border border-[#DEE1E6] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#DEE1E6]">
                      <th className="bg-white text-left px-4 py-4 text-sm font-medium text-[#565D6D] border-r border-[#DEE1E6]/50 w-[400px]">
                        Objetivos de carrera
                      </th>
                      <th className="bg-white text-left px-4 py-4 text-sm font-medium text-[#565D6D] w-[300px]">
                        Resultados de Aprendizaje
                      </th>
                      <th className="bg-white text-left px-4 py-4 text-sm font-medium text-[#565D6D]">
                        Asignaturas
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Row 1 */}
                    <tr className="border-b border-[#F3F4F6]">
                      <td className="px-4 py-4 bg-white border-r border-[#F3F4F6]/50 align-top">
                        <p className="text-sm text-[#171A1F] leading-5">
                          OPP1: Formar profesionales capaces de analizar,
                          diseñar, desarrollar y mantener sistemas de software
                          innovadores y eficientes, aplicando metodologías
                          ágiles y estándares de calidad internacional.
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <ul className="space-y-3">
                          <li className="flex gap-2">
                            <span className="text-[#171A1F] mt-0.5">•</span>
                            <span className="text-sm text-[#171A1F] leading-5">
                              RG1: Identifica y aplica algoritmos de
                              optimización para la mejora de sistemas.
                            </span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-[#171A1F] mt-0.5">•</span>
                            <span className="text-sm text-[#171A1F] leading-5">
                              RG3: Modela sistemas complejos utilizando
                              paradigmas de programación orientada a objetos.
                            </span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-[#171A1F] mt-0.5">•</span>
                            <span className="text-sm text-[#171A1F] leading-5">
                              RE4: Diseña arquitecturas de software escalables y
                              de alto rendimiento.
                            </span>
                          </li>
                        </ul>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs font-bold text-[#1E2128] whitespace-nowrap">
                            IS-101: Programación Avanzada
                          </span>
                          <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs font-bold text-[#1E2128] whitespace-nowrap">
                            IS-305: Desarrollo Web
                          </span>
                          <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs font-bold text-[#1E2128] whitespace-nowrap">
                            MA-102: Álgebra Lineal
                          </span>
                          <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs font-bold text-[#1E2128] whitespace-nowrap">
                            IS-203: Bases de Datos
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Row 2 */}
                    <tr className="border-b border-[#F3F4F6]">
                      <td className="px-4 py-4 bg-white border-r border-[#F3F4F6]/50 align-top">
                        <p className="text-sm text-[#171A1F] leading-5">
                          OPP2: Capacitar en la gestión de proyectos
                          tecnológicos, liderazgo de equipos multidisciplinarios
                          y la implementación de soluciones que contribuyan al
                          desarrollo sostenible de la sociedad.
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <ul className="space-y-3">
                          <li className="flex gap-2">
                            <span className="text-[#171A1F] mt-0.5">•</span>
                            <span className="text-sm text-[#171A1F] leading-5">
                              RG1: Gestiona proyectos de desarrollo de software
                              utilizando metodologías ágiles.
                            </span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-[#171A1F] mt-0.5">•</span>
                            <span className="text-sm text-[#171A1F] leading-5">
                              RG3: Lidera equipos multidisciplinarios en
                              entornos de innovación tecnológica.
                            </span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-[#171A1F] mt-0.5">•</span>
                            <span className="text-sm text-[#171A1F] leading-5">
                              RG4: Evalúa el impacto social y ambiental de las
                              soluciones tecnológicas.
                            </span>
                          </li>
                        </ul>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs font-bold text-[#1E2128] whitespace-nowrap">
                            GE-401: Gestión de Proyectos de TI
                          </span>
                          <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs font-bold text-[#1E2128] whitespace-nowrap">
                            HU-301: Ética Profesional
                          </span>
                          <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs font-bold text-[#1E2128] whitespace-nowrap">
                            IS-306: Ingeniería de Software
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Row 3 */}
                    <tr className="border-b border-[#F3F4F6]">
                      <td className="px-4 py-4 bg-white border-r border-[#F3F4F6]/50 align-top">
                        <p className="text-sm text-[#171A1F] leading-5">
                          OPP3: Desarrollar habilidades críticas para la
                          investigación y la adaptación continua a las nuevas
                          tendencias y tecnologías en el ámbito de la ingeniería
                          de software.
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <ul className="space-y-3">
                          <li className="flex gap-2">
                            <span className="text-[#171A1F] mt-0.5">•</span>
                            <span className="text-sm text-[#171A1F] leading-5">
                              RE1: Realiza investigación aplicada en nuevas
                              tecnologías de software.
                            </span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-[#171A1F] mt-0.5">•</span>
                            <span className="text-sm text-[#171A1F] leading-5">
                              RE2: Se adapta rápidamente a cambios tecnológicos
                              y nuevas herramientas.
                            </span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-[#171A1F] mt-0.5">•</span>
                            <span className="text-sm text-[#171A1F] leading-5">
                              RE3: Propone soluciones innovadoras a problemas
                              complejos de ingeniería.
                            </span>
                          </li>
                        </ul>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs font-bold text-[#1E2128] whitespace-nowrap">
                            IS-501: Investigación en Software
                          </span>
                          <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs font-bold text-[#1E2128] whitespace-nowrap">
                            IS-402: Inteligencia Artificial
                          </span>
                          <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs font-bold text-[#1E2128] whitespace-nowrap">
                            MA-201: Cálculo Multivariable
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Row 4 */}
                    <tr>
                      <td className="px-4 py-4 bg-white border-r border-[#F3F4F6]/50 align-top">
                        <p className="text-sm text-[#171A1F] leading-5">
                          OPP5: Fomentar la ética profesional, el compromiso
                          social y la comunicación efectiva para interactuar en
                          diversos contextos profesionales y comunitarios.
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <ul className="space-y-3">
                          <li className="flex gap-2">
                            <span className="text-[#171A1F] mt-0.5">•</span>
                            <span className="text-sm text-[#171A1F] leading-5">
                              RG1: Comunica ideas técnicas de forma clara y
                              efectiva a diversas audiencias.
                            </span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-[#171A1F] mt-0.5">•</span>
                            <span className="text-sm text-[#171A1F] leading-5">
                              RG2: Demuestra un comportamiento ético y
                              responsable en su práctica profesional.
                            </span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-[#171A1F] mt-0.5">•</span>
                            <span className="text-sm text-[#171A1F] leading-5">
                              RE1: Participa activamente en proyectos de impacto
                              social y comunitario.
                            </span>
                          </li>
                        </ul>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs font-bold text-[#1E2128] whitespace-nowrap">
                            CO-101: Comunicación Oral y Escrita
                          </span>
                          <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs font-bold text-[#1E2128] whitespace-nowrap">
                            HU-301: Ética Profesional
                          </span>
                          <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs font-bold text-[#1E2128] whitespace-nowrap">
                            IS-403: Seguridad Informática
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </AcademicRoute>
  );
}
