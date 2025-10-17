// app/api/mappings/available-ras/opp/[id]/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: oppId } = await params; // 👈 await a params (es Promise en Next 15)

    const authorization = request.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const backendUrl = `${BACKEND_URL}/mappings/available-ras/opp/${encodeURIComponent(oppId)}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        Authorization: authorization,
        Accept: 'application/json',
      },
      cache: 'no-store', // opcional
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || data.message || 'Error al obtener RAs disponibles' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en proxy available-ras GET:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
