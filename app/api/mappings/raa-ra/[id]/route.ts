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
    console.log('PATCH /api/mappings/raa-ra/[id] - ID:', id);
    console.log('PATCH /api/mappings/raa-ra/[id] - Body:', JSON.stringify(body, null, 2));

    const backendUrl = `${BACKEND_URL}/mappings/raa-ra/${id}`;
    console.log('PATCH /api/mappings/raa-ra/[id] - Backend URL:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nivelAporte: body.nivelAporte,
        justificacion: body.justificacion,
        estadoActivo: true
      }),
    });

    console.log('PATCH /api/mappings/raa-ra/[id] - Response status:', response.status);

    const data = await response.json().catch(() => null);
    console.log('PATCH /api/mappings/raa-ra/[id] - Response data:', data);

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `Error ${response.status}: ${response.statusText}`;
      console.error('PATCH /api/mappings/raa-ra/[id] - Error:', errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en proxy mappings/raa-ra PATCH:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    console.log('DELETE /api/mappings/raa-ra/[id] - ID:', id);

    const backendUrl = `${BACKEND_URL}/mappings/raa-ra/${id}`;
    console.log('DELETE /api/mappings/raa-ra/[id] - Backend URL:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
    });

    console.log('DELETE /api/mappings/raa-ra/[id] - Response status:', response.status);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const errorMessage = data?.error || data?.message || `Error ${response.status}: ${response.statusText}`;
      console.error('DELETE /api/mappings/raa-ra/[id] - Error:', errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en proxy mappings/raa-ra DELETE:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
