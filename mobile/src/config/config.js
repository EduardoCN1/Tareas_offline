// ============================================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ============================================================
// Cambia estos valores según tu entorno de desarrollo/producción

const CONFIG = {
  API_HOST: '192.168.68.101',
  API_PORT: '8000',
  API_PROTOCOL: 'http',
};

// URLs construidas automáticamente
export const API_URL = `${CONFIG.API_PROTOCOL}://${CONFIG.API_HOST}:${CONFIG.API_PORT}/api`;
export const BASE_URL = `${CONFIG.API_PROTOCOL}://${CONFIG.API_HOST}:${CONFIG.API_PORT}`;

export default CONFIG;