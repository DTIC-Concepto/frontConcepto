import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ carreraId: string }> }
) {
  try {
    // Obtener token de autorización del header
    const authorization = request.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const { carreraId } = await params;

    // Hacer la petición al backend
    const response = await fetch(`${BACKEND_URL}/mappings/ra-eur-ace/matrix/${carreraId}`, {
      method: 'GET',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error mappings EUR-ACE matrix GET:', response.status, data);
      return NextResponse.json(
        { error: data.error || data.message || 'Error al obtener mappings EUR-ACE de la matriz' },
        { status: response.status }
      );
    }

    console.log('Mappings EUR-ACE matrix GET successful:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en proxy mappings EUR-ACE matrix GET:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}