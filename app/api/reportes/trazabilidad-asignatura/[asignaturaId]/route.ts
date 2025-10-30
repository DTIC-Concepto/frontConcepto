import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ asignaturaId: string }> }
) {
  try {
    const { asignaturaId } = await params;
    
    // Obtener el token de autorización
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener parámetros de query
    const searchParams = request.nextUrl.searchParams;
    const carreraId = searchParams.get('carreraId');
    const nivelesAporte = searchParams.getAll('nivelesAporte');

    if (!carreraId) {
      return NextResponse.json(
        { error: 'carreraId es requerido' },
        { status: 400 }
      );
    }

    // Construir URL del backend
    const backendUrl = new URL(
      `${BACKEND_URL}/reportes/trazabilidad-asignatura/${asignaturaId}`
    );
    
    // Agregar parámetros
    backendUrl.searchParams.append('carreraId', carreraId);
    nivelesAporte.forEach(nivel => {
      backendUrl.searchParams.append('nivelesAporte', nivel);
    });

    console.log('Llamando al backend (trazabilidad):', backendUrl.toString());

    // Hacer la petición al backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error del backend:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.error || errorData.message || 'Error al obtener trazabilidad' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Datos de trazabilidad recibidos:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en API route trazabilidad-asignatura:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
