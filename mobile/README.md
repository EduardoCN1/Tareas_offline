# Android App
# Tareas App - React Native

Aplicación móvil para gestión de tareas personales desarrollada con React Native y Expo. Consume la API REST de Laravel incluida en este mismo repositorio.

##  Características

-  Autenticación con persistencia de sesión
-  CRUD completo de tareas
-  Asignación de etiquetas (tags) a tareas
-  Fecha límite con notificaciones locales(la notificación genera error ya que EXPO Go no la soporta)
-  Geolocalización al crear tareas
-  Foto de perfil con cámara o galería
-  Extracción de metadatos EXIF de imágenes

##  Stack Tecnológico

| Tecnología | Versión |
|------------|---------|
| React Native | 0.76+ |
| Expo SDK | 53 |
| Node.js | 20+ |
| JavaScript | ES6+ |

##  Requisitos Previos

- [Node.js](https://nodejs.org/) v20 o superior
- [Expo Go](https://expo.dev/client) instalado en tu dispositivo móvil (disponible en Play Store / App Store)
- API de Laravel corriendo (ver carpeta `/api` del repositorio)

## Instalación

### 1. Clonar el repositorio
```bash
git clone git@gitlab.com:pruebatecnica-group1/PruebaTecnica-project.git
cd mobile
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar la URL de la API

Edita el archivo `src/config/index.js` con la IP de tu máquina donde corre Laravel:
```javascript
const CONFIG = {
  API_HOST: 'TU_IP_LOCAL',  // Ejemplo: 192.168.1.100
  API_PORT: '8000',
  API_PROTOCOL: 'http',
};
```

**Para encontrar tu IP:**
```bash
# Windows
ipconfig
# Busca "Dirección IPv4" en tu adaptador Wi-Fi

# Mac/Linux
ifconfig | grep inet
```

### 4. Asegúrate que la API esté corriendo

En la carpeta `/api` del proyecto:
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

El flag `--host=0.0.0.0` permite conexiones desde otros dispositivos en tu red.

## Ejecutar la aplicación

### Opción A: Dispositivo físico (recomendado)
```bash
npx expo start
```

1. Escanea el código QR con la app Expo Go
2. Tu teléfono debe estar en la misma red Wi-Fi que tu computadora

### Opción B: Emulador Android
```bash
npx expo start --android
```

Requiere Android Studio con un emulador configurado.

#### Instalar Android Studio con emulador configurado
1. Descargar: https://developer.android.com/studio?hl=es-419
2. Al ejecutar instalación el segundo paso habilita la opción de instalar dispositivos para emular, marcar casilla.
3. Añadir dispositivo: https://developer.android.com/studio/run/managing-avds?hl=es-419

##  Estructura del Proyecto
mobile/
├── App.js                    # Punto de entrada
├── app.json                  # Configuración de Expo
├── src/
│   ├── api/
│   │   └── client.js         # Cliente Axios con interceptors
│   ├── config/
│   │   └── index.js          # Configuración centralizada (IP, puerto)
│   ├── context/
│   │   └── AuthContext.js    # Estado global de autenticación
│   ├── screens/
│   │   ├── LoginScreen.js    # Inicio de sesión
│   │   ├── RegisterScreen.js # Registro de usuario
│   │   ├── TareasScreen.js   # Lista de tareas
│   │   ├── TareaFormScreen.js# Crear/editar tarea
│   │   └── PerfilScreen.js   # Perfil de usuario
│   ├── components/
│   │   ├── TareaCard.js      # Tarjeta de tarea individual
│   │   ├── TagBadge.js       # Etiqueta visual
│   │   ├── TagSelector.js    # Selector múltiple de tags
│   │   ├── EmptyState.js     # Estado vacío
│   │   └── ExifInfo.js       # Mostrar metadatos EXIF
│   ├── services/
│   │   ├── authService.js    # Lógica de autenticación
│   │   ├── tareasService.js  # CRUD de tareas
│   │   ├── tagsService.js    # CRUD de tags
│   │   ├── imageService.js   # Cámara, galería y EXIF
│   │   └── notificationService.js # Notificaciones locales
│   ├── hooks/
│   │   └── useLocation.js    # Hook de geolocalización
│   └── navigation/
│       └── AppNavigator.js   # Configuración de rutas
└── assets/                   # Imágenes y recursos

##  Credenciales de Prueba

Si ejecutaste los seeders de la API:

| Campo | Valor |
|-------|-------|
| Email | demo@example.com |
| Contraseña | password |

##  Funcionalidades Nativas

### Geolocalización
- Se solicita permiso al crear una tarea
- Las coordenadas se envían automáticamente a la API
- Si el usuario deniega el permiso, la tarea se crea sin ubicación

### Cámara y Galería
- Disponible en la pantalla de perfil
- Permite tomar foto o seleccionar de galería
- Extrae y muestra metadatos EXIF antes de subir
- Las imágenes se suben como multipart/form-data

### Notificaciones Locales
- Se programan automáticamente al asignar fecha límite
- Se disparan a las 9:00 AM del día límite
- Se cancelan si se elimina la tarea o la fecha

> **Nota:** Las notificaciones no funcionan en Expo Go SDK 53+.

##  Decisiones Técnicas

### Manejo de Estado
Se utilizó **Context API** de React para el estado global de autenticación porque:
- Es nativo de React, sin dependencias adicionales
- Suficiente para una app de este tamaño
- Fácil de entender y mantener

### Cliente HTTP
Se utilizó **Axios** con interceptors para:
- Adjuntar token automáticamente a cada petición
- Manejar errores 401 globalmente
- Centralizar configuración de headers

### Almacenamiento Seguro
El token de autenticación se guarda con **expo-secure-store**:
- Encriptado en iOS (Keychain) y Android (Keystore)
- Más seguro que AsyncStorage para datos sensibles

### Navegación
Se utilizó **React Navigation** con:
- Stack Navigator para flujos lineales (login → registro)
- Bottom Tab Navigator para navegación principal (tareas | perfil)
- Navegación condicional basada en estado de autenticación

## Notas Importantes
1. **Red Wi-Fi:** El dispositivo móvil y la computadora deben estar en la misma red
2. **Firewall:** Asegúrate que el puerto 8000 no esté bloqueado
