import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Obtener token de autorización del header
    const authorization = request.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Hacer la petición al backend
    const response = await fetch(`${BACKEND_URL}/mappings/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: 'Error desconocido' }));
      console.error('Backend error mapping DELETE:', response.status, data);
      return NextResponse.json(
        { error: data.error || data.message || 'Error al eliminar mapping' },
        { status: response.status }
      );
    }

    console.log('Mapping DELETE successful:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en proxy mapping DELETE:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Obtener token de autorización del header
    const authorization = request.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Hacer la petición al backend
    const response = await fetch(`${BACKEND_URL}/mappings/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error mapping PUT:', response.status, data);
      return NextResponse.json(
        { error: data.error || data.message || 'Error al actualizar mapping' },
        { status: response.status }
      );
    }

    console.log('Mapping PUT successful:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en proxy mapping PUT:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}