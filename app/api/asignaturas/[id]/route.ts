import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authorization = request.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('PATCH /api/asignaturas/[id] - ID:', id);
    console.log('PATCH /api/asignaturas/[id] - Body recibido:', JSON.stringify(body, null, 2));

    // El backend PATCH solo acepta estos 8 campos, NO acepta carreraIds ni estadoActivo
    const backendPayload = {
      codigo: body.codigo,
      nombre: body.nombre,
      creditos: body.creditos,
      descripcion: body.descripcion,
      tipoAsignatura: body.tipoAsignatura,
      unidadCurricular: body.unidadCurricular,
      pensum: body.pensum,
      nivelReferencial: body.nivelReferencial,
    };
    console.log('PATCH /api/asignaturas/[id] - Payload al backend (filtrado):', JSON.stringify(backendPayload, null, 2));

    const backendUrl = `${BACKEND_URL}/asignaturas/${id}`;
    console.log('PATCH /api/asignaturas/[id] - Backend URL:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
    });

    console.log('PATCH /api/asignaturas/[id] - Response status:', response.status);

    const data = await response.json().catch(() => null);
    console.log('PATCH /api/asignaturas/[id] - Response data:', data);

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `Error ${response.status}: ${response.statusText}`;
      console.error('PATCH /api/asignaturas/[id] - Error:', errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en proxy asignaturas PATCH:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
