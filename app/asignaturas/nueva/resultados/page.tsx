"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2 } from "lucide-react";
import { RaaService, Raa } from "@/lib/raa";
import NewRaaModal from "@/components/NewRaaModal";
import NotificationService from "@/lib/notifications";
import Pagination from "@/components/Pagination";

export const dynamic = 'force-dynamic';

function ResultadosAprendizajeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [raas, setRaas] = useState<Raa[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [asignaturaId, setAsignaturaId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Obtener asignaturaId del query param o localStorage
  useEffect(() => {
    const idFromParams = searchParams.get('asignaturaId');
    const idFromStorage = typeof window !== 'undefined' 
      ? localStorage.getItem('current_asignatura_id') 
      : null;
    
    const id = idFromParams ? parseInt(idFromParams) : (idFromStorage ? parseInt(idFromStorage) : null);
    
    if (id) {
      setAsignaturaId(id);
      loadRaas(id);
    } else {
      NotificationService.warning(
        'Advertencia',
        'No se encontró la asignatura. Por favor, cree una asignatura primero.'
      );
      setLoading(false);
    }
  }, [searchParams]);

  const loadRaas = async (id: number) => {
    try {
      setLoading(true);
      const data = await RaaService.getRaas(id);
      setRaas(data);
    } catch (error) {
      console.error('Error cargando RAA:', error);
      NotificationService.error(
        'Error al cargar RAA',
        error instanceof Error ? error.message : 'Error desconocido'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRaaCreated = () => {
    if (asignaturaId) {
      loadRaas(asignaturaId);
    }
  };

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(raas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRaas = raas.slice(startIndex, endIndex);

  return (
    <AcademicRoute>
      <Layout>
        <div className="p-6 lg:p-12">
          <div className="max-w-7xl mx-auto">
            {/* Tabs */}
            <div className="bg-[#F3F4F6] rounded-lg p-1 mb-6">
              <Tabs value="raa" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-transparent gap-1">
                  <TabsTrigger
                    value="pea"
                    className="data-[state=active]:bg-white data-[state=active]:text-[#171A1F] data-[state=inactive]:text-[#565D6D]/50"
                    onClick={() => router.push("/asignaturas/nueva")}
                  >
                    Asignatura (PEA)
                  </TabsTrigger>
                  <TabsTrigger
                    value="raa"
                    className="data-[state=active]:bg-[#003366] data-[state=active]:text-white data-[state=inactive]:text-[#565D6D]/50 font-bold"
                  >
                    Resultados de Aprendizaje (RAA)
                  </TabsTrigger>
                  <TabsTrigger
                    value="matriz"
                    className="data-[state=active]:bg-white data-[state=active]:text-[#171A1F] data-[state=inactive]:text-[#565D6D]/50"
                    onClick={() => router.push("/asignaturas/nueva/matriz-raa-ra")}
                  >
                    Matriz RAA vs RA
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg border border-[#DEE1E6] p-6 lg:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <h1 className="text-3xl font-semibold text-[#171A1F]">
                  Crear/Editar Resultados de Aprendizaje Asignatura (RAA)
                </h1>
                <Button 
                  className="bg-[#003366] hover:bg-[#002244] text-white gap-2"
                  onClick={() => setIsModalOpen(true)}
                  disabled={!asignaturaId}
                >
                  <Plus className="w-4 h-4" />
                  Nuevo RAA
                </Button>
              </div>

              {/* Table */}
              <div className="rounded-lg border border-[#DEE1E6] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F3F4F6] hover:bg-[#F3F4F6]">
                      <TableHead className="text-[#565D6D] font-normal w-24">
                        Código
                      </TableHead>
                      <TableHead className="text-[#565D6D] font-normal w-48">
                        Tipo
                      </TableHead>
                      <TableHead className="text-[#565D6D] font-normal">
                        Descripción
                      </TableHead>
                      <TableHead className="text-[#565D6D] font-normal text-center w-32">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-[#565D6D] py-8">
                          Cargando RAA...
                        </TableCell>
                      </TableRow>
                    ) : !asignaturaId ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-[#565D6D] py-8">
                          Debe crear una asignatura primero
                        </TableCell>
                      </TableRow>
                    ) : raas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-[#565D6D] py-8">
                          No se encontraron resultados de aprendizaje. Haga clic en "Nuevo RAA" para agregar uno.
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentRaas.map((raa) => (
                        <TableRow key={raa.id}>
                          <TableCell className="px-7 py-8 font-bold text-[#171A1F] text-center">
                            {raa.codigo}
                          </TableCell>
                          <TableCell className="px-7 py-8 text-[#565D6D] text-center">
                            {raa.tipo}
                          </TableCell>
                          <TableCell className="px-7 py-8 text-[#000000] text-center text-sm">
                            {raa.descripcion}
                          </TableCell>
                          <TableCell className="px-7 py-8">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-[#003366] hover:text-[#003366] hover:bg-[#F3F4F6]"
                                title="Editar RAA"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-[#DC3848] hover:text-[#DC3848] hover:bg-[#F3F4F6]"
                                title="Eliminar RAA"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {!loading && raas.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6">
                <Button
                  variant="outline"
                  onClick={() => router.push("/asignaturas")}
                  className="border-[#DEE1E6]"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <NewRaaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRaaCreated={handleRaaCreated}
          asignaturaId={asignaturaId || 0}
        />
      </Layout>
    </AcademicRoute>
  );
}

export default function ResultadosAprendizaje() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResultadosAprendizajeContent />
    </Suspense>
  );
}
