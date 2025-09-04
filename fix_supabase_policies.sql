-- Fix Supabase RLS policies for weather data
-- Run this in your Supabase SQL Editor

-- Temporarily disable RLS for testing
ALTER TABLE weather_metadata DISABLE ROW LEVEL SECURITY;
ALTER TABLE weather_stations DISABLE ROW LEVEL SECURITY;
ALTER TABLE weather_observations DISABLE ROW LEVEL SECURITY;
ALTER TABLE weather_historical DISABLE ROW LEVEL SECURITY;

-- Or alternatively, create more permissive policies
-- DROP POLICY IF EXISTS "Allow public read access to weather metadata" ON weather_metadata;
-- DROP POLICY IF EXISTS "Allow public read access to weather stations" ON weather_stations;
-- DROP POLICY IF EXISTS "Allow public read access to weather observations" ON weather_observations;
-- DROP POLICY IF EXISTS "Allow public read access to weather historical" ON weather_historical;

-- CREATE POLICY "Allow all operations on weather metadata" ON weather_metadata FOR ALL USING (true);
-- CREATE POLICY "Allow all operations on weather stations" ON weather_stations FOR ALL USING (true);
-- CREATE POLICY "Allow all operations on weather observations" ON weather_observations FOR ALL USING (true);
-- CREATE POLICY "Allow all operations on weather historical" ON weather_historical FOR ALL USING (true);
