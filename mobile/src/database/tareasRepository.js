import NetInfo from '@react-native-community/netinfo';
import * as local from './localDataSource';
import * as remote from './remoteDataSource';
import { db } from './dataBase.js';
import { randomUUID } from 'expo-crypto';
//============================================================
// REPOSITORIO DE TAREAS
//============================================================

/**
 * El repositorio de tareas actúa como una capa de abstracción entre la UI y las fuentes de datos (local y remoto).
 * Su responsabilidad principal es decidir de dónde obtener los datos (local o remoto) y cómo sincronizarlos.
 */

//  Descarga del servidor y puebla SQLite
export async function pullTareasFromServer() {
  const { isConnected } = await NetInfo.fetch();
  if (!isConnected) return;

  try {
    console.log('Intentando descargar tareas desde el servidor...');
    const tareasServidor = await remote.getTareasRemoto();
    for (const tarea of tareasServidor) {
      // ¿Ya existe en SQLite? (por server_id)
      const existe = db.getAllSync(
        'SELECT id FROM tareas WHERE CAST(server_id AS TEXT) = CAST(? AS TEXT) LIMIT 1',
        [tarea.id]
      );
      let localId = existe.length > 0 ? existe[0].id : null;

      if (existe.length === 0) {
        // Intentar reconciliar una tarea local legacy sin server_id
        const posibleLocal = db.getAllSync(
          `SELECT id
           FROM tareas
           WHERE server_id IS NULL
             AND sync_status != 'deleted'
             AND user_id = ?
             AND titulo = ?
           ORDER BY created_at DESC
           LIMIT 1`,
          [tarea.user_id, tarea.titulo]
        );

        if (posibleLocal.length > 0) {
          localId = posibleLocal[0].id;
          db.runSync(
            `UPDATE tareas
             SET titulo = ?,
                 descripcion = ?,
                 completada = ?,
                 fecha_limite = ?,
                 latitud = ?,
                 longitud = ?,
                 created_at = ?,
                 updated_at = ?,
                 sync_status = 'synced',
                 server_id = ?
             WHERE id = ?`,
            [
              tarea.titulo,
              tarea.descripcion ?? null,
              tarea.completada ? 1 : 0,
              tarea.fecha_limite ?? null,
              tarea.latitud ?? null,
              tarea.longitud ?? null,
              tarea.created_at,
              tarea.updated_at,
              tarea.id,
              localId,
            ]
          );
        } else {
          // No existe localmente — insertarla
          localId = randomUUID();
          db.runSync(
            `INSERT INTO tareas
              (id, user_id, titulo, descripcion, completada,
               fecha_limite, latitud, longitud,
               created_at, updated_at, sync_status, server_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?)`,
            [
              localId,
              tarea.user_id,
              tarea.titulo,
              tarea.descripcion ?? null,
              tarea.completada ? 1 : 0,
              tarea.fecha_limite ?? null,
              tarea.latitud ?? null,
              tarea.longitud ?? null,
              tarea.created_at,
              tarea.updated_at,
              tarea.id, // server_id
            ]
          );
        }
      }

      // Asegurar que datos principales siempre se refresquen desde servidor
      db.runSync(
        `UPDATE tareas
         SET user_id = ?,
             titulo = ?,
             descripcion = ?,
             completada = ?,
             fecha_limite = ?,
             latitud = ?,
             longitud = ?,
             created_at = ?,
             updated_at = ?,
             sync_status = 'synced',
             server_id = ?
         WHERE id = ?`,
        [
          tarea.user_id,
          tarea.titulo,
          tarea.descripcion ?? null,
          tarea.completada ? 1 : 0,
          tarea.fecha_limite ?? null,
          tarea.latitud ?? null,
          tarea.longitud ?? null,
          tarea.created_at,
          tarea.updated_at,
          tarea.id,
          localId,
        ]
      );

      // Sincronizar tags solo si el backend realmente envía el campo tags.
      // Si no viene, preservamos los tags locales para evitar pérdida de datos.
      const backendIncluyeTags = Object.prototype.hasOwnProperty.call(tarea, 'tags');
      if (backendIncluyeTags && Array.isArray(tarea.tags)) {
        db.runSync('DELETE FROM tarea_tag WHERE tarea_id = ?', [localId]);
        for (const tag of tarea.tags) {
          // Upsert simple del tag en catálogo local
          const tagExiste = db.getAllSync(
            'SELECT id FROM tags WHERE id = ?',
            [tag.id]
          );

          if (tagExiste.length === 0) {
            db.runSync(
              'INSERT INTO tags (id, nombre, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
              [tag.id, tag.nombre, tag.color, tag.created_at, tag.updated_at]
            );
          } else {
            db.runSync(
              'UPDATE tags SET nombre = ?, color = ?, updated_at = ? WHERE id = ?',
              [tag.nombre, tag.color, tag.updated_at, tag.id]
            );
          }

          db.runSync(
            'INSERT INTO tarea_tag (tarea_id, tag_id) VALUES (?, ?)',
            [localId, tag.id]
          );
        }
      }

      // Limpiar duplicados por server_id (legacy de tipado/migraciones)
      db.runSync(
        `DELETE FROM tareas
         WHERE id != ?
           AND CAST(server_id AS TEXT) = CAST(? AS TEXT)`,
        [localId, tarea.id]
      );

      // Limpiar duplicados legacy: misma tarea local sin server_id
      db.runSync(
        `DELETE FROM tareas
         WHERE id != ?
           AND server_id IS NULL
           AND sync_status != 'deleted'
           AND user_id = ?
           AND titulo = ?`,
        [localId, tarea.user_id, tarea.titulo]
      );
    }
  } catch (e) {
    console.error('Error en pull inicial:', e.message);
  }
}
// Lectura: siempre local, siempre inmediata
export function getTareas() {
  return local.getTareas();
}
//Escritura: Siempre local primero, luego intenta sincronizar con el servidor
export async function createTarea(datos) {
  // #1 Siempre guarda local primero
  const localId = local.createTarea(datos);

  // #2 Intenta sincronizar de inmediato si hay red
  const { isConnected } = await NetInfo.fetch();
  if (isConnected) {
    try {
      const tareaServidor = await remote.createTareaRemoto(datos);
      if (!tareaServidor?.id) {
        throw new Error('La API no devolvió el id de la tarea creada');
      }

      // #3 Guarda el id del servidor y marca como synced
      local.updateTarea(localId, {
        ...datos,
        server_id:   tareaServidor.id,
        sync_status: 'synced',
      });

      // Si la tarea ya tiene tags locales seleccionados, sincronizarlos de inmediato.
      const tagsActuales = local.getTagsFromTarea(localId);
      if (tagsActuales.length > 0) {
        await remote.syncTareaTagsRemoto(
          tareaServidor.id,
          tagsActuales.map(t => t.id)
        );
      }
    } catch (e) {
      // Cualquier error deja la tarea en pending para reintentar en syncTareas.
      local.setTareaSyncStatus(localId, 'pending');
      console.log('No se pudo sincronizar al crear, se reintentará:', e.message);
    }
  }

  return localId;
}

// Actualización: Siempre local primero, luego intenta sincronizar con el servidor
export async function updateTarea(localId, campos) {
  // #1 Actualiza local (marca como 'pending' automáticamente)
  local.updateTarea(localId, campos);

  // #2 Intenta sync si hay red
  const { isConnected } = await NetInfo.fetch();
  if (isConnected) {
    try {
      const tareas = local.getTareas();
      const tarea = tareas.find(t => t.id === localId);
      if (tarea?.server_id) {
        await remote.updateTareaRemoto(tarea.server_id, campos);
        local.updateTarea(localId, { ...campos, sync_status: 'synced' });
      }
    } catch (e) {
      console.log('Sin red, se sincronizará después:', e.message);
    }
  }
}

// Eliminación: Marca como 'deleted' localmente, luego intenta eliminar del servidor
export async function deleteTarea(localId) {
  // #1 Soft delete local
  local.deleteTarea(localId);

  // #2 Intenta avisar al servidor
  const { isConnected } = await NetInfo.fetch();
  if (isConnected) {
    try {
      const todasLasTareas = db.getAllSync(
        "SELECT * FROM tareas WHERE id = ?", [localId]
      );
      const tarea = todasLasTareas[0];
      if (tarea?.server_id) {
        await remote.deleteTareaRemoto(tarea.server_id);
      }
      // #3 Ahora sí se puede borrar físicamente
      local.hardDeleteTarea(localId);
    } catch (e) {
      console.log('Sin red, se sincronizará después:', e.message);
    }
  }
}

//============================================================
// OPERACIONES PARA MANEJAR TAGS EN TAREAS
//============================================================

/**
 * Obtiene todos los tags de una tarea local
 */
export function getTagsFromTarea(tareaId) {
  return local.getTagsFromTarea(tareaId);
}

/**
 * Obtiene catálogo de tags desde SQLite para UI offline-first.
 */
export function getAllTags() {
  return local.getAllTags();
}

/**
 * Descarga catálogo de tags remoto y lo guarda en SQLite.
 */
export async function pullTagsFromServer() {
  const { isConnected } = await NetInfo.fetch();
  if (!isConnected) return;

  try {
    const tagsServidor = await remote.getTagsRemoto();
    if (Array.isArray(tagsServidor)) {
      local.upsertTags(tagsServidor);
    }
  } catch (e) {
    console.log('No se pudo sincronizar catálogo de tags:', e.message);
  }
}

/**
 * Reemplaza todos los tags de una tarea local y sincroniza con backend si hay red.
 */
export async function syncTagsForTarea(tareaId, tagIds) {
  // #1 Siempre actualiza local primero
  local.syncTagsForTarea(tareaId, tagIds);
  local.setTareaSyncStatus(tareaId, 'pending');

  // #2 Intenta sincronizar con servidor
  const { isConnected } = await NetInfo.fetch();
  if (!isConnected) return;

  try {
    const tareas = local.getTareas();
    const tarea = tareas.find(t => t.id === tareaId);

    if (tarea?.server_id) {
      await remote.syncTareaTagsRemoto(tarea.server_id, tagIds);
      local.setTareaSyncStatus(tareaId, 'synced');
    }
  } catch (e) {
    console.log('Sin red, cambio de tags se sincronizará después:', e.message);
  }
}

/**
 * Agrega un tag a una tarea:
 * #1 Agrega localmente de inmediato
 * #2 Intenta sincronizar con el servidor si hay red
 */
export async function addTagToTarea(tareaId, tagId) {
  // Mantiene compatibilidad de API pública pero centraliza lógica de sync.
  const tagsActuales = local.getTagsFromTarea(tareaId);
  const tagIds = Array.from(new Set([...tagsActuales.map(t => t.id), tagId]));
  await syncTagsForTarea(tareaId, tagIds);
  console.log(`Tag ${tagId} agregado localmente a tarea ${tareaId}`);
}

/**
 * Elimina un tag de una tarea:
 * #1 Elimina localmente de inmediato
 * #2 Intenta sincronizar con el servidor si hay red
 */
export async function removeTagFromTarea(tareaId, tagId) {
  // Mantiene compatibilidad de API pública pero centraliza lógica de sync.
  const tagsActuales = local.getTagsFromTarea(tareaId);
  const tagIds = tagsActuales.map(t => t.id).filter(id => id !== tagId);
  await syncTagsForTarea(tareaId, tagIds);
  console.log(`Tag ${tagId} eliminado localmente de tarea ${tareaId}`);
}

//Función para sincronizar tareas con el servidor
export async function syncTareas() {
  const { isConnected } = await NetInfo.fetch();
  
  // #1 Si no hay conexión, no hacemos nada
  if (!isConnected) return;

  // #2 Si hay conexión, sincronizamos todas las tareas pendientes
  const pendientes = db.getAllSync(
    "SELECT * FROM tareas WHERE sync_status != 'synced'"
  );

  // #3 Procesamos cada tarea pendiente
  for (const tarea of pendientes) {
    try {
        // Si la tarea está marcada como 'deleted'
      if (tarea.sync_status === 'deleted') {
        // Si tiene server_id, elimínala del servidor
        if (tarea.server_id) {
          await remote.deleteTareaRemoto(tarea.server_id);
        }
        // Luego elimínala físicamente de la base de datos local
        local.hardDeleteTarea(tarea.id);
        
        // Si el estatus de sincronización es 'pending' y no tiene server_id
      } else if (tarea.sync_status === 'pending' && !tarea.server_id) {
        // Nunca llegó al servidor → CREATE
        const tareaServidor = await remote.createTareaRemoto(tarea);
        // Actualiza la tarea local con el id del servidor y marca como 'synced'
        local.updateTarea(tarea.id, {
          ...tarea,
          server_id:   tareaServidor.id,
          sync_status: 'synced',
        });

        // Sincronizar tags de la tarea recién creada
        const tagsActuales = local.getTagsFromTarea(tarea.id);
        const tagIds = tagsActuales.map(t => t.id);
        await remote.syncTareaTagsRemoto(tareaServidor.id, tagIds);
        local.setTareaSyncStatus(tarea.id, 'synced');

        // Si el estatus de sincronización es 'pending' pero ya tiene server_id
      } else if (tarea.sync_status === 'pending' && tarea.server_id) {
        // Ya existe en el servidor → UPDATE
        await remote.updateTareaRemoto(tarea.server_id, tarea);
        
        // Sincronizar tags de la tarea actualizada
        const tagsActuales = local.getTagsFromTarea(tarea.id);
        const tagIds = tagsActuales.map(t => t.id);
        await remote.syncTareaTagsRemoto(tarea.server_id, tagIds);
        
        // Actualiza la tarea local como 'synced'
        local.setTareaSyncStatus(tarea.id, 'synced');
      }
    } catch (e) {
      console.log(`Error sincronizando tarea ${tarea.id}:`, e.message);
    }
  }
}


