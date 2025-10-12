import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api';

const API_BASE_URL = 'https://backprueba-production-fdf6.up.railway.app';

// GET - Obtener usuarios con información completa de roles
export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de consulta (filtros)
    const { searchParams } = new URL(request.url);
    const rol = searchParams.get('rol');
    const estadoActivo = searchParams.get('estadoActivo');
    const search = searchParams.get('search');

    // Construir URL con parámetros para el endpoint estándar
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

    // Para usuarios creados con el nuevo sistema multi-rol, 
    // el backend debería incluir la información de roles en la respuesta estándar
    // Por ahora, simplemente devolvemos los datos tal como vienen del backend
    // y agregamos compatibilidad en el frontend
    
    const processedUsers = data.map((user: any) => {
      // Si el usuario ya tiene roles múltiples, mantenerlos
      if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
        return user;
      }
      
      // Si no hay roles múltiples pero hay rol principal, crear array de roles
      if (user.rol) {
        return {
          ...user,
          roles: [{ rol: user.rol, observaciones: '' }]
        };
      }

      // Si no hay información de rol, usar rol por defecto
      return {
        ...user,
        roles: [{ rol: 'PROFESOR', observaciones: '' }]
      };
    });

    return NextResponse.json(processedUsers);
  } catch (error) {
    console.error('Error en proxy GET usuarios con roles:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}