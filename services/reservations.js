import supabase from '../lib/supabase';
import { NotificationsService } from './notifications';

export const ReservationsService = {
  /**
   * Obtiene la disponibilidad de un local para una fecha específica
   */
  getVenueAvailability: async (venueId, date) => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('reservations')
        .select('start_time, end_time')
        .eq('venue_id', venueId)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .neq('status', 'cancelled');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener disponibilidad:', error);
      return null;
    }
  },

  /**
   * Crea una nueva reserva
   */
  createReservation: async (reservationData) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert({
          ...reservationData,
          status: 'pending'
        })
        .select('*, venues(name, image_url)');

      if (error) throw error;

      // Programar recordatorio si la reserva se creó exitosamente
      if (data[0]) {
        await NotificationsService.scheduleReservationReminder(data[0]);
      }

      return data[0];
    } catch (error) {
      console.error('Error al crear reserva:', error);
      return null;
    }
  },

  /**
   * Obtiene las reservas de un usuario
   */
  getUserReservations: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          venues (
            name,
            image_url,
            address
          )
        `)
        .eq('user_id', userId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener reservas del usuario:', error);
      return null;
    }
  },

  /**
   * Actualiza el estado de una reserva
   */
  updateReservationStatus: async (reservationId, status) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', reservationId)
        .select('*, venues(name, image_url)');

      if (error) throw error;

      // Manejar notificaciones según el nuevo estado
      if (data[0]) {
        await NotificationsService.handleReservationStatusChange(data[0]);
      }

      return data[0];
    } catch (error) {
      console.error('Error al actualizar estado de reserva:', error);
      return null;
    }
  },

  /**
   * Configura suscripción en tiempo real para reservas
   */
  subscribeToReservations: (callback) => {
    return supabase
      .channel('reservations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations'
        },
        callback
      )
      .subscribe();
  }
}; 