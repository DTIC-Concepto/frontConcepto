import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backprueba-production-fdf6.up.railway.app/api';

export async function PUT(request: NextRequest) {
  try {
    // Obtener el token de autorización del header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    // Obtener los datos del cuerpo de la petición
    const body = await request.json();
    const { contrasenaActual, contrasenaNueva, confirmarContrasena } = body;

    // Validar que se proporcionen todos los campos requeridos
    if (!contrasenaActual || !contrasenaNueva || !confirmarContrasena) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar que las contraseñas coincidan
    if (contrasenaNueva !== confirmarContrasena) {
      return NextResponse.json(
        { error: 'Las contraseñas no coinciden' },
        { status: 400 }
      );
    }

    // Hacer la petición al backend
    const backendUrl = `${BACKEND_URL.replace('/api', '')}/usuarios/me/password`;
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        contrasenaActual,
        contrasenaNueva,
        confirmarContrasena,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: data.message || data.error || 'Error al cambiar contraseña',
          details: data.details || undefined,
          backendStatus: response.status
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { 
        message: data.message || 'Contraseña actualizada exitosamente',
        success: true
      },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: 'Ha ocurrido un error inesperado',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}