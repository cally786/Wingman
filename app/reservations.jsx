import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TimeSlotPicker } from '../components/TimeSlotPicker';
import { useReservations } from '../hooks/useReservations';
import { useAuth } from '../hooks/useAuth';

export default function ReservationsScreen() {
  const { venueId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { 
    createReservation, 
    getVenueAvailability,
    isLoading 
  } = useReservations(user?.id);

  const [selectedDateTime, setSelectedDateTime] = useState(null);

  const handleReservation = useCallback(async () => {
    if (!selectedDateTime) {
      Alert.alert('Error', 'Por favor selecciona una fecha y hora');
      return;
    }

    try {
      const reservation = await createReservation.mutateAsync({
        user_id: user.id,
        venue_id: venueId,
        start_time: selectedDateTime.toISOString(),
        end_time: new Date(selectedDateTime.getTime() + 60 * 60 * 1000).toISOString() // 1 hora
      });

      if (reservation) {
        Alert.alert(
          '¡Reserva Exitosa!',
          'Tu reserva ha sido confirmada',
          [
            {
              text: 'Ver mis reservas',
              onPress: () => router.push('/profile/reservations'),
            },
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo completar la reserva. Por favor intenta de nuevo.');
    }
  }, [user, venueId, selectedDateTime, createReservation, router]);

  const handleTimeSelect = useCallback((datetime) => {
    setSelectedDateTime(datetime);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona Fecha y Hora</Text>
      
      <TimeSlotPicker
        venueId={venueId}
        onSelectSlot={handleTimeSelect}
      />

      {selectedDateTime && (
        <View style={styles.confirmationContainer}>
          <Text style={styles.selectedDateTime}>
            Fecha seleccionada: {selectedDateTime.toLocaleDateString()}
          </Text>
          <Text style={styles.selectedDateTime}>
            Hora seleccionada: {selectedDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <TouchableOpacity 
            style={styles.confirmButton}
            onPress={handleReservation}
          >
            <Text style={styles.confirmButtonText}>Confirmar Reserva</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
    color: '#000',
  },
  confirmationContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  selectedDateTime: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 