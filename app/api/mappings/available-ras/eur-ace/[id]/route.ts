// app/api/mappings/available-ras/eur-ace/[id]/route.ts
import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api';

export async function GET(
  request: Request,
  ctx: RouteContext<'/api/mappings/available-ras/eur-ace/[id]'>
) {
  try {
    const { id: eurAceId } = await ctx.params; // 👈 params es async en v15

    const authorization = request.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const carreraId = searchParams.get('carreraId');
    if (!carreraId) {
      return NextResponse.json(
        { error: 'carreraId requerido' },
        { status: 400 }
      );
    }

    const backendUrl =
      `${BACKEND_URL}/mappings/available-ras/eur-ace/` +
      `${encodeURIComponent(eurAceId)}?carreraId=${encodeURIComponent(carreraId)}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        Authorization: authorization,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || data.message || 'Error al obtener RAs disponibles para EUR-ACE' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en proxy available-ras/eur-ace GET:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
