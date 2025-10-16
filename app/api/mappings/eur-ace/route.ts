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

    // Obtener los parámetros de query del request
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    // Construir la URL del backend con los parámetros de query
    const backendUrl = `${BACKEND_URL}/mappings/ra-eur-ace${queryString ? `?${queryString}` : ''}`;

    // Hacer la petición al backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error mappings EUR-ACE GET:', response.status, data);
      return NextResponse.json(
        { error: data.error || data.message || 'Error al obtener mappings EUR-ACE' },
        { status: response.status }
      );
    }

    console.log('Mappings EUR-ACE GET successful:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en proxy mappings EUR-ACE GET:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}