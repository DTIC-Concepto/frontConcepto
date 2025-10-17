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

    // Obtener token de autorización
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

    while (hasMore) {
      // Construir URL con parámetros
      const params = new URLSearchParams();
      if (rol) params.append('rol', rol);
      if (estadoActivo !== null) params.append('estadoActivo', estadoActivo);
      if (search) params.append('search', search);
      params.append('page', page.toString());

      const queryString = params.toString();
      const url = `${API_BASE_URL}/usuarios?${queryString}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': authorization,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { error: data.message || 'Error al obtener usuarios' },
          { status: response.status }
        );
      }

      // El backend puede devolver {data: Array, total: number} o Array directamente
      if (data && Array.isArray(data.data)) {
        allData = [...allData, ...data.data];
        
        const total = data.total || 0;
        const currentCount = allData.length;
        hasMore = currentCount < total;
        page++;
        
        console.log(`Usuarios página ${page - 1}: ${data.data.length} items, total acumulado: ${currentCount}/${total}`);
      } else if (Array.isArray(data)) {
        // Si el backend devuelve directamente un array (sin paginación)
        allData = data;
        hasMore = false;
      } else {
        hasMore = false;
      }

      // Límite de seguridad
      if (page > 100) {
        console.warn('Usuarios: Límite de páginas alcanzado');
        break;
      }
    }

    // Asegurar que cada usuario tenga la información de roles correctamente estructurada
    const processedData = allData.map(user => {
      // Si el usuario tiene múltiples roles, asegurar que estén en el formato correcto
      if (user.roles && Array.isArray(user.roles)) {
        return {
          ...user,
          // Mantener compatibilidad con el campo 'rol' para el rol principal
          rol: user.rolPrincipal || user.rol || (user.roles.length > 0 ? user.roles[0].rol : 'PROFESOR')
        };
      }
      return user;
    });

    console.log('Usuarios GET successful: Total de', processedData.length, 'usuarios');

    return NextResponse.json(processedData);
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