import { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

const HORARIOS_DISPONIBLES = [
  '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00'
];

const TimeSlot = ({ time, isAvailable, isSelected, onSelect }) => (
  <TouchableOpacity 
    style={[
      styles.timeSlot,
      !isAvailable && styles.unavailableSlot,
      isSelected && styles.selectedSlot
    ]}
    onPress={() => isAvailable && onSelect(time)}
    disabled={!isAvailable}
  >
    <Text style={[
      styles.timeText,
      !isAvailable && styles.unavailableText,
      isSelected && styles.selectedText
    ]}>
      {time}
    </Text>
    <Text style={[
      styles.availabilityText,
      !isAvailable && styles.unavailableText,
      isSelected && styles.selectedText
    ]}>
      {isAvailable ? 'Disponible' : 'No disponible'}
    </Text>
  </TouchableOpacity>
);

export const TimeSlotPicker = ({ 
  venueId, 
  existingReservations = [], 
  onSelectSlot,
  minDate = new Date(),
  maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);

  // Formatea la fecha para el calendario
  const formattedDate = useMemo(() => {
    return selectedDate.toISOString().split('T')[0];
  }, [selectedDate]);

  // Calcula los slots disponibles
  const timeSlots = useMemo(() => {
    const reservedTimes = existingReservations
      .filter(res => {
        const resDate = new Date(res.start_time);
        return resDate.toDateString() === selectedDate.toDateString();
      })
      .map(res => new Date(res.start_time).getHours() + ':00');

    return HORARIOS_DISPONIBLES.map(time => ({
      time,
      isAvailable: !reservedTimes.includes(time),
      isSelected: time === selectedTime
    }));
  }, [selectedDate, existingReservations, selectedTime]);

  // Maneja la selección de un horario
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    if (onSelectSlot) {
      const [hours] = time.split(':');
      const datetime = new Date(selectedDate);
      datetime.setHours(parseInt(hours), 0, 0, 0);
      onSelectSlot(datetime);
    }
  };

  return (
    <View style={styles.container}>
      <Calendar
        current={formattedDate}
        minDate={minDate.toISOString().split('T')[0]}
        maxDate={maxDate.toISOString().split('T')[0]}
        onDayPress={day => {
          setSelectedDate(new Date(day.dateString));
          setSelectedTime(null);
        }}
        markedDates={{
          [formattedDate]: { selected: true, selectedColor: '#007AFF' }
        }}
        theme={{
          todayTextColor: '#007AFF',
          selectedDayBackgroundColor: '#007AFF',
          selectedDayTextColor: '#ffffff',
        }}
      />

      <View style={styles.timeSlotsContainer}>
        <Text style={styles.sectionTitle}>Horarios Disponibles</Text>
        <FlatList
          data={timeSlots}
          renderItem={({ item }) => (
            <TimeSlot
              time={item.time}
              isAvailable={item.isAvailable}
              isSelected={item.isSelected}
              onSelect={handleTimeSelect}
            />
          )}
          keyExtractor={item => item.time}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.timeSlotsList}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  timeSlotsContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  timeSlotsList: {
    paddingBottom: 16,
  },
  timeSlot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  unavailableSlot: {
    backgroundColor: '#e9ecef',
    borderColor: '#dee2e6',
  },
  selectedSlot: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  availabilityText: {
    fontSize: 14,
    color: '#666',
  },
  unavailableText: {
    color: '#adb5bd',
  },
  selectedText: {
    color: '#fff',
  },
}); 