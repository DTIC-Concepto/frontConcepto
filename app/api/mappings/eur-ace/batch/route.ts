import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    // Obtener token de autorización del header
    const authorization = request.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    // Obtener el cuerpo de la petición
    const body = await request.json();
    
    console.log('Mappings EUR-ACE batch request:', body);

    // Hacer la petición al backend
    const response = await fetch(`${BACKEND_URL}/mappings/ra-eur-ace/batch`, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error mappings EUR-ACE:', response.status, data);
      return NextResponse.json(
        { error: data.error || data.message || 'Error al crear mapping EUR-ACE' },
        { status: response.status }
      );
    }

    console.log('Mappings EUR-ACE batch successful:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en proxy mappings EUR-ACE batch:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}