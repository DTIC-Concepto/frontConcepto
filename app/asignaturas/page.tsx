"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { AsignaturasService, Asignatura } from "@/lib/asignaturas";
import NotificationService from "@/lib/notifications";
import Pagination from "@/components/Pagination";

export default function Asignaturas() {
  const [searchQuery, setSearchQuery] = useState("");
  const [nivelReferencial, setNivelReferencial] = useState("");
  const [creditos, setCreditos] = useState("");
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch asignaturas from backend
  useEffect(() => {
    loadAsignaturas();
  }, []);

  const loadAsignaturas = async () => {
    try {
      setLoading(true);
      const data = await AsignaturasService.getAsignaturas(searchQuery);
      setAsignaturas(data);
    } catch (error) {
      console.error('Error cargando asignaturas:', error);
      NotificationService.error(
        'Error al cargar asignaturas',
        error instanceof Error ? error.message : 'Error desconocido'
      );
    } finally {
      setLoading(false);
    }
  };

  // Filtrar asignaturas localmente
  const filteredAsignaturas = asignaturas.filter((asignatura) => {
    const matchesSearch = 
      searchQuery === "" ||
      asignatura.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asignatura.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesNivel = 
      nivelReferencial === "" ||
      asignatura.nivelReferencial.toString() === nivelReferencial;
    
    const matchesCreditos = 
      creditos === "" ||
      asignatura.creditos.toString() === creditos;
    
    return matchesSearch && matchesNivel && matchesCreditos;
  });

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredAsignaturas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAsignaturas = filteredAsignaturas.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, nivelReferencial, creditos]);

  return (
    <AcademicRoute>
      <Layout>
        <div className="p-6 lg:p-12">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-4xl font-bold text-[#171A1F]">
                Asignaturas (PEA)
              </h1>
              <Link href="/asignaturas/nueva">
                <Button className="bg-[#003366] hover:bg-[#002244] text-white gap-2">
                  <Plus className="w-4 h-4" />
                  Nueva Asignatura
                </Button>
              </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-[#DEE1E6] p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#565D6D]" />
                  <Input
                    placeholder="Buscar por código o descripción..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-[#DEE1E6]"
                  />
                </div>

                <Select value={nivelReferencial} onValueChange={setNivelReferencial}>
                  <SelectTrigger className="lg:w-48 border-[#DEE1E6]">
                    <SelectValue placeholder="Nivel referencial" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Nivel 1</SelectItem>
                    <SelectItem value="2">Nivel 2</SelectItem>
                    <SelectItem value="3">Nivel 3</SelectItem>
                    <SelectItem value="4">Nivel 4</SelectItem>
                    <SelectItem value="5">Nivel 5</SelectItem>
                    <SelectItem value="6">Nivel 6</SelectItem>
                    <SelectItem value="7">Nivel 7</SelectItem>
                    <SelectItem value="8">Nivel 8</SelectItem>
                    <SelectItem value="9">Nivel 9</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={creditos} onValueChange={setCreditos}>
                  <SelectTrigger className="lg:w-48 border-[#DEE1E6]">
                    <SelectValue placeholder="Créditos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 créditos</SelectItem>
                    <SelectItem value="1">1 crédito</SelectItem>
                    <SelectItem value="2">2 créditos</SelectItem>
                    <SelectItem value="3">3 créditos</SelectItem>
                    <SelectItem value="4">4 créditos</SelectItem>
                    <SelectItem value="5">5 créditos</SelectItem>
                    <SelectItem value="6">6 créditos</SelectItem>
                    <SelectItem value="7">7 créditos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-[#DEE1E6] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F3F4F6] hover:bg-[#F3F4F6]">
                    <TableHead className="text-[#565D6D] font-normal">
                      Código
                    </TableHead>
                    <TableHead className="text-[#565D6D] font-normal">
                      Nombre de Asignatura
                    </TableHead>
                    <TableHead className="text-[#565D6D] font-normal text-center">
                      Unidad de Integración Curricular
                    </TableHead>
                    <TableHead className="text-[#565D6D] font-normal text-center">
                      Créditos
                    </TableHead>
                    <TableHead className="text-[#565D6D] font-normal text-center">
                      Nivel Referencial
                    </TableHead>
                    <TableHead className="text-[#565D6D] font-normal text-center">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-[#565D6D] py-8">
                        Cargando asignaturas...
                      </TableCell>
                    </TableRow>
                  ) : filteredAsignaturas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-[#565D6D] py-8">
                        No se encontraron asignaturas
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentAsignaturas.map((asignatura) => (
                      <TableRow key={asignatura.id}>
                        <TableCell className="px-7 py-8 font-bold text-[#171A1F]">
                          {asignatura.codigo}
                        </TableCell>
                        <TableCell className="px-7 py-8 text-[#565D6D]">
                          {asignatura.nombre}
                        </TableCell>
                        <TableCell className="px-7 py-8 text-center text-[#565D6D]">
                          {asignatura.unidadCurricular}
                        </TableCell>
                        <TableCell className="px-7 py-8 text-center text-[#565D6D]">
                          {asignatura.creditos}
                        </TableCell>
                        <TableCell className="px-7 py-8 text-center text-[#565D6D]">
                          {asignatura.nivelReferencial}
                        </TableCell>
                        <TableCell className="px-7 py-8">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-[#003366] hover:text-[#003366] hover:bg-[#F3F4F6]"
                              title="Editar asignatura"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-[#DC3848] hover:text-[#DC3848] hover:bg-[#F3F4F6]"
                              title="Eliminar asignatura"
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
            {!loading && filteredAsignaturas.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </Layout>
    </AcademicRoute>
  );
}
