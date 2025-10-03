import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backprueba-production-fdf6.up.railway.app/api';

export async function GET(request: NextRequest) {
  try {
    // Obtener el token de autorización del header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    // Construir URL del backend
    const backendUrl = `${BACKEND_URL.replace('/api', '')}/usuarios/me`;
    
    // Intentar obtener el perfil del endpoint /usuarios/me
    let response;
    try {
      response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });
    } catch (fetchError) {
      return NextResponse.json(
        { error: 'Endpoint de perfil no disponible', needsClientSideData: true },
        { status: 503 }
      );
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      
      // Si el endpoint devuelve 404, significa que no está implementado
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Endpoint de perfil no implementado', needsClientSideData: true },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Error al obtener perfil de usuario', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}