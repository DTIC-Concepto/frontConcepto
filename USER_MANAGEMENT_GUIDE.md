# Guía de Testing - Gestión de Usuarios

## 🎯 **Funcionalidad Implementada**

### ✅ **CRUD de Usuarios (Read + Create)**
- **Lectura**: Lista todos los usuarios del backend
- **Creación**: Modal completo para agregar nuevos usuarios
- **Validación**: Campos obligatorios y formatos
- **Filtros**: Por rol, estado y búsqueda de texto

### ✅ **Integración Completa con Backend**
- **Endpoint GET**: `/usuarios` con filtros opcionales
- **Endpoint POST**: `/usuarios` para crear usuarios
- **Proxy Next.js**: Maneja CORS automáticamente
- **Autenticación**: Headers de autorización incluidos

## 🧪 **Cómo Probar la Funcionalidad**

### **1. Preparación**
1. **Asegúrate de estar logueado** como administrador
2. **Navega a la página de usuarios**: 
   - Desde el dashboard → "Gestionar Usuarios"
   - O directamente: `http://localhost:3000/usuarios`

### **2. Probar Listado de Usuarios**
- **Carga inicial**: La página debe mostrar todos los usuarios del backend
- **Estados de carga**: Spinner mientras carga
- **Sin datos**: Mensaje apropiado si no hay usuarios

### **3. Probar Filtros**
#### **Filtro de Búsqueda**
- Buscar por: `nombres`, `apellidos`, `correo`, `cédula`
- **Ejemplo**: Buscar "Juan" debe mostrar usuarios con ese nombre

#### **Filtro de Rol**
- Seleccionar diferentes roles del dropdown
- **Ejemplo**: Filtrar por "Profesor" debe mostrar solo profesores

#### **Filtro de Estado**
- **Activo**: Solo usuarios activos
- **Inactivo**: Solo usuarios inactivos
- **Todos**: Sin filtro de estado

#### **Combinación de Filtros**
- Los filtros funcionan en conjunto
- **Ejemplo**: Buscar "Juan" + Rol "Profesor" + Estado "Activo"

### **4. Probar Creación de Usuarios**

#### **Abrir Modal**
- Hacer clic en "+ Nuevo Usuario"
- Debe aparecer modal con formulario completo

#### **Campos del Formulario**
- **Nombres*** (requerido): Ej. "Juan Carlos"
- **Apellidos*** (requerido): Ej. "Pérez González"  
- **Cédula*** (requerido): Ej. "1234567890" (10 dígitos)
- **Correo*** (requerido): Ej. "juan.perez@epn.edu.ec"
- **Contraseña*** (requerido): Mínimo 6 caracteres
- **Rol*** (requerido): Seleccionar del dropdown
- **Estado**: Checkbox "Usuario activo" (por defecto marcado)

#### **Validaciones a Probar**
1. **Campos vacíos**: Debe mostrar notificación de advertencia
2. **Cédula inválida**: Menos de 10 dígitos o caracteres no numéricos
3. **Email inválido**: Formato incorrecto
4. **Contraseña corta**: Menos de 6 caracteres

#### **Casos de Prueba**

**✅ Usuario Válido:**
```
Nombres: Juan Carlos
Apellidos: Pérez González
Cédula: 1234567890
Correo: juan.perez@epn.edu.ec
Contraseña: password123
Rol: Profesor
Estado: ✓ Activo
```

**❌ Usuario Inválido (para probar validaciones):**
```
Nombres: (vacío)
Cédula: 123 (muy corta)
Correo: email-inválido
Contraseña: 123 (muy corta)
```

### **5. Flujo Completo de Prueba**

1. **Login** como administrador
2. **Ir a Usuarios** desde el menú
3. **Verificar** que carga la lista del backend
4. **Probar filtros** uno por uno
5. **Abrir modal** de nuevo usuario
6. **Intentar crear usuario inválido** → Ver notificaciones de error
7. **Crear usuario válido** → Ver notificación de éxito
8. **Verificar** que la lista se actualiza automáticamente
9. **Buscar** el usuario recién creado en la lista

## 🎨 **Características de UI/UX**

### **Diseño Consistente**
- ✅ Colores corporativos (#003366)
- ✅ Tipografía (Montserrat + Open Sans)
- ✅ Bordes redondeados y sombras
- ✅ Estados de hover y focus

### **Responsividad**
- ✅ Tabla scrolleable horizontalmente
- ✅ Modal responsivo
- ✅ Filtros apilados en móvil

### **Estados de Carga**
- ✅ Spinner en carga inicial
- ✅ Botón deshabilitado durante creación
- ✅ Indicador de "Guardando..."

### **Notificaciones**
- ✅ Éxito: Verde con ícono de check
- ✅ Error: Rojo con ícono de X
- ✅ Advertencia: Amarillo con ícono de advertencia
- ✅ Posición: Esquina superior derecha

## 🔧 **Estructura Técnica**

### **Archivos Principales**
```
lib/
├── api.ts              # Tipos User, CreateUserRequest, endpoints
├── users.ts            # Servicio UsersService con validaciones
└── auth.ts             # Autenticación para requests

app/
├── api/usuarios/       # Proxy para GET y POST
└── usuarios/page.tsx   # Página principal de usuarios

components/
└── NewUserModal.tsx    # Modal de creación de usuarios
```

### **Flujo de Datos**
```
Frontend → Proxy (/api/usuarios) → Backend Railway
```

### **Autenticación**
- Headers automáticos con token Bearer
- Logout automático si token expira (401)

## 📋 **Próximos Pasos Sugeridos**

1. **Update/Delete**: Implementar edición y eliminación
2. **Paginación**: Para listas grandes de usuarios
3. **Búsqueda avanzada**: Más filtros y ordenamiento
4. **Validación de cédula ecuatoriana**: Algoritmo específico
5. **Upload de foto**: Avatar de usuario
6. **Roles dinámicos**: Obtener roles desde el backend
7. **Bulk operations**: Acciones masivas

## ✅ **Status Actual**

🟢 **Sistema completamente funcional**
🟢 **Read & Create implementados**
🟢 **Filtros funcionando**
🟢 **UI consistente con el diseño**
🟢 **Validaciones robustas**
🟢 **Integración con backend real**
🟢 **Manejo de errores elegante**

## 🚨 **Posibles Problemas**

### **Si no carga usuarios:**
1. Verificar que el token esté en localStorage
2. Revisar la consola para errores de red
3. Confirmar que el backend esté funcionando

### **Si no se puede crear usuario:**
1. Verificar permisos de administrador
2. Revisar validaciones del backend
3. Confirmar formato de datos enviados

### **Si no aparecen notificaciones:**
1. Verificar que NotificationContainer esté en layout.tsx
2. Revisar consola para errores de JavaScript