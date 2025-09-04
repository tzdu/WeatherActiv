-- Completely disable RLS for all weather tables
-- This will allow data insertion without any policy restrictions

-- Disable RLS on all tables
ALTER TABLE weather_metadata DISABLE ROW LEVEL SECURITY;
ALTER TABLE weather_stations DISABLE ROW LEVEL SECURITY;
ALTER TABLE weather_observations DISABLE ROW LEVEL SECURITY;
ALTER TABLE weather_historical DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
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

DROP POLICY IF EXISTS "Allow all operations on weather metadata" ON weather_metadata;
DROP POLICY IF EXISTS "Allow all operations on weather stations" ON weather_stations;
DROP POLICY IF EXISTS "Allow all operations on weather observations" ON weather_observations;
DROP POLICY IF EXISTS "Allow all operations on weather historical" ON weather_historical;

-- Fix data types for integer fields that might receive float values
ALTER TABLE weather_observations ALTER COLUMN wind_direction_degrees TYPE DECIMAL(6,2);
ALTER TABLE weather_observations ALTER COLUMN cloud_oktas TYPE DECIMAL(3,1);
