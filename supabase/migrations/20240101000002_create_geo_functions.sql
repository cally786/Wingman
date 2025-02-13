create or replace function get_nearby_venues(
  user_lat float8,
  user_lng float8,
  radius_meters float8 default 5000
) returns table (
  id uuid,
  name text,
  description text,
  image_url text,
  distance float8,
  rating float8,
  music_types text[]
) language plpgsql as $$
begin
  return query
  select
    v.id,
    v.name,
    v.description,
    v.image_url,
    st_distance(
      v.location::geography,
      st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography
    ) as distance,
    coalesce(avg(r.rating)::float8, 0) as rating,
    v.music_type as music_types
  from 
    venues v
    left join reviews r on v.id = r.venue_id
  where 
    st_dwithin(
      v.location::geography,
      st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  group by v.id
  order by distance, rating desc;
end;
$$; 