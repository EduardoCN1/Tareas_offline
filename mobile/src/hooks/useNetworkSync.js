import { useEffect, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { syncTareas } from '../database/tareasRepository';

//=====================================================
// Metodo de sincronización automática al recuperar la conexión de red
//======================================================
export function useNetworkSync(onSyncComplete) {
    //Estados de la conexión y sincronización
    const [isOnline, setIsOnline]   = useState(true);
    const [syncing, setSyncing]     = useState(false);

    // Referencia para almacenar el estado previo de la conexión
    const wasConnected = useRef(null);

    useEffect(() => {
        // Listener de cambios en la conexión de red
        const unsubscribe = NetInfo.addEventListener(async (state) => {
            // Determina si estamos conectados a internet
            const isConnected = state.isConnected && state.isInternetReachable;
            // Actualiza el estado de conexión
            setIsOnline(!!isConnected);
            // Solo actuar cuando se RECUPERA la conexión
            if (wasConnected.current === false && isConnected) {
                // Actualizar el estado de sincronización
                setSyncing(true);
                console.log('Red recuperada — sincronizando...');
                try {
                    //Sincronizar las tareas pendientes
                    await syncTareas();
                    // Avisar a la UI para que recargue desde SQLite
                    onSyncComplete?.();
                } catch (e) {
                    console.error('Error en sync automático:', e.message);
                } finally{
                    // Actualizar el estado de sincronización
                    setSyncing(false);
                }

            }
            wasConnected.current = isConnected;
        });

    // Limpiar el listener cuando el componente se desmonte
    return () => unsubscribe();
  }, [onSyncComplete]);
  
  return{isOnline, syncing};
}