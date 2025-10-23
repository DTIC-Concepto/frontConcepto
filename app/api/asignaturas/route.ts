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

    // Obtener carreraId y search del query string
    const { searchParams } = new URL(request.url);
    const carreraId = searchParams.get('carreraId');
    const search = searchParams.get('search') || '';

    // Construir la URL sin paginación - el backend de asignaturas no acepta 'page'
    let backendUrl = `${BACKEND_URL}/asignaturas?`;
    const params: string[] = [];
    
    if (carreraId) {
      params.push(`carreraId=${encodeURIComponent(carreraId)}`);
    }
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    
    backendUrl += params.join('&');

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || data.message || 'Error al obtener asignaturas' },
        { status: response.status }
      );
    }
    
    // El backend puede devolver directamente un array o un objeto {data: Array, total: number}
    if (Array.isArray(data)) {
      return NextResponse.json({
        data: data,
        total: data.length
      });
    } else if (data && Array.isArray(data.data)) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json({
        data: [],
        total: 0
      });
    }
  } catch (error) {
    console.error('Error en proxy asignaturas GET:', error);
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
    const response = await fetch(`${BACKEND_URL}/asignaturas`, {
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
        { error: data.error || data.message || 'Error al crear asignatura' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en proxy asignaturas POST:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
