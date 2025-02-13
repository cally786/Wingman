import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import supabase from '../lib/supabase';

// Configuración inicial de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationsService = {
  /**
   * Configura las notificaciones push para el usuario
   */
  setupPushNotifications: async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        throw new Error('Se requieren permisos para enviar notificaciones');
      }

      // Obtener token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID,
      });

      // Configuración específica para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#007AFF',
        });
      }

      return tokenData.data;
    } catch (error) {
      console.error('Error configurando notificaciones:', error);
      return null;
    }
  },

  /**
   * Programa una notificación para una reserva
   */
  scheduleReservationReminder: async (reservation) => {
    try {
      const { id, start_time, venues } = reservation;
      const reminderTime = new Date(start_time);
      reminderTime.setHours(reminderTime.getHours() - 1); // 1 hora antes

      // Cancelar recordatorios existentes para esta reserva
      await NotificationsService.cancelReservationReminders(id);

      // Programar nuevo recordatorio
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📅 Recordatorio de Reserva',
          body: `Tu reserva en ${venues.name} comienza en 1 hora`,
          data: { reservationId: id },
          sound: true,
        },
        trigger: reminderTime,
      });

      // Guardar ID de notificación en la base de datos
      await supabase
        .from('reservations')
        .update({ notification_id: notificationId })
        .eq('id', id);

      return notificationId;
    } catch (error) {
      console.error('Error programando recordatorio:', error);
      return null;
    }
  },

  /**
   * Cancela los recordatorios de una reserva
   */
  cancelReservationReminders: async (reservationId) => {
    try {
      const { data } = await supabase
        .from('reservations')
        .select('notification_id')
        .eq('id', reservationId)
        .single();

      if (data?.notification_id) {
        await Notifications.cancelScheduledNotificationAsync(data.notification_id);
      }
    } catch (error) {
      console.error('Error cancelando recordatorios:', error);
    }
  },

  /**
   * Actualiza los recordatorios cuando cambia el estado de una reserva
   */
  handleReservationStatusChange: async (reservation) => {
    try {
      if (reservation.status === 'cancelled') {
        await NotificationsService.cancelReservationReminders(reservation.id);
      } else if (reservation.status === 'confirmed') {
        await NotificationsService.scheduleReservationReminder(reservation);
      }
    } catch (error) {
      console.error('Error manejando cambio de estado:', error);
    }
  },
}; 