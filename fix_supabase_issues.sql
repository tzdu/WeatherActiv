-- Fix Supabase issues for weather pipeline
-- Run this in your Supabase SQL Editor

-- 1. Disable RLS temporarily for easier data insertion
ALTER TABLE weather_metadata DISABLE ROW LEVEL SECURITY;
ALTER TABLE weather_stations DISABLE ROW LEVEL SECURITY;
ALTER TABLE weather_observations DISABLE ROW LEVEL SECURITY;
ALTER TABLE weather_historical DISABLE ROW LEVEL SECURITY;

-- 2. Fix data types for integer fields that might receive float values
-- Change wind_direction_degrees to accept decimal values
ALTER TABLE weather_observations ALTER COLUMN wind_direction_degrees TYPE DECIMAL(6,2);

-- Change cloud_oktas to accept decimal values  
ALTER TABLE weather_observations ALTER COLUMN cloud_oktas TYPE DECIMAL(3,1);

-- 3. Re-enable RLS with permissive policies
ALTER TABLE weather_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_historical ENABLE ROW LEVEL SECURITY;

-- 4. Create permissive policies for all operations
DROP POLICY IF EXISTS "Allow public read access to weather metadata" ON weather_metadata;
DROP POLICY IF EXISTS "Allow public read access to weather stations" ON weather_stations;
DROP POLICY IF EXISTS "Allow public read access to weather observations" ON weather_observations;
DROP POLICY IF EXISTS "Allow public read access to weather historical" ON weather_historical;

DROP POLICY IF EXISTS "Allow service role to manage weather metadata" ON weather_metadata;
DROP POLICY IF EXISTS "Allow service role to manage weather stations" ON weather_stations;
DROP POLICY IF EXISTS "Allow service role to manage weather observations" ON weather_observations;
DROP POLICY IF EXISTS "Allow service role to manage weather historical" ON weather_historical;

DROP POLICY IF EXISTS "Allow anon to insert weather metadata" ON weather_metadata;
DROP POLICY IF EXISTS "Allow anon to insert weather stations" ON weather_stations;
DROP POLICY IF EXISTS "Allow anon to insert weather observations" ON weather_observations;
DROP POLICY IF EXISTS "Allow anon to insert weather historical" ON weather_historical;

-- Create new permissive policies
CREATE POLICY "Allow all operations on weather metadata" ON weather_metadata FOR ALL USING (true);
CREATE POLICY "Allow all operations on weather stations" ON weather_stations FOR ALL USING (true);
CREATE POLICY "Allow all operations on weather observations" ON weather_observations FOR ALL USING (true);
CREATE POLICY "Allow all operations on weather historical" ON weather_historical FOR ALL USING (true);
