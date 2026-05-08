import * as SQLite from 'expo-sqlite';

//============================================================
// CONFIGURACIÓN DE LA BASE DE DATOS LOCAL
//============================================================

const db = SQLite.openDatabaseSync('tasks.db');
/*
Debido a que el id del servidor se genera con bigint incremental, es posible que supere el rango de un entero en SQLite. 
Por lo tanto, se utiliza TEXT para el id local, y se mantiene el server_id como INTEGER para la referencia al servidor.
De la misma manera se utiliza INTEGER para completada, ya que SQLite no tiene un tipo booleano nativo, y se representa como 0 (falso) o 1 (verdadero).
*/

export function initDatabase() {
  console.log('Inicializando base de datos SQLite');
  db.execSync(`
    CREATE TABLE IF NOT EXISTS tareas (
      id           TEXT PRIMARY KEY NOT NULL,
      user_id      INTEGER NOT NULL,
      titulo       TEXT NOT NULL,
      descripcion  TEXT,
      completada   INTEGER NOT NULL DEFAULT 0,
      fecha_limite TEXT,
      latitud      REAL,
      longitud     REAL,
      created_at   TEXT NOT NULL,
      updated_at   TEXT NOT NULL,
      sync_status  TEXT NOT NULL DEFAULT 'pending',
      server_id    INTEGER
    );
    CREATE TABLE IF NOT EXISTS tags (
      id           INTEGER PRIMARY KEY NOT NULL,
      nombre       TEXT NOT NULL,
      color        TEXT NOT NULL,
      created_at   TEXT NOT NULL,
      updated_at   TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tarea_tag (
      tarea_id     TEXT NOT NULL,
      tag_id       INTEGER NOT NULL,
      PRIMARY KEY (tarea_id, tag_id),
      FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
  `);
  console.log('Base de datos SQLite inicializada');
}

export { db };