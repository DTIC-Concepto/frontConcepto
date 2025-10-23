"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AsignaturasService } from "@/lib/asignaturas";
import NotificationService from "@/lib/notifications";

export default function AsignaturaForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    unidadCurricular: "",
    tipoAsignatura: "",
    pensum: "",
    creditos: "",
    nivelReferencial: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Obtener carreraId directamente del usuario en localStorage
    let carreraId: number | null = null;
    try {
      const rawUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
      if (rawUser) {
        try {
          const parsedUser = JSON.parse(rawUser);
          carreraId = parsedUser?.carrera?.id ?? parsedUser?.carreraId ?? null;
        } catch (e) {
          console.error('Error al parsear usuario:', e);
        }
      }
    } catch (e) {
      console.error('Error accediendo a localStorage:', e);
    }
    
    if (!carreraId) {
      NotificationService.error(
        'Error',
        'No se encontró información de la carrera del usuario'
      );
      return;
    }

    // Preparar datos para el POST
    const asignaturaData = {
      codigo: formData.codigo.trim(),
      nombre: formData.nombre.trim(),
      creditos: parseInt(formData.creditos),
      descripcion: formData.descripcion.trim(),
      tipoAsignatura: formData.tipoAsignatura,
      unidadCurricular: formData.unidadCurricular,
      pensum: parseInt(formData.pensum),
      nivelReferencial: parseInt(formData.nivelReferencial),
      carreraIds: [carreraId],
      estadoActivo: true,
    };

    // Validar datos
    const errors = AsignaturasService.validateAsignatura(asignaturaData);
    if (errors.length > 0) {
      NotificationService.error(
        'Error de validación',
        errors.join(', ')
      );
      return;
    }

    try {
      setLoading(true);
      const createdAsignatura = await AsignaturasService.createAsignatura(asignaturaData);
      
      // Guardar ID de la asignatura creada para usarlo en la pestaña de RAA
      if (createdAsignatura.id) {
        localStorage.setItem('current_asignatura_id', createdAsignatura.id.toString());
      }
      
      NotificationService.success(
        'Asignatura creada',
        'La asignatura se ha creado exitosamente'
      );
      
      // Limpiar formulario
      setFormData({
        codigo: "",
        nombre: "",
        descripcion: "",
        unidadCurricular: "",
        tipoAsignatura: "",
        pensum: "",
        creditos: "",
        nivelReferencial: "",
      });
    } catch (error) {
      console.error('Error creando asignatura:', error);
      NotificationService.error(
        'Error al crear asignatura',
        error instanceof Error ? error.message : 'Error desconocido'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AcademicRoute>
      <Layout>
        <div className="p-6 lg:p-12">
          <div className="max-w-7xl mx-auto">
            {/* Tabs */}
            <div className="bg-[#F3F4F6] rounded-lg p-1 mb-6">
              <Tabs value="pea" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-transparent gap-1">
                  <TabsTrigger
                    value="pea"
                    className="data-[state=active]:bg-[#003366] data-[state=active]:text-white data-[state=inactive]:text-[#565D6D]/50 font-bold"
                  >
                    Asignatura (PEA)
                  </TabsTrigger>
                  <TabsTrigger
                    value="raa"
                    className="data-[state=active]:bg-white data-[state=active]:text-[#171A1F] data-[state=inactive]:text-[#565D6D]/50"
                    onClick={() => router.push("/asignaturas/nueva/resultados")}
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

            {/* Form */}
            <div className="bg-white rounded-lg border border-[#DEE1E6] p-6 lg:p-8">
              <h1 className="text-3xl font-semibold text-[#171A1F] mb-2">
                Crear/Editar Asignatura (PEA)
              </h1>
              <p className="text-sm text-[#565D6D] mb-8">
                Complete los campos a continuación para registrar o modificar los
                detalles de una asignatura en el plan de estudios. Todos los campos
                son obligatorios para asegurar la consistencia de la información
                académica.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Código */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="codigo"
                      className="text-sm font-medium text-[#171A1F]"
                    >
                      Código*
                    </Label>
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      onChange={(e) =>
                        setFormData({ ...formData, codigo: e.target.value })
                      }
                      className="border-[#DEE1E6]"
                      required
                    />
                  </div>

                  {/* Nombre */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="nombre"
                      className="text-sm font-medium text-[#171A1F]"
                    >
                      Nombre*
                    </Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                      className="border-[#DEE1E6]"
                      required
                    />
                  </div>

                  {/* Unidad de integración curricular */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="unidadCurricular"
                      className="text-sm font-medium text-[#171A1F]"
                    >
                      Unidad de integración curricular*
                    </Label>
                    <Select
                      value={formData.unidadCurricular}
                      onValueChange={(value) =>
                        setFormData({ ...formData, unidadCurricular: value })
                      }
                      required
                    >
                      <SelectTrigger className="border-[#DEE1E6]">
                        <SelectValue placeholder="Seleccione una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Unidad Básica">Unidad Básica</SelectItem>
                        <SelectItem value="Unidad Profesional">
                          Unidad Profesional
                        </SelectItem>
                        <SelectItem value="Unidad de Integración Curricular">
                          Unidad de Integración Curricular
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tipo de asignatura */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="tipoAsignatura"
                      className="text-sm font-medium text-[#171A1F]"
                    >
                      Tipo de asignatura*
                    </Label>
                    <Select
                      value={formData.tipoAsignatura}
                      onValueChange={(value) =>
                        setFormData({ ...formData, tipoAsignatura: value })
                      }
                      required
                    >
                      <SelectTrigger className="border-[#DEE1E6]">
                        <SelectValue placeholder="Seleccione una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Obligatoria">Obligatoria</SelectItem>
                        <SelectItem value="Itinerario">Itinerario</SelectItem>
                        <SelectItem value="Extracurricular">Extracurricular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pensum */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="pensum"
                      className="text-sm font-medium text-[#171A1F]"
                    >
                      Pensum*
                    </Label>
                    <Select
                      value={formData.pensum}
                      onValueChange={(value) =>
                        setFormData({ ...formData, pensum: value })
                      }
                      required
                    >
                      <SelectTrigger className="border-[#DEE1E6]">
                        <SelectValue placeholder="Seleccione un año" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                        <SelectItem value="2021">2021</SelectItem>
                        <SelectItem value="2020">2020</SelectItem>
                        <SelectItem value="2019">2019</SelectItem>
                        <SelectItem value="2018">2018</SelectItem>
                        <SelectItem value="2017">2017</SelectItem>
                        <SelectItem value="2016">2016</SelectItem>
                        <SelectItem value="2015">2015</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Numero de créditos */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="creditos"
                      className="text-sm font-medium text-[#171A1F]"
                    >
                      Numero de créditos*
                    </Label>
                    <Input
                      id="creditos"
                      type="number"
                      min="1"
                      value={formData.creditos}
                      onChange={(e) =>
                        setFormData({ ...formData, creditos: e.target.value })
                      }
                      className="border-[#DEE1E6]"
                      required
                    />
                  </div>

                  {/* Nivel Referencial */}
                  <div className="space-y-2 lg:col-span-2">
                    <Label
                      htmlFor="nivelReferencial"
                      className="text-sm font-medium text-[#171A1F]"
                    >
                      Nivel Referencial*
                    </Label>
                    <Select
                      value={formData.nivelReferencial}
                      onValueChange={(value) =>
                        setFormData({ ...formData, nivelReferencial: value })
                      }
                      required
                    >
                      <SelectTrigger className="border-[#DEE1E6] lg:w-64">
                        <SelectValue placeholder="Seleccione un nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="7">7</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="9">9</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Descripción */}
                  <div className="space-y-2 lg:col-span-2">
                    <Label
                      htmlFor="descripcion"
                      className="text-sm font-medium text-[#171A1F]"
                    >
                      Descripción*
                    </Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) =>
                        setFormData({ ...formData, descripcion: e.target.value })
                      }
                      className="border-[#DEE1E6]"
                      rows={4}
                      placeholder="Descripción de la asignatura"
                      required
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/asignaturas")}
                    className="border-[#DEE1E6]"
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    </AcademicRoute>
  );
}
