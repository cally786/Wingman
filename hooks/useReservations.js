import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReservationsService } from '../services/reservations';

export const useReservations = (userId) => {
  const queryClient = useQueryClient();

  const {
    data: reservations,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['reservations', userId],
    queryFn: () => ReservationsService.getUserReservations(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const createReservation = useMutation({
    mutationFn: ReservationsService.createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries(['reservations', userId]);
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ reservationId, status }) => 
      ReservationsService.updateReservationStatus(reservationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['reservations', userId]);
    },
  });

  const getVenueAvailability = useQuery({
    queryKey: ['availability', userId],
    queryFn: ({ venueId, date }) => 
      ReservationsService.getVenueAvailability(venueId, date),
    enabled: false, // Solo se ejecuta manualmente
  });

  return {
    reservations,
    isLoading,
    error,
    refetch,
    createReservation,
    updateStatus,
    getVenueAvailability,
  };
}; 