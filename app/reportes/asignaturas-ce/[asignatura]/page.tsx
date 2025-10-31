"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AcademicRoute from "@/components/AcademicRoute";
import TrazabilidadLevelCard from "@/components/TrazabilidadLevelCard";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/auth";
import { UserCareerService } from "@/lib/user-career";
import NotificationService from "@/lib/notifications";

interface Raa {
  id: number;
  codigo: string;
  descripcion: string;
}

interface Ra {
  id: number;
  codigo: string;
  descripcion: string;
}

interface EurAce {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
}

interface TrazabilidadItem {
  raa: Raa;
  ra: Ra;
  justificacionRaaRa: string;
  eurAce: EurAce;
  justificacionRaEurace: string;
}

interface TrazabilidadData {
  asignatura: {
    id: number;
    codigo: string;
    nombre: string;
  };
  trazabilidad: {
    Alto: TrazabilidadItem[];
    Medio: TrazabilidadItem[];
    Bajo: TrazabilidadItem[];
  };
}

interface GroupedItem {
  raas: Array<{ codigo: string; descripcion: string }>;
  ra: Ra;
  justificacionRaaRa: string;
  eurAce: EurAce;
  justificacionRaEurace: string;
}

export default function Trazabilidad() {
  const params = useParams();
  const router = useRouter();
  const codigoAsignatura = params.asignatura as string;

  const [trazabilidadData, setTrazabilidadData] = useState<TrazabilidadData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [asignaturaId, setAsignaturaId] = useState<number | null>(null);
  const [nombreAsignatura, setNombreAsignatura] = useState<string>("");
  const [carreraId, setCarreraId] = useState<string>("");

  // Obtener carreraId de la URL o del usuario
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const carreraIdFromUrl = urlParams.get('carreraId');
    
    if (carreraIdFromUrl) {
      // CEI: usa el carreraId de la URL
      setCarreraId(carreraIdFromUrl);
    } else {
      // COORDINADOR/PROFESOR: usa su carreraId
      const userCarreraId = UserCareerService.getUserCarreraId();
      if (userCarreraId) {
        setCarreraId(userCarreraId.toString());
      }
    }
  }, []);

  useEffect(() => {
    if (carreraId) {
      loadTrazabilidad();
    }
  }, [codigoAsignatura, carreraId]);

  const loadTrazabilidad = async () => {
    try {
      setIsLoading(true);

      if (!carreraId) {
        NotificationService.error(
          'Error',
          'No se pudo obtener la información de la carrera'
        );
        return;
      }

      // Primero necesitamos obtener el ID de la asignatura desde el código
      // Usamos el endpoint de asignaturas para buscar por código
      const asignaturasResponse = await AuthService.authenticatedFetch(
        `/api/asignaturas?carreraId=${carreraId}&search=${codigoAsignatura}`
      );

      if (!asignaturasResponse.ok) {
        throw new Error('Error al buscar asignatura');
      }

      const asignaturasData = await asignaturasResponse.json();
      const asignaturas = asignaturasData.data || [];
      
      // Buscar la asignatura por código exacto
      const asignatura = asignaturas.find(
        (a: any) => a.codigo.toUpperCase() === codigoAsignatura.toUpperCase()
      );

      if (!asignatura) {
        NotificationService.error(
          'Error',
          'No se encontró la asignatura'
        );
        router.back();
        return;
      }

      setAsignaturaId(asignatura.id);
      setNombreAsignatura(asignatura.nombre || asignatura.codigo || codigoAsignatura);

      // Ahora cargar la trazabilidad con todos los niveles de aporte
      const url = `/api/reportes/trazabilidad-asignatura/${asignatura.id}?carreraId=${carreraId}&nivelesAporte=Alto&nivelesAporte=Medio&nivelesAporte=Bajo`;
      
      const response = await AuthService.authenticatedFetch(url);

      if (!response.ok) {
        throw new Error('Error al obtener trazabilidad');
      }

      const data = await response.json();
      console.log('Trazabilidad cargada:', data);
      setTrazabilidadData(data);
    } catch (error) {
      console.error('Error al cargar trazabilidad:', error);
      NotificationService.error(
        'Error',
        'No se pudo cargar la trazabilidad de la asignatura'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Función para agrupar items por RA + EUR-ACE
  const groupByRaAndEurAce = (items: TrazabilidadItem[]): GroupedItem[] => {
    const groups = new Map<string, GroupedItem>();

    items.forEach((item) => {
      const key = `${item.ra.codigo}-${item.eurAce.codigo}`;

      if (groups.has(key)) {
        const group = groups.get(key)!;
        group.raas.push({
          codigo: item.raa.codigo,
          descripcion: item.raa.descripcion,
        });
      } else {
        groups.set(key, {
          raas: [
            {
              codigo: item.raa.codigo,
              descripcion: item.raa.descripcion,
            },
          ],
          ra: item.ra,
          justificacionRaaRa: item.justificacionRaaRa,
          eurAce: item.eurAce,
          justificacionRaEurace: item.justificacionRaEurace,
        });
      }
    });

    return Array.from(groups.values());
  };

  if (isLoading) {
    return (
      <AcademicRoute>
        <Layout>
          <div className="p-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto mb-4"></div>
              <p className="text-[#565D6D]">Cargando trazabilidad...</p>
            </div>
          </div>
        </Layout>
      </AcademicRoute>
    );
  }

  if (!trazabilidadData) {
    return (
      <AcademicRoute>
        <Layout>
          <div className="p-8">
            <div className="bg-white rounded-[10px] border border-[#DEE1E6] shadow-sm p-6">
              <p className="text-[#565D6D]">No se pudo cargar la información de trazabilidad.</p>
              <Button
                variant="outline"
                className="border-[#DEE1E6] text-[#323234] mt-4"
                onClick={() => {
                  const urlParams = new URLSearchParams(window.location.search);
                  const queryString = urlParams.toString();
                  const targetUrl = queryString 
                    ? `/reportes/asignaturas-ce?${queryString}`
                    : '/reportes/asignaturas-ce';
                  router.push(targetUrl);
                }}
              >
                Regresar
              </Button>
            </div>
          </div>
        </Layout>
      </AcademicRoute>
    );
  }

  const { trazabilidad } = trazabilidadData;

  return (
    <AcademicRoute>
      <Layout>
        <div className="p-4 md:p-8 space-y-6">
          <div className="bg-white rounded-[10px] border border-[#DEE1E6] shadow-sm p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-[#323234] font-roboto text-xl md:text-2xl font-bold">
              Trazabilidad de {nombreAsignatura}
            </h1>
            <Button
              variant="outline"
              className="border-[#DEE1E6] text-[#323234] w-full md:w-auto"
              onClick={() => {
                // Construir URL con los parámetros preservados de la navegación anterior
                const urlParams = new URLSearchParams(window.location.search);
                const queryString = urlParams.toString();
                const targetUrl = queryString 
                  ? `/reportes/asignaturas-ce?${queryString}`
                  : '/reportes/asignaturas-ce';
                router.push(targetUrl);
              }}
            >
              Regresar
            </Button>
          </div>

          {/* Renderizar tarjetas por nivel de aporte */}
          {trazabilidad.Alto && trazabilidad.Alto.length > 0 && (
            groupByRaAndEurAce(trazabilidad.Alto).map((group, index) => (
              <TrazabilidadLevelCard
                key={`alto-${index}`}
                level="Alto"
                raas={group.raas}
                raTitle={`${group.ra.codigo}:`}
                raDescription={group.ra.descripcion}
                justificationTitle={`${group.ra.codigo} - Criterio ${group.eurAce.codigo}`}
                justificationDescription={group.justificacionRaEurace}
                criterionTitle={group.eurAce.codigo}
                criterionDescription={group.eurAce.descripcion}
              />
            ))
          )}

          {trazabilidad.Medio && trazabilidad.Medio.length > 0 && (
            groupByRaAndEurAce(trazabilidad.Medio).map((group, index) => (
              <TrazabilidadLevelCard
                key={`medio-${index}`}
                level="Medio"
                raas={group.raas}
                raTitle={`${group.ra.codigo}:`}
                raDescription={group.ra.descripcion}
                justificationTitle={`${group.ra.codigo} - Criterio ${group.eurAce.codigo}`}
                justificationDescription={group.justificacionRaEurace}
                criterionTitle={group.eurAce.codigo}
                criterionDescription={group.eurAce.descripcion}
              />
            ))
          )}

          {trazabilidad.Bajo && trazabilidad.Bajo.length > 0 && (
            groupByRaAndEurAce(trazabilidad.Bajo).map((group, index) => (
              <TrazabilidadLevelCard
                key={`bajo-${index}`}
                level="Bajo"
                raas={group.raas}
                raTitle={`${group.ra.codigo}:`}
                raDescription={group.ra.descripcion}
                justificationTitle={`${group.ra.codigo} - Criterio ${group.eurAce.codigo}`}
                justificationDescription={group.justificacionRaEurace}
                criterionTitle={group.eurAce.codigo}
                criterionDescription={group.eurAce.descripcion}
              />
            ))
          )}

          {/* Mensaje si no hay datos */}
          {(!trazabilidad.Alto || trazabilidad.Alto.length === 0) &&
           (!trazabilidad.Medio || trazabilidad.Medio.length === 0) &&
           (!trazabilidad.Bajo || trazabilidad.Bajo.length === 0) && (
            <div className="bg-white rounded-[10px] border border-[#DEE1E6] shadow-sm p-6 text-center">
              <p className="text-[#565D6D]">
                No hay datos de trazabilidad disponibles para esta asignatura.
              </p>
            </div>
          )}
        </div>
      </Layout>
    </AcademicRoute>
  );
}
