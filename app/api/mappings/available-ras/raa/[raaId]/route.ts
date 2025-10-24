import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backprueba-production-fdf6.up.railway.app';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ raaId: string }> }
) {
  try {
    const { raaId } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const carreraId = searchParams.get('carreraId');
    const tipo = searchParams.get('tipo');

    // Obtener el token de autorización del header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No autorizado - Token no proporcionado' },
        { status: 401 }
      );
    }

    // Construir URL con parámetros
    const url = new URL(`${BACKEND_URL}/mappings/available-ras/raa/${raaId}`);
    if (carreraId) url.searchParams.append('carreraId', carreraId);
    if (tipo) url.searchParams.append('tipo', tipo);

    console.log('Fetching available RAs:', url.toString());

    const backendResponse = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    if (!backendResponse.ok) {
      console.error(`Backend error: ${backendResponse.status} ${backendResponse.statusText}`);
      return NextResponse.json(
        { error: 'Error al obtener RAs disponibles' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en /api/mappings/available-ras/raa/[raaId]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
