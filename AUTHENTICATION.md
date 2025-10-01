# Sistema de Autenticación - Poliacredita

## Configuración de la API

El sistema está configurado para conectarse con el backend en Railway a través de un proxy de Next.js para evitar problemas de CORS.

- **Archivo principal de configuración**: `lib/api.ts`
- **Backend URL**: `https://backprueba-production-fdf6.up.railway.app`
- **Proxy local**: `/app/api/auth/login/route.ts`

### Arquitectura del Sistema

```
Frontend (Next.js) → Proxy (/api/auth/login) → Backend (Railway)
```

**¿Por qué usar un proxy?**
- Evita problemas de CORS
- Mantiene las credenciales seguras
- Permite manejar errores de forma centralizada

### Cambiar URL de la API

Para cambiar la URL del backend, modifica el archivo `/app/api/auth/login/route.ts`:

```typescript
const API_BASE_URL = 'https://tu-nueva-url-backend.com'; // Cambiar aquí
```

## Funcionalidades Implementadas

### 1. **Sistema de Login**
- Formulario de login con validación
- Campos: email, contraseña, rol
- Integración con API backend via proxy `/api/auth/login`
- Almacenamiento seguro del token en localStorage
- Notificaciones de éxito/error personalizadas (compatible con React 19)

### 2. **Gestión de Tokens**
- Almacenamiento automático del `access_token` en localStorage
- Headers de autorización automáticos para peticiones autenticadas
- Logout automático en caso de token expirado (401)
- Funciones de utilidad para verificar autenticación

### 3. **Protección de Rutas**
- Componente `ProtectedRoute` que envuelve páginas privadas
- Verificación automática de autenticación
- Redirección automática al login si no está autenticado
- Loading state durante verificación

### 4. **Notificaciones Personalizadas**
- Sistema de notificaciones reutilizable usando Tailwind CSS
- **Compatible con React 19** y Next.js 15
- Tipos: success, error, warning, info
- Posición: esquina superior derecha
- Iconos y estilos elegantes
- Auto-dismiss configurable
- Botón de cerrar manual

## Solución de Problemas Resueltos

### ❌ Error "Failed to fetch" (CORS)
**Causa**: El navegador bloqueaba peticiones directas al backend externo
**Solución**: Proxy de Next.js que actúa como intermediario

### ❌ Error Ant Design incompatible con React 19
**Causa**: Ant Design v5 no soporta React 19
**Solución**: Sistema de notificaciones personalizado con Tailwind CSS

## Cómo Usar

### Para Login:
1. Visita la página principal (`http://localhost:3000`)
2. Completa los campos: email, contraseña, rol
3. El sistema validará las credenciales con el backend
4. Si son correctas, serás redirigido al dashboard
5. Si son incorrectas, verás una notificación de error elegante

### Para Logout:
1. En cualquier página autenticada, haz clic en el botón de logout
2. El sistema limpiará el token y te redirigirá al login
3. Verás una notificación de confirmación

### Para Desarrolladores:

#### Hacer peticiones autenticadas:
```typescript
import { AuthService } from '@/lib/auth';

// Usando el wrapper
const response = await AuthService.authenticatedFetch('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data),
});

// O manualmente
const token = AuthService.getToken();
const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});
```

#### Usar notificaciones:
```typescript
import NotificationService from '@/lib/notifications';

// Éxito
NotificationService.success('Título', 'Descripción');

// Error
NotificationService.error('Error', 'Mensaje de error');

// Advertencia
NotificationService.warning('Advertencia', 'Mensaje');

// Información
NotificationService.info('Info', 'Mensaje informativo');
```

#### Agregar notificaciones a cualquier página:
```typescript
import { NotificationContainer } from '@/lib/notifications';

// Ya está incluido en el layout principal, pero si necesitas usarlo en otra parte:
export default function MyPage() {
  return (
    <div>
      {/* Tu contenido */}
      <NotificationContainer />
    </div>
  );
}
```

## Estructura de Archivos

```
lib/
├── api.ts              # Configuración de endpoints
├── auth.ts             # Servicio de autenticación
└── notifications.tsx   # Sistema de notificaciones personalizado

components/
└── ProtectedRoute.tsx  # Componente de protección de rutas

app/
├── layout.tsx         # Layout principal con NotificationContainer
├── page.tsx           # Página de login
├── api/
│   └── auth/
│       └── login/
│           └── route.ts # Proxy para evitar CORS
├── dashboard/         # Dashboard (protegido)
├── usuarios/          # Gestión de usuarios (protegido)
├── carreras/          # Gestión de carreras (protegido)
├── facultades/        # Gestión de facultades (protegido)
└── perfil/            # Perfil de usuario (protegido)
```

## Próximos Pasos

1. **Implementar más proxies**: Para otros endpoints (users, carreras, facultades)
2. **CRUD operations**: Usar `AuthService.authenticatedFetch()` para operaciones
3. **Mejorar manejo de errores**: Agregar más validaciones específicas
4. **Refresh token**: Implementar renovación automática de tokens
5. **Roles y permisos**: Agregar verificación de roles para diferentes acciones

## Testing del Sistema

### Probar Login:
1. Abrir `http://localhost:3000`
2. Intentar login con credenciales inválidas → Debe mostrar notificación de error
3. Intentar login con credenciales válidas → Debe redirigir al dashboard
4. Verificar que el token se almacene en localStorage

### Probar Protección de Rutas:
1. Sin estar logueado, intentar acceder a `/dashboard` → Debe redirigir al login
2. Después del login, navegar a páginas protegidas → Debe funcionar normalmente
3. Hacer logout → Debe limpiar token y redirigir al login

## Credenciales de Prueba

Para probar el sistema, utiliza las credenciales que proporcione el backend.
Documentación del backend: `https://backprueba-production-fdf6.up.railway.app/docs`

## Status Actual

✅ **Sistema completamente funcional**
✅ **CORS resuelto con proxy**
✅ **Notificaciones elegantes sin dependencias externas**
✅ **Compatible con React 19 y Next.js 15**
✅ **Sin errores de compilación**