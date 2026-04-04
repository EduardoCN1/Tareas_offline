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
    const response = await apiClient.post('/register', {
      name,
      email,
      password,
      password_confirmation: password, // Laravel requiere confirmación
    });
    
    // Guardar token de forma segura
    if (response.data.token) {
      await SecureStore.setItemAsync('auth_token', response.data.token);
    }
    
    return response.data;
  },

  // ----------------------------------------------------------
  // Inicio de sesión
  // ----------------------------------------------------------
  async login(email, password) {
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
      await apiClient.post('/logout');
    } catch (error) {
      // Aunque falle la petición, limpiamos el token local
      console.log('Error en logout:', error);
    } finally {
      await SecureStore.deleteItemAsync('auth_token');
    }
  },

  // ----------------------------------------------------------
  // Obtener usuario actual
  // ----------------------------------------------------------
  async getMe() {
    const response = await apiClient.get('/me');
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
    const token = await SecureStore.getItemAsync('auth_token');
    return !!token; // Convierte a boolean
  },
};

export default authService;