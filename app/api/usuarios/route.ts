import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://backprueba-production-fdf6.up.railway.app';

// GET - Obtener usuarios con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de consulta (filtros)
    const { searchParams } = new URL(request.url);
    const rol = searchParams.get('rol');
    const estadoActivo = searchParams.get('estadoActivo');
    const search = searchParams.get('search');

    // Construir URL con parámetros
    const params = new URLSearchParams();
    if (rol) params.append('rol', rol);
    if (estadoActivo !== null) params.append('estadoActivo', estadoActivo);
    if (search) params.append('search', search);

    const queryString = params.toString();
    const url = `${API_BASE_URL}/usuarios${queryString ? `?${queryString}` : ''}`;

    // Obtener token de autorización
    const authorization = request.headers.get('authorization');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization && { 'Authorization': authorization }),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al obtener usuarios' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en proxy GET usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Obtener token de autorización
    const authorization = request.headers.get('authorization');
    
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization && { 'Authorization': authorization }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al crear usuario' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error en proxy POST usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}