# Prueba Técnica - Desarrollador Full Stack Mobile

Sistema de gestión de tareas personales compuesto por una API REST y una aplicación móvil multiplataforma.

##  Estructura del Proyecto

| Carpeta | Descripción | Stack |
|---------|-------------|-------|
| `/api` | API REST | Laravel 12, PHP 8.4, PostgreSQL |
| `/mobile` | Aplicación móvil | React Native, Expo SDK 53 |

## Inicio Rápido

### 1. Backend (API)
```bash
cd api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve --host=0.0.0.0 --port=8000
```

 [Documentación completa de la API](./api/README.md)

### 2. Mobile
```bash
cd mobile
npm install
# Editar src/config/index.js con tu IP local
npx expo start
```

 [Documentación completa de Mobile](./mobile/README.md)

##  Problemas Comunes

Consulta [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) para solución de errores frecuentes.

