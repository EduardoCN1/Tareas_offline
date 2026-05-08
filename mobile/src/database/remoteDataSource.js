import api from '../api/client'; // Instancia axios con Sanctum
//============================================================
// FUENTE DE VERDAD REMOTA (API)
//============================================================

/** ------ OPERACIÓN READ REMOTA -----------
 * En esta función se realiza una petición GET al endpoint /tareas para obtener la lista de tareas desde el servidor.
 */
export async function getTareasRemoto() {
  const response = await api.get('/tareas');
  return response.data; // array de tareas del servidor
}

/** ------ OPERACIÓN CREATE REMOTA -----------
 * En esta función se realiza una petición POST al endpoint /tareas para crear una nueva tarea en el servidor.
 */
export async function createTareaRemoto(tarea) {
  const response = await api.post('/tareas', {
    titulo:       tarea.titulo,
    descripcion:  tarea.descripcion,
    completada:   tarea.completada,
    fecha_limite: tarea.fecha_limite,
    latitud:      tarea.latitud,
    longitud:     tarea.longitud,
  });
  return response.data?.data ?? response.data; // soporta ambos formatos
}

/** ------ OPERACIÓN UPDATE REMOTA -----------
 * En esta función se realiza una petición PUT al endpoint /tareas para actualizar una tarea existente en el servidor.
 */
export async function updateTareaRemoto(server_id, campos) {
  const response = await api.put(`/tareas/${server_id}`, campos);
  return response.data?.data ?? response.data; // soporta ambos formatos
}

/** ------ OPERACIÓN DELETE REMOTA -----------
 * En esta función se realiza una petición DELETE al endpoint /tareas para eliminar una tarea existente en el servidor.
 */
export async function deleteTareaRemoto(server_id) {
  await api.delete(`/tareas/${server_id}`);
}

/** ------ OPERACIÓN READ REMOTA DE TAGS -----------
 * Descarga el catálogo de tags para mantener SQLite actualizado.
 */
export async function getTagsRemoto() {
  const response = await api.get('/tags');
  return response.data?.data ?? response.data;
}

/** ------ OPERACIÓN SYNC REMOTA DE TAGS EN TAREA -----------
 * Reemplaza los tags asociados a una tarea en el servidor.
 */
export async function syncTareaTagsRemoto(server_id, tagIds) {
  const response = await api.post(`/tareas/${server_id}/tags`, {
    tags: tagIds,
  });
  return response.data;
}