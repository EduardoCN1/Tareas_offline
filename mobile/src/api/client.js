import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ============================================================
// CONFIGURACIÓN BASE
// ============================================================
// Cambia esta URL cuando despliegues la API en el VPS
// Para desarrollo local:
// - Android emulador: 'http://10.0.2.2:8000/api'
// - Dispositivo físico: 'http://TU_IP_LOCAL:8000/api' (ej: 192.168.1.100)
// - iOS simulador: 'http://localhost:8000/api'

const API_URL = 'http://192.168.68.101:8000/api'; // <-- CAMBIA ESTO

// Crear instancia de Axios con configuración base
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos máximo por petición
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ============================================================
// INTERCEPTOR DE REQUEST (antes de cada petición)
// ============================================================
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error leyendo token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// INTERCEPTOR DE RESPONSE (después de cada respuesta)
// ============================================================
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si es error 401, el token ya no es válido
    if (error.response?.status === 401) {
      // Limpiar token guardado
      await SecureStore.deleteItemAsync('auth_token');
      // Aquí podrías emitir un evento para redirigir al login
      // Lo implementaremos con el AuthContext
    }
    return Promise.reject(error);
  }
);

export default apiClient;