import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useReservations } from '../../hooks/useReservations';

const ReservationCard = ({ reservation, onCancel }) => {
  const startTime = new Date(reservation.start_time);
  const endTime = new Date(reservation.end_time);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: reservation.venues?.image_url || 'https://via.placeholder.com/100' }}
        style={styles.venueImage}
      />
      
      <View style={styles.cardContent}>
        <Text style={styles.venueName}>{reservation.venues?.name}</Text>
        
        <Text style={styles.dateTime}>
          {startTime.toLocaleDateString()} - {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(reservation.status) }]} />
          <Text style={styles.statusText}>
            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
          </Text>
        </View>

        {reservation.status !== 'cancelled' && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => onCancel(reservation.id)}
          >
            <MaterialIcons name="cancel" size={20} color="#dc3545" />
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function UserReservationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    reservations,
    isLoading,
    updateStatus,
    refetch
  } = useReservations(user?.id);

  const handleCancelReservation = async (reservationId) => {
    Alert.alert(
      'Cancelar Reserva',
      '¿Estás seguro que deseas cancelar esta reserva?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Sí',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateStatus.mutateAsync({
                reservationId,
                status: 'cancelled'
              });
              Alert.alert('Éxito', 'La reserva ha sido cancelada');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cancelar la reserva');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Reservas</Text>

      <FlatList
        data={reservations}
        renderItem={({ item }) => (
          <ReservationCard
            reservation={item}
            onCancel={handleCancelReservation}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes reservas activas</Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.exploreButtonText}>Explorar Locales</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  venueImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  venueName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  dateTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 6,
  },
  cancelText: {
    color: '#dc3545',
    marginLeft: 4,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 