import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    // Obtener token de autorización del header
    const authorization = request.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    // Hacer la petición al backend
    const response = await fetch(`${BACKEND_URL}/mappings/opp-ra`, {
      method: 'GET',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error mappings OPP-RA GET:', response.status, data);
      return NextResponse.json(
        { error: data.error || data.message || 'Error al obtener mappings OPP-RA' },
        { status: response.status }
      );
    }

    console.log('Mappings OPP-RA GET successful:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en proxy mappings OPP-RA GET:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}