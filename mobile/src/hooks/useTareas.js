import { useState, useEffect, useCallback } from 'react';
import * as repo from '../database/tareasRepository';
/**
 * El uso de este hook es para centralizar la logica de carga de tareas desde el repositorio.
 * Al usar este hook cualquier componente que lo necesite simplemente lo llama.
 */
export function useTareas() {
    //Estados
    const [tareas, setTareas]     = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError]       = useState(null);
    
    const cargarTareas = useCallback(async () => {
    try {
        setCargando(true);
        // Primero muestra lo local de inmediato
        const local = repo.getTareas();
        setTareas(local);

        // Luego intenta actualizar desde el servidor en segundo plano
        await repo.pullTareasFromServer();

        // Refresca la UI con los datos nuevos
        const actualizadas = repo.getTareas();
        setTareas(actualizadas);
    } catch (e) {
        // Si falla el pull, el usuario ya tiene los datos locales
        // — no se muestra error, la app sigue funcionando
    } finally {
        setCargando(false);
    }
    }, []);
    
    useEffect(() => {
        cargarTareas();
    }, [cargarTareas]);

    const crear = useCallback(async (datos) => {
        try {
            await repo.createTarea(datos);
            cargarTareas(); // recarga desde SQLite
        } catch (e) {
            setError(e.message);
        }
    }, [cargarTareas]);

    const editar = useCallback(async (localId, campos) => {
        try {
            await repo.updateTarea(localId, campos);
            cargarTareas();
        } catch (e) {
          setError(e.message);
        }
    }, [cargarTareas]);

    const borrar = useCallback(async (localId) => {
        try {
            await repo.deleteTarea(localId);
            cargarTareas();
        } catch (e) {
            setError(e.message);
        }
    }, [cargarTareas]);

  return { tareas, cargando, error, crear, editar, borrar, recargar: cargarTareas };

}