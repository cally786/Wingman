import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { VenueService } from '../services/venues';

const getCurrentLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Se requiere permiso para acceder a la ubicación');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return location.coords;
};

export const useVenues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    loadVenuesData();
  }, []);

  const loadVenuesData = async () => {
    try {
      setLoading(true);
      // Obtener ubicación actual
      const coords = await getCurrentLocation();
      setLocation(coords);

      // Cargar establecimientos cercanos
      const nearbyVenues = await VenueService.getNearbyVenues(
        coords.latitude,
        coords.longitude
      );
      setVenues(nearbyVenues);
    } catch (err) {
      setError(err.message);
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshVenues = async () => {
    if (!location) return;
    
    setLoading(true);
    try {
      const nearbyVenues = await VenueService.getNearbyVenues(
        location.latitude,
        location.longitude
      );
      setVenues(nearbyVenues);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getVenueDetails = async (venueId) => {
    try {
      return await VenueService.getVenueDetails(venueId);
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const getVenueReviews = async (venueId) => {
    try {
      return await VenueService.getVenueReviews(venueId);
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  return {
    venues,
    loading,
    error,
    location,
    refreshVenues,
    getVenueDetails,
    getVenueReviews,
    getCurrentLocation,
  };
}; 