import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const VenuesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lugares Disponibles</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default VenuesScreen; 