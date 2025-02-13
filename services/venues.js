import supabase from '../lib/supabase';

export const VenueService = {
  getNearbyVenues: async (latitude, longitude, radius = 5000) => {
    try {
      const { data, error } = await supabase
        .rpc('get_nearby_venues', {
          user_lat: latitude,
          user_lng: longitude,
          radius_meters: radius
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting nearby venues:', error);
      return [];
    }
  },

  getVenueDetails: async (venueId) => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select(`
          *,
          products (*)
        `)
        .eq('id', venueId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting venue details:', error);
      return null;
    }
  },

  getVenueReviews: async (venueId) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (name, avatar_url)
        `)
        .eq('venue_id', venueId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting venue reviews:', error);
      return [];
    }
  },

  submitReview: async (userId, venueId, rating, comment) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          user_id: userId,
          venue_id: venueId,
          rating,
          comment,
        }]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting review:', error);
      return null;
    }
  }
}; 