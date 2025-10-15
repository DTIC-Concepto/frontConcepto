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
    const response = await fetch(`${BACKEND_URL}/eur-ace-criteria`, {
      method: 'GET',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error EUR-ACE:', response.status, data);
      return NextResponse.json(
        { error: data.error || data.message || 'Error al obtener criterios EUR-ACE' },
        { status: response.status }
      );
    }

    console.log('EUR-ACE GET successful:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en proxy EUR-ACE criteria GET:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

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
    console.log('Proxy POST EUR-ACE - Datos recibidos:', body);

    // Hacer la petición al backend
    const response = await fetch(`${BACKEND_URL}/eur-ace-criteria`, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('Proxy POST EUR-ACE - Respuesta del backend:', response.status, data);

    if (!response.ok) {
      console.error('Backend error EUR-ACE POST:', response.status, data);
      return NextResponse.json(
        { error: data.error || data.message || 'Error al crear criterio EUR-ACE' },
        { status: response.status }
      );
    }

    console.log('EUR-ACE POST successful:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en proxy EUR-ACE criteria POST:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}