# API de Tareas - Prueba Técnica

API REST para gestión de tareas personales desarrollada con Laravel 12 y PostgreSQL.

## Stack Tecnológico

- **Framework:** Laravel 12
- **PHP:** 8.4
- **Base de datos:** PostgreSQL 18
- **Autenticación:** Laravel Sanctum

## Requisitos Previos

Antes de instalar, asegúrate de tener:

- PHP 8.2 o superior
- Composer
- PostgreSQL 15 o superior
- Extensiones PHP habilitadas: `pdo_pgsql`, `pgsql`, `fileinfo`, `exif`, `zip`

## Instalación

### 1. Clonar el repositorio
```bash
git clone https://gitlab.com/pruebatecnica-group1/PruebaTecnica-project.git
cd api
```

### 2. Instalar dependencias
```bash
composer install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
php artisan key:generate
```

### 4. Configurar base de datos

Crea la base de datos en PostgreSQL:
```sql
CREATE DATABASE tareas_app;
CREATE USER tareas_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE tareas_app TO tareas_user;
GRANT ALL ON SCHEMA public TO tareas_user;
ALTER DATABASE tareas_app OWNER TO tareas_user;
```

Edita el archivo `.env` con tus credenciales:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=tareas_app
DB_USERNAME=tareas_user
DB_PASSWORD=tu_password
```

### 5. Ejecutar migraciones y seeders
```bash
php artisan migrate:fresh --seed
```

### 6. Iniciar el servidor
```bash
php artisan serve
```

La API estará disponible en `http://127.0.0.1:8000`

## Usuario Demo

Los seeders crean un usuario de prueba:

| Campo | Valor |
|-------|-------|
| Email | demo@example.com |
| Password | password |

## Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/register | Registro de nuevo usuario |
| POST | /api/login | Inicio de sesión |
| POST | /api/logout | Cerrar sesión (requiere auth) |
| GET | /api/me | Datos del usuario autenticado |
| POST | /api/me/avatar | Subir foto de perfil |

### Tareas (requieren autenticación)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/tareas | Listar tareas del usuario |
| POST | /api/tareas | Crear tarea |
| GET | /api/tareas/{id} | Ver detalle de tarea |
| PUT | /api/tareas/{id} | Actualizar tarea |
| DELETE | /api/tareas/{id} | Eliminar tarea |
| POST | /api/tareas/{id}/tags | Asignar tags a tarea |
| DELETE | /api/tareas/{id}/tags/{tagId} | Quitar tag de tarea |

### Tags (requieren autenticación)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/tags | Listar todos los tags |
| POST | /api/tags | Crear nuevo tag |
| DELETE | /api/tags/{id} | Eliminar tag |

## Colección Postman

Se incluye el archivo `postman_collection.json` con todos los endpoints configurados.

### Importar colección

1. Abrir Postman
2. Click en **Import**
3. Seleccionar el archivo `postman_collection.json`
4. La colección aparecerá con 3 carpetas: Auth, Tareas, Tags

### Uso

1. Ejecutar primero **Login** para obtener el token
2. El token se guarda automáticamente para las demás peticiones
3. Probar cualquier endpoint

## Probar Extracción de EXIF

La API extrae automáticamente metadatos EXIF al subir fotos de perfil.

### Cómo probar

1. Hacer login en Postman
2. Ir a **Auth → Subir Avatar**
3. En el campo `avatar`, seleccionar una foto JPG 
4. Click en **Send**

## Decisiones de Diseño

### Autenticación con Sanctum

Se eligió Sanctum sobre JWT porque:
- Es la solución oficial de Laravel para SPAs y apps móviles
- Los tokens se almacenan en base de datos, permitiendo revocación fácil
- Integración nativa con el framework

### Múltiples tokens por usuario

La API permite múltiples tokens activos por usuario. Esto permite usar la app desde varios dispositivos simultáneamente. Si se requiriera un solo dispositivo, se puede modificar el login para revocar tokens anteriores.

### Tags compartidos

Los tags son globales (no pertenecen a un usuario específico). Cualquier usuario puede usar cualquier tag. Esto simplifica la gestión y permite consistencia entre usuarios.

### Validaciones con Form Requests

Todas las validaciones se manejan en clases Form Request separadas, no en los controladores. Esto cumple con el requisito de la prueba y mejora la mantenibilidad del código.

### Extracción de EXIF

Al subir avatar, el backend extrae automáticamente metadatos EXIF de imágenes JPG/JPEG (modelo de cámara, fecha, GPS si está disponible).

## Estructura del Proyecto
api/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── TareaController.php
│   │   │   └── TagController.php
│   │   └── Requests/
│   │       ├── RegisterRequest.php
│   │       ├── LoginRequest.php
│   │       ├── StoreTareaRequest.php
│   │       ├── UpdateTareaRequest.php
│   │       ├── AssignTagsRequest.php
│   │       ├── StoreTagRequest.php
│   │       └── UpdateAvatarRequest.php
│   └── Models/
│       ├── User.php
│       ├── Tarea.php
│       └── Tag.php
├── database/
│   ├── migrations/
│   └── seeders/
│       ├── UserSeeder.php
│       ├── TagSeeder.php
│       └── TareaSeeder.php
├── docs/
│   └── diagrama-er.md
├── routes/
│   └── api.php
└── postman_collection.json

## Diagrama de Base de Datos

Ver archivo `docs/diagrama-er.md` para el diagrama entidad-relación completo.