import apiClient from '../api/client';

// ============================================================
// SERVICIO DE TAGS
// ============================================================

const tagsService = {
  // ----------------------------------------------------------
  // Listar todos los tags disponibles
  // ----------------------------------------------------------
  async getAll() {
    const response = await apiClient.get('/tags');
    return response.data;
  },

  // ----------------------------------------------------------
  // Crear nuevo tag
  // ----------------------------------------------------------
  async create(nombre, color) {
    const response = await apiClient.post('/tags', { nombre, color });
    return response.data;
  },

  // ----------------------------------------------------------
  // Eliminar tag
  // ----------------------------------------------------------
  async delete(id) {
    const response = await apiClient.delete(`/tags/${id}`);
    return response.data;
  },
};

export default tagsService;