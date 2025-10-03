import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    // Extraer parámetros de query de la request
    const { searchParams } = new URL(request.url);
    const urlParams = new URLSearchParams();
    
    // Agregar parámetros de filtrado si existen
    searchParams.forEach((value, key) => {
      urlParams.append(key, value);
    });

    // Construir la URL del backend
    const backendUrl = `${BACKEND_URL}/facultades${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
    
    // Obtener el token del header de autorización
    const authorization = request.headers.get('authorization');
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization && { 'Authorization': authorization }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Error al obtener facultades del backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en proxy de facultades:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Obtener el token del header de autorización
    const authorization = request.headers.get('authorization');
    
    const response = await fetch(`${BACKEND_URL}/facultades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization && { 'Authorization': authorization }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      
      // Intentar parsear el error del backend
      let errorMessage = 'Error al crear facultad';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // Si no se puede parsear, usar el mensaje por defecto
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en proxy de facultades (POST):', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}