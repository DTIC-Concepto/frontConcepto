import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    // Extraer parámetros de query de la request
    const { searchParams } = new URL(request.url);
    
    // Obtener el token del header de autorización
    const authorization = request.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    // Hacer peticiones iterativas para obtener todos los datos
    let allData: any[] = [];
    let page = 1;
    let hasMore = true;

    // Construir parámetros base (sin page, lo añadiremos dinámicamente)
    const baseParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== 'page' && key !== 'limit') { // Excluir page y limit
        baseParams.append(key, value);
      }
    });

    while (hasMore) {
      // Crear parámetros para esta iteración
      const urlParams = new URLSearchParams(baseParams);
      urlParams.append('page', page.toString());
      
      const backendUrl = `${BACKEND_URL}/facultades?${urlParams.toString()}`;
      
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Authorization': authorization,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error facultades:', response.status, errorText);
        return NextResponse.json(
          { error: 'Error al obtener facultades del backend' },
          { status: response.status }
        );
      }

      const data = await response.json();

      // El backend devuelve {data: Array, total: number, ...}
      if (data && Array.isArray(data.data)) {
        allData = [...allData, ...data.data];
        
        // Verificar si hay más páginas
        const total = data.total || 0;
        const currentCount = allData.length;
        hasMore = currentCount < total;
        page++;
        
        console.log(`Facultades página ${page - 1}: ${data.data.length} items, total acumulado: ${currentCount}/${total}`);
      } else if (Array.isArray(data)) {
        // Si el backend devuelve directamente un array
        allData = data;
        hasMore = false;
      } else {
        hasMore = false;
      }

      // Límite de seguridad
      if (page > 100) {
        console.warn('Facultades: Límite de páginas alcanzado');
        break;
      }
    }

    console.log('Facultades GET successful: Total de', allData.length, 'facultades');
    
    // Devolver en el mismo formato que el backend
    return NextResponse.json({
      data: allData,
      total: allData.length
    });

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