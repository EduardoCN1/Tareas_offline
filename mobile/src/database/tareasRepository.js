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
        'SELECT id FROM tareas WHERE server_id = ?',
        [tarea.id]
      );

      if (existe.length === 0) {
        // No existe localmente — insertarla
        db.runSync(
          `INSERT INTO tareas
            (id, user_id, titulo, descripcion, completada,
             fecha_limite, latitud, longitud,
             created_at, updated_at, sync_status, server_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?)`,
          [
            randomUUID(),
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
      // #3 Guarda el id del servidor y marca como synced
      local.updateTarea(localId, {
        ...datos,
        server_id:   tareaServidor.id,
        sync_status: 'synced',
      });
    } catch (e) {
      // Sin red o error → se queda 'pending', ok
      console.log('Sin red, se sincronizará después:', e.message);
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

        // Si el estatus de sincronización es 'pending' pero ya tiene server_id
      } else if (tarea.sync_status === 'pending' && tarea.server_id) {
        // Ya existe en el servidor → UPDATE
        await remote.updateTareaRemoto(tarea.server_id, tarea);
        //Actualiza la tarea local como 'synced'
        local.updateTarea(tarea.id, { ...tarea, sync_status: 'synced' });
      }
    } catch (e) {
      console.log(`Error sincronizando tarea ${tarea.id}:`, e.message);
    }
  }
}


