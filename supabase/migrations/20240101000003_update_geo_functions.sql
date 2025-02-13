-- Paso 1: Eliminar función existente
DROP FUNCTION IF EXISTS get_nearby_venues(double precision, double precision, double precision);

-- Paso 2: Crear nueva versión
CREATE OR REPLACE FUNCTION get_nearby_venues(
  user_lat float8,
  user_lng float8,
  radius_meters float8 default 5000
) RETURNS TABLE (
  id uuid,
  name text,
  description text,
  image_url text,
  distance float8,
  rating float8,
  music_types text[]
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.name,
    v.description,
    v.image_url,
    ST_Distance(
      v.location::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) AS distance,
    COALESCE(AVG(r.rating)::float8, 0) AS rating,
    v.music_type AS music_types
  FROM 
    venues v
    LEFT JOIN reviews r ON v.id = r.venue_id
  WHERE 
    ST_DWithin(
      v.location::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  GROUP BY v.id
  ORDER BY distance, rating DESC;
END;
$$;

-- Paso 3: Otorgar permisos (si es necesario)
GRANT EXECUTE ON FUNCTION get_nearby_venues TO authenticated; 