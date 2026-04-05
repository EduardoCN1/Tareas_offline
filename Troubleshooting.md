# Troubleshooting

Guía de solución de problemas comunes para el proyecto.

---

## API (Laravel)

### Error: "SQLSTATE[HY000] [2002] Connection refused"

PostgreSQL no está corriendo o las credenciales son incorrectas.

1. Verifica que PostgreSQL esté activo
2. Revisa las credenciales en `.env`:
```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=tareas_db
   DB_USERNAME=tu_usuario
   DB_PASSWORD=tu_contraseña
```

---

### Error: "Class 'App\...' not found"

Regenera el autoload de Composer:
```bash
composer dump-autoload
```

---

### Error 404 en imágenes de avatar

El symlink de storage no existe o está roto:
```bash
php artisan storage:link
```

En Windows, si falla, ejecuta PowerShell como administrador:
```powershell
cmd /c mklink /D public\storage storage\app\public
```

---

### Error: "The stream or file laravel.log could not be opened"

Problema de permisos en la carpeta de logs:
```bash
# Linux/Mac
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# Windows: verificar que la carpeta no sea de solo lectura
```

---

### Las migraciones fallan

Verifica que la base de datos exista y ejecuta:
```bash
php artisan migrate:fresh --seed
```

---

##  Mobile (React Native / Expo)

### Error: "Cannot find module..." o "Module not found"

Las dependencias no están instaladas:
```bash
npm install
```

---

### Error: "Network Error" o "timeout"

La app no puede conectar con la API:

1. **¿La API está corriendo?**
```bash
   cd api
   php artisan serve --host=0.0.0.0 --port=8000
```

2. **¿La IP es correcta en `src/config/index.js`?**
```bash
   ipconfig   # Windows
   ifconfig   # Mac/Linux
```

3. **¿Misma red Wi-Fi?** El teléfono y la computadora deben estar en la misma red.

4. **¿Firewall activo?** Permite el puerto 8000.

---

### Error: "Unable to resolve module..."

Limpia el cache de Expo:
```bash
npx expo start --clear
```

---

### La imagen de perfil no carga

1. Verifica el symlink de Laravel (ver sección API)
2. Prueba la URL en el navegador