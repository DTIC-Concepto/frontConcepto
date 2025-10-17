// app/api/mappings/opp-ra/matrix/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carreraId } = await params; // 👈 await a params

    const authorization = request.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const backendUrl = `${BACKEND_URL}/mappings/opp-ra/matrix/${encodeURIComponent(carreraId)}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        Authorization: authorization,
        Accept: 'application/json', // Content-Type no es necesario en GET
      },
      cache: 'no-store', // opcional
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || data.message || 'Error al obtener matriz OPP-RA' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en proxy OPP-RA matrix GET:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
