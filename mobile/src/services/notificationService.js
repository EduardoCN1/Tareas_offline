import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

// ============================================================
// CONFIGURACIÓN DE NOTIFICACIONES
// ============================================================
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const notificationService = {
  // ----------------------------------------------------------
  // Verificar si las notificaciones están disponibles
  // ----------------------------------------------------------
  async isAvailable() {
    // Las notificaciones no funcionan en Expo Go SDK 53+
    // ni en simuladores/emuladores
    if (!Device.isDevice) {
      console.log('Notificaciones no disponibles en emulador/simulador');
      return false;
    }
    return true;
  },

  // ----------------------------------------------------------
  // Solicitar permisos de notificaciones
  // ----------------------------------------------------------
  async requestPermissions() {
    try {
      if (!(await this.isAvailable())) {
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permiso de notificaciones denegado');
        return false;
      }

      // Configuración adicional para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('tareas', {
          name: 'Recordatorios de Tareas',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3B82F6',
        });
      }

      return true;
    } catch (error) {
      console.log('Error solicitando permisos de notificación:', error.message);
      return false;
    }
  },

  // ----------------------------------------------------------
  // Programar notificación para una tarea
  // ----------------------------------------------------------
  async scheduleTaskNotification(tareaId, titulo, fechaLimite) {
    try {
      if (!(await this.isAvailable())) {
        console.log('Notificaciones no disponibles - omitiendo programación');
        return null;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      // Crear fecha para las 9:00 AM del día límite
      const triggerDate = new Date(fechaLimite);
      triggerDate.setHours(9, 0, 0, 0);

      // Si la fecha ya pasó, no programar
      if (triggerDate <= new Date()) {
        console.log('La fecha ya pasó, no se programa notificación');
        return null;
      }

      // Cancelar notificación anterior de esta tarea (si existe)
      await this.cancelTaskNotification(tareaId);

      // Programar nueva notificación
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Tarea pendiente',
          body: titulo,
          data: { tareaId },
          sound: true,
        },
        trigger: {
          date: triggerDate,
        },
      });

      console.log(`Notificación programada: ${identifier} para ${triggerDate}`);
      return identifier;

    } catch (error) {
      // No crashear si falla - solo loggear
      console.log('Error programando notificación:', error.message);
      return null;
    }
  },

  // ----------------------------------------------------------
  // Cancelar notificación de una tarea
  // ----------------------------------------------------------
  async cancelTaskNotification(tareaId) {
    try {
      if (!(await this.isAvailable())) {
        return;
      }

      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.tareaId === tareaId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          console.log(`Notificación cancelada para tarea ${tareaId}`);
        }
      }
    } catch (error) {
      console.log('Error cancelando notificación:', error.message);
    }
  },

  // ----------------------------------------------------------
  // Cancelar todas las notificaciones
  // ----------------------------------------------------------
  async cancelAllNotifications() {
    try {
      if (!(await this.isAvailable())) {
        return;
      }
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.log('Error cancelando notificaciones:', error.message);
    }
  },
};

export default notificationService;