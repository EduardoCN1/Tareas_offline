import { db } from './dataBase.js';
import { randomUUID } from 'expo-crypto';

//============================================================
// OPERACIONES CRUD PARA LA ENTIDAD TAREA
//============================================================

/**------ OPERACIÓN CREATE -----------
 * El id se genera localmente usando randomUUID para garantizar unicidad incluso sin conexión.
 * sync_status se establece en 'pendiente' para identificar que esta tarea necesita ser sincronizada con el servidor.
 */
export function createTarea({ user_id, titulo, descripcion, fecha_limite, latitud, longitud }) {
  const id = randomUUID();
  const now = new Date().toISOString(); 
  db.runSync( //runSync es una función de SQLite que ejecuta una consulta SQL sincrónicamente para opciones que no devulven filas.
    `INSERT INTO tareas
      (id, user_id, titulo, descripcion, completada,fecha_limite, latitud, longitud,created_at, updated_at, sync_status)
      VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, 'pending')`,
    [id, user_id, titulo, descripcion ?? null, fecha_limite ?? null, latitud ?? null, longitud ?? null,now, now]
  );
  return id;
}

/**------ OPERACIÓN READ ------------ 
 * La exclusión de tareas con sync_status 'deleted' se debe a que estas tareas han sido marcadas para eliminación pero no han sido eliminadas 
 * fisicamente de la base de datos local. La marcamos como 'deleted' para que el proceso de sincronización avise al servidor que esta tarea debe 
 * ser eliminada. Pero en la UI no queremos mostrar estas tareas por lo que las ocultamos en la consulta.
*/

export function getTareas() {
  console.log('Obteniendo tareas desde SQLite - LocalDataSource');
  const tareas = db.getAllSync( //getAllsync es una función de SQLite que devulve un array de objetos
    `SELECT * FROM tareas
     WHERE sync_status != 'deleted'
     ORDER BY created_at DESC`
  );

  return tareas.map((tarea) => ({
    ...tarea,
    tags: getTagsFromTarea(tarea.id),
  }));
}

/**------ OPERACIÓN UPDATE -----------
 * Este método actualiza los campos de una tarea existente. Además de actualizar los campos proporcionados, también actualiza el campo updated_at 
 * para reflejar la última modificación y establece sync_status en 'pending' para indicar que esta tarea necesita ser sincronizada con el servidor.
 * update_at se actualiza cada vez que se modifica la tarea, lo que permite al proceso de sincronización identificar qué tareas han cambiado desde 
 * la última sincronización. Utilizando "Last-Write-Win"
 */
export function updateTarea(id, campos) {
  const now = new Date().toISOString();
  const syncStatus = campos.sync_status ?? 'pending';
  const serverId = campos.server_id ?? null;
  db.runSync(
    `UPDATE tareas SET
       titulo       = ?,
       descripcion  = ?,
       completada   = ?,
       fecha_limite = ?,
       latitud      = ?,
       longitud     = ?,
       updated_at   = ?,
       sync_status  = ?,
       server_id    = COALESCE(?, server_id)
     WHERE id = ?`,
    [
      campos.titulo,
      campos.descripcion ?? null,
      campos.completada ? 1 : 0,
      campos.fecha_limite ?? null,
      campos.latitud ?? null,
      campos.longitud ?? null,
      now,
      syncStatus,
      serverId,
      id
    ]
  );
}

/**------ OPERACIÓN DELETE -----------
 * Este metodo marca una tarea como 'deleted' en lugar de eliminarla físicamente de la base de datos. Esto se hace para que el
 * proceso de sincronización pueda identificar que esta tarea debe ser eliminada del servidor.
 * La eliminación física de la tarea se realiza posteriormente mediante el método hardDeleteTarea, que se llama después de que el 
 * servidor confirme que la tarea ha sido eliminada. 
 */
export function deleteTarea(id) {
  const now = new Date().toISOString();
  db.runSync(
    `UPDATE tareas SET
       sync_status = 'deleted',
       updated_at  = ?
     WHERE id = ?`,
    [now, id]
  );
}

/** ------ ELIMINACIÓN FÍSICA DE TAREA -----------
 * Este metodo elimina fisicamente una tarea de la base de datos local.
 * Se llama después de que el servidor confirme que la tarea ha sido eliminada.
 */
export function hardDeleteTarea(id) {
  db.runSync('DELETE FROM tareas WHERE id = ?', [id]);
}

//============================================================
// OPERACIONES PARA MANEJAR TAGS EN TAREAS
//============================================================

/**------ AGREGAR TAG A TAREA -----------
 * Vincula un tag existente a una tarea. Si la relación ya existe, SQLite no generará error
 * debido a la restricción PRIMARY KEY en la tabla tarea_tag.
 */
export function addTagToTarea(tareaId, tagId) {
  try {
    db.runSync(
      'INSERT INTO tarea_tag (tarea_id, tag_id) VALUES (?, ?)',
      [tareaId, tagId]
    );
    console.log(`Tag ${tagId} agregado a tarea ${tareaId}`);
  } catch (error) {
    console.log(`Tag ${tagId} ya existe en tarea ${tareaId}`);
  }
}

/**------ OBTENER TAGS DE UNA TAREA -----------
 * Retorna un array con todos los tags asociados a una tarea específica.
 */
export function getTagsFromTarea(tareaId) {
  return db.getAllSync(
    `SELECT t.id, t.nombre, t.color, t.created_at, t.updated_at
     FROM tags t
     INNER JOIN tarea_tag tt ON t.id = tt.tag_id
     WHERE tt.tarea_id = ?`,
    [tareaId]
  );
}

/**------ ELIMINAR TAG DE TAREA -----------
 * Desvincula un tag de una tarea sin eliminar el tag de la base de datos.
 */
export function removeTagFromTarea(tareaId, tagId) {
  db.runSync(
    'DELETE FROM tarea_tag WHERE tarea_id = ? AND tag_id = ?',
    [tareaId, tagId]
  );
  console.log(`Tag ${tagId} eliminado de tarea ${tareaId}`);
}

/**------ SINCRONIZAR TAGS DE TAREA -----------
 * Reemplaza todos los tags de una tarea con una nueva lista.
 * Útil al sincronizar cambios del servidor.
 */
export function syncTagsForTarea(tareaId, tagIds) {
  // Eliminar todos los tags actuales
  db.runSync('DELETE FROM tarea_tag WHERE tarea_id = ?', [tareaId]);
  
  // Agregar los nuevos tags
  tagIds.forEach(tagId => {
    db.runSync(
      'INSERT INTO tarea_tag (tarea_id, tag_id) VALUES (?, ?)',
      [tareaId, tagId]
    );
  });
  console.log(`Tags sincronizados para tarea ${tareaId}`);
}

/**------ OBTENER CATÁLOGO LOCAL DE TAGS -----------
 * Retorna todos los tags disponibles para mostrar en formularios offline.
 */
export function getAllTags() {
  return db.getAllSync(
    `SELECT id, nombre, color, created_at, updated_at
     FROM tags
     ORDER BY nombre ASC`
  );
}

/**------ UPSERT DE CATÁLOGO DE TAGS -----------
 * Inserta o actualiza tags en el catálogo local.
 */
export function upsertTags(tags = []) {
  tags.forEach((tag) => {
    const existe = db.getAllSync('SELECT id FROM tags WHERE id = ?', [tag.id]);

    if (existe.length === 0) {
      db.runSync(
        'INSERT INTO tags (id, nombre, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [
          tag.id,
          tag.nombre,
          tag.color,
          tag.created_at ?? new Date().toISOString(),
          tag.updated_at ?? new Date().toISOString(),
        ]
      );
    } else {
      db.runSync(
        'UPDATE tags SET nombre = ?, color = ?, updated_at = ? WHERE id = ?',
        [
          tag.nombre,
          tag.color,
          tag.updated_at ?? new Date().toISOString(),
          tag.id,
        ]
      );
    }
  });
}

/**------ ACTUALIZAR ESTADO DE SINCRONIZACIÓN -----------
 * Marca una tarea para sincronización y actualiza su timestamp.
 */
export function setTareaSyncStatus(id, status) {
  db.runSync(
    `UPDATE tareas
     SET sync_status = ?,
         updated_at = ?
     WHERE id = ?`,
    [status, new Date().toISOString(), id]
  );
}