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
    const response = await fetch(`${BACKEND_URL}/learning-outcomes`, {
      method: 'GET',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error Learning Outcomes:', response.status, data);
      return NextResponse.json(
        { error: data.error || data.message || 'Error al obtener resultados de aprendizaje' },
        { status: response.status }
      );
    }

    console.log('Learning Outcomes GET successful:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en proxy learning outcomes GET:', error);
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

    // Hacer la petición al backend
    const response = await fetch(`${BACKEND_URL}/learning-outcomes`, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || data.message || 'Error al crear resultado de aprendizaje' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en proxy learning outcomes POST:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}