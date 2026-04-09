import apiClient from '../api/client';
import * as SecureStore from 'expo-secure-store';

// ============================================================
// SERVICIO DE AUTENTICACIÓN
// ============================================================
// Encapsula toda la lógica relacionada con auth.
// Las pantallas solo llaman estas funciones, no conocen los endpoints.

const authService = {
  // ----------------------------------------------------------
  // Registro de nuevo usuario
  // ----------------------------------------------------------
  async register(name, email, password) {
    // Envía credenciales al backend Laravel y espera token + user.
    const response = await apiClient.post('/register', {
      name,
      email,
      password,
      password_confirmation: password, // Laravel requiere confirmación
    });
    
    // Guardar token de forma segura (almacenamiento cifrado del dispositivo).
    // Este token será reutilizado por apiClient en cada petición privada.
    if (response.data.token) {
      await SecureStore.setItemAsync('auth_token', response.data.token);
    }
    
    return response.data;
  },

  // ----------------------------------------------------------
  // Inicio de sesión
  // ----------------------------------------------------------
  async login(email, password) {
    // Misma idea que register, pero contra endpoint de login.
    const response = await apiClient.post('/login', {
      email,
      password,
    });
    
    // Guardar token de forma segura
    if (response.data.token) {
      await SecureStore.setItemAsync('auth_token', response.data.token);
    }
    
    return response.data;
  },

  // ----------------------------------------------------------
  // Cerrar sesión
  // ----------------------------------------------------------
  async logout() {
    try {
      // Revoca sesión en servidor (token inválido desde backend).
      await apiClient.post('/logout');
    } catch (error) {
      // Aunque falle la petición, limpiamos el token local
      console.log('Error en logout:', error);
    } finally {
      // Garantiza salida local para que la app no quede "medio logueada".
      await SecureStore.deleteItemAsync('auth_token');
    }
  },

  // ----------------------------------------------------------
  // Obtener usuario actual
  // ----------------------------------------------------------
  async getMe() {
    const response = await apiClient.get('/me'); // Endpoint protegido que devuelve datos del usuario actual según token.
    return response.data;
  },

  // ----------------------------------------------------------
  // Subir foto de perfil (multipart/form-data)
  // ----------------------------------------------------------
  async uploadAvatar(imageUri, exifData = null) {
    // Crear FormData para envío de archivo binario
    const formData = new FormData();
    
    // Extraer nombre y extensión del archivo
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    // Agregar archivo al FormData
    formData.append('avatar', {
      uri: imageUri,
      name: filename,
      type: type,
    });

    // Agregar EXIF si está disponible (punto extra)
    if (exifData) {
      formData.append('avatar_exif', exifData);
    }
    
    const response = await apiClient.post('/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // ----------------------------------------------------------
  // Verificar si hay token guardado
  // ----------------------------------------------------------
  async hasToken() {
    // Solo verifica presencia local del token
    const token = await SecureStore.getItemAsync('auth_token');
    return !!token; // Devuelve true si hay token, false si no
  },
};

export default authService;