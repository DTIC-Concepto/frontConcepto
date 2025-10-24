import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backprueba-production-fdf6.up.railway.app';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ asignaturaId: string; carreraId: string }> }
) {
  try {
    const { asignaturaId, carreraId } = await params;
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    console.log('=== GET /api/mappings/raa-ra/matrix ===');
    console.log('asignaturaId:', asignaturaId);
    console.log('carreraId:', carreraId);
    console.log('Backend URL:', `${BACKEND_URL}/mappings/raa-ra/matrix/${asignaturaId}/${carreraId}`);

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const response = await fetch(
      `${BACKEND_URL}/mappings/raa-ra/matrix/${asignaturaId}/${carreraId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error del backend:', errorText);
      return NextResponse.json(
        { error: `Error del backend: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Datos recibidos del backend:');
    console.log('- RAAs count:', data.raas?.length || 0);
    console.log('- RAs count:', data.ras?.length || 0);
    console.log('- Mappings count:', data.mappings?.length || 0);
    
    if (data.ras && data.ras.length > 0) {
      console.log('Ejemplo de RA:', JSON.stringify(data.ras[0], null, 2));
    }
    if (data.raas && data.raas.length > 0) {
      console.log('Ejemplo de RAA:', JSON.stringify(data.raas[0], null, 2));
    }
    if (data.mappings && data.mappings.length > 0) {
      console.log('Ejemplo de mapping:', JSON.stringify(data.mappings[0], null, 2));
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en GET /api/mappings/raa-ra/matrix:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
