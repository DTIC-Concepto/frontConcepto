"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { oppList, raList, initialRelationships, type Relationship } from "@/lib/mockData";

export default function MatrizRAvsOPP() {
  const router = useRouter();
  const [relationships, setRelationships] = useState<Relationship[]>(initialRelationships);

  const hasRelationship = (oppCode: string, raCode: string) => {
    return relationships.some(rel => rel.oppCode === oppCode && rel.raCode === raCode);
  };

  return (
    <AcademicRoute>
      <Layout>
        <div className="p-8 space-y-8">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-[#171A1F] font-montserrat">
                  Matriz: Objetivos de Carrera (OPP) y Resultados de aprendizaje (RA)
                </h1>
                <p className="text-sm text-[#565D6D] font-open-sans">
                  La tabla muestra la relación entre los objetivos de carrera (perfil profesional) y los resultados de aprendizaje (perfil de egreso) de una carrera.
                </p>
              </div>
              <Button 
                onClick={() => router.push('/mapeos/ra-vs-opp/seleccion')}
                className="bg-[#003366] hover:bg-[#002244] text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva Relación
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#2D61A4] rounded" />
                <span className="text-[#171A1F] font-open-sans">Objetivos de Carrera</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <span className="text-[#171A1F] font-open-sans">Resultados de Aprendizaje Carrera</span>
              </div>
            </div>
          </div>

          {/* Matrix Section */}
          <div className="bg-gray-100 rounded-lg p-2 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-separate" style={{ borderSpacing: '2px' }}>
                <thead>
                  <tr>
                    <th className="w-32 px-0 py-0">
                      <div className="bg-[#E5E7EB] rounded px-4 py-3 h-[45px] flex items-center"></div>
                    </th>
                    {raList.map((ra) => (
                      <th key={ra.code} className="px-0 py-0">
                        <div className="bg-[#E5E7EB] rounded px-4 py-3 h-[45px] flex items-center justify-center gap-1">
                          <span className="text-sm font-medium text-[#171A1F] font-open-sans">{ra.code}</span>
                          <Info className="w-4 h-4 text-[#565D6D]" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {oppList.map((opp, idx) => (
                    <tr key={opp.code}>
                      <td className="px-0 py-0">
                        <div className="w-full bg-[#2D61A4] text-white rounded px-4 py-3 h-[45px] flex items-center justify-between">
                          <span className="text-sm font-medium font-open-sans">{opp.code}</span>
                          <Info className="w-4 h-4 text-white ml-1 flex-shrink-0" />
                        </div>
                      </td>
                      {raList.map((ra) => (
                        <td key={`${opp.code}-${ra.code}`} className="px-0 py-0">
                          <div className="bg-white rounded h-[45px] flex items-center justify-center relative cursor-pointer hover:bg-gray-50 transition-colors">
                            {hasRelationship(opp.code, ra.code) ? (
                              <div className="absolute inset-0 bg-emerald-500/50 hover:bg-emerald-500/70 rounded flex items-center justify-center transition-colors">
                                <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
                                  <path
                                    d="M12.8864 3.51118C13.148 3.24953 13.5721 3.24953 13.8337 3.51118C14.0955 3.77283 14.0955 4.19695 13.8337 4.4586L6.46377 11.8286C6.20212 12.0902 5.778 12.0902 5.51635 11.8286L2.16635 8.47859L2.12055 8.42754C1.90591 8.16443 1.92105 7.7765 2.16635 7.53121C2.41164 7.28586 2.79958 7.27072 3.06273 7.48538L3.11377 7.53121L5.99006 10.4075L12.8864 3.51118Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </div>
                            ) : (
                              <div className="absolute inset-0 rounded"></div>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    </AcademicRoute>
  );
}