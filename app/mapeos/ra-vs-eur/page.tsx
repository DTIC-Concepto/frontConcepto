"use client";

import Layout from "@/components/Layout";
import CoordinadorRoute from "@/components/CoordinadorRoute";

export default function MapeoRaVsEur() {
  return (
    <CoordinadorRoute>
      <Layout>
        <div className="p-8">
          <h1 className="text-4xl font-bold text-[#171A1F] font-['Open_Sans'] mb-8">
            Mapeo RA vs EUR-ACE
          </h1>
          
          <div className="bg-white rounded-lg shadow-sm border border-[#DEE1E6] p-6">
            <div className="text-center py-12 text-[#565D6D]">
              <p className="text-lg mb-2">Mapeo de Resultados de Aprendizaje vs Criterios EUR-ACE</p>
              <p className="text-sm">Esta funcionalidad está en construcción</p>
            </div>
          </div>
        </div>
      </Layout>
    </CoordinadorRoute>
  );
}