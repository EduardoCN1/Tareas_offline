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
  return db.getAllSync( //getAllsync es una función de SQLite que devulve un array de objetos
    `SELECT * FROM tareas
     WHERE sync_status != 'deleted'
     ORDER BY created_at DESC`
  );
}

/**------ OPERACIÓN UPDATE -----------
 * Este método actualiza los campos de una tarea existente. Además de actualizar los campos proporcionados, también actualiza el campo updated_at 
 * para reflejar la última modificación y establece sync_status en 'pending' para indicar que esta tarea necesita ser sincronizada con el servidor.
 * update_at se actualiza cada vez que se modifica la tarea, lo que permite al proceso de sincronización identificar qué tareas han cambiado desde 
 * la última sincronización. Utilizando "Last-Write-Win"
 */
export function updateTarea(id, campos) {
  const now = new Date().toISOString();
  db.runSync(
    `UPDATE tareas SET
       titulo       = ?,
       descripcion  = ?,
       completada   = ?,
       fecha_limite = ?,
       latitud      = ?,
       longitud     = ?,
       updated_at   = ?,
       sync_status  = 'pending'
     WHERE id = ?`,
    [
      campos.titulo,
      campos.descripcion ?? null,
      campos.completada ? 1 : 0,
      campos.fecha_limite ?? null,
      campos.latitud ?? null,
      campos.longitud ?? null,
      now,
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