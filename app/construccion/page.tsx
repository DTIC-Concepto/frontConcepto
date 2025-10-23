"use client";

import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { Construction } from "lucide-react";

export default function Construccion() {
  return (
    <AcademicRoute>
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#F3F4F6] mb-6">
              <Construction className="w-12 h-12 text-[#565D6D]" />
            </div>
            <h1 className="text-4xl font-bold text-[#171A1F] mb-4">
              En Construcción
            </h1>
            <p className="text-lg text-[#565D6D] max-w-md mx-auto">
              Esta sección está en desarrollo. Pronto estará disponible para su uso.
            </p>
          </div>
        </div>
      </Layout>
    </AcademicRoute>
  );
}
