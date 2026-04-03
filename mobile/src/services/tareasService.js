import apiClient from '../api/client';

// ============================================================
// SERVICIO DE TAREAS
// ============================================================

const tareasService = {
  // ----------------------------------------------------------
  // Listar todas las tareas del usuario
  // ----------------------------------------------------------
  async getAll() {
    const response = await apiClient.get('/tareas');
    return response.data;
  },

  // ----------------------------------------------------------
  // Obtener una tarea específica
  // ----------------------------------------------------------
  async getById(id) {
    const response = await apiClient.get(`/tareas/${id}`);
    return response.data;
  },

  // ----------------------------------------------------------
  // Crear nueva tarea
  // ----------------------------------------------------------
  async create(tareaData) {
    // tareaData puede incluir: titulo, descripcion, fecha_limite, latitud, longitud
    const response = await apiClient.post('/tareas', tareaData);
    return response.data;
  },

  // ----------------------------------------------------------
  // Actualizar tarea existente
  // ----------------------------------------------------------
  async update(id, tareaData) {
    const response = await apiClient.put(`/tareas/${id}`, tareaData);
    return response.data;
  },

  // ----------------------------------------------------------
  // Eliminar tarea
  // ----------------------------------------------------------
  async delete(id) {
    const response = await apiClient.delete(`/tareas/${id}`);
    return response.data;
  },

  // ----------------------------------------------------------
  // Marcar/desmarcar como completada
  // ----------------------------------------------------------
  async toggleCompletada(id, completada) {
    const response = await apiClient.put(`/tareas/${id}`, { completada });
    return response.data;
  },

  // ----------------------------------------------------------
  // Asignar tags a una tarea (reemplaza los actuales)
  // ----------------------------------------------------------
  async assignTags(tareaId, tagIds) {
    // tagIds es un array: [1, 2, 3]
    const response = await apiClient.post(`/tareas/${tareaId}/tags`, {
      tags: tagIds,
    });
    return response.data;
  },

  // ----------------------------------------------------------
  // Quitar un tag específico de una tarea
  // ----------------------------------------------------------
  async removeTag(tareaId, tagId) {
    const response = await apiClient.delete(`/tareas/${tareaId}/tags/${tagId}`);
    return response.data;
  },
};

export default tareasService;