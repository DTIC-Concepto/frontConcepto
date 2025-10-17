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

  // Obtener carreraId, tipo y search del query string
  const { searchParams } = new URL(request.url);
  const carreraId = searchParams.get('carreraId');
  const tipo = searchParams.get('tipo') || 'GENERAL';
  const search = searchParams.get('search') || '';

    let allData: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      // Construir la URL con carreraId, tipo y search
      let backendUrl = `${BACKEND_URL}/learning-outcomes?page=${page}`;
      if (carreraId) {
        backendUrl += `&carreraId=${encodeURIComponent(carreraId)}`;
      }
      if (tipo) {
        backendUrl += `&tipo=${encodeURIComponent(tipo)}`;
      }
      if (search) {
        backendUrl += `&search=${encodeURIComponent(search)}`;
      }
      const response = await fetch(backendUrl, {
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

      // El backend devuelve {data: Array, total: number, ...}
      if (data && Array.isArray(data.data)) {
        allData = [...allData, ...data.data];
        // Verificar si hay más páginas
        const total = data.total || 0;
        const currentCount = allData.length;
        hasMore = currentCount < total;
        page++;
        console.log(`Learning Outcomes página ${page - 1}: ${data.data.length} items, total acumulado: ${currentCount}/${total}`);
      } else if (Array.isArray(data)) {
        // Si el backend devuelve directamente un array
        allData = data;
        hasMore = false;
      } else {
        hasMore = false;
      }

      // Límite de seguridad para evitar loops infinitos
      if (page > 100) {
        console.warn('Learning Outcomes: Límite de páginas alcanzado');
        break;
      }
    }

    console.log('Learning Outcomes GET successful: Total de', allData.length, 'resultados');
    
    // Devolver en el mismo formato que el backend
    return NextResponse.json({
      data: allData,
      total: allData.length
    });
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