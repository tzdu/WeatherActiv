-- Weather Data Database Schema for Supabase
-- This schema supports both real-time and historical weather data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Metadata table for tracking data sources and report information
CREATE TABLE IF NOT EXISTS weather_metadata (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id VARCHAR(50) UNIQUE NOT NULL,
    issue_time_utc TIMESTAMPTZ NOT NULL,
    issue_time_local TIMESTAMPTZ NOT NULL,
    sent_time TIMESTAMPTZ,
    sender VARCHAR(255),
    office VARCHAR(50),
    region VARCHAR(100),
    status VARCHAR(10),
    service VARCHAR(50),
    product_type VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stations table for weather station information
CREATE TABLE IF NOT EXISTS weather_stations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wmo_id VARCHAR(20) UNIQUE,
    bom_id VARCHAR(20) UNIQUE NOT NULL,
    station_name VARCHAR(255) NOT NULL,
    station_description VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    height_meters DECIMAL(8, 2),
    timezone VARCHAR(50),
    station_type VARCHAR(20),
    forecast_district_id VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Observations table for weather measurements
CREATE TABLE IF NOT EXISTS weather_observations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bom_id VARCHAR(20) NOT NULL REFERENCES weather_stations(bom_id),
    wmo_id VARCHAR(20),
    station_name VARCHAR(255),
    observation_time_utc TIMESTAMPTZ NOT NULL,
    observation_time_local TIMESTAMPTZ,
    wind_source VARCHAR(50),
    
    -- Temperature measurements
    temperature_celsius DECIMAL(5, 2),
    apparent_temperature_celsius DECIMAL(5, 2),
    dew_point_celsius DECIMAL(5, 2),
    max_temperature_celsius DECIMAL(5, 2),
    min_temperature_celsius DECIMAL(5, 2),
    max_temperature_time_utc TIMESTAMPTZ,
    max_temperature_time_local TIMESTAMPTZ,
    min_temperature_time_utc TIMESTAMPTZ,
    min_temperature_time_local TIMESTAMPTZ,
    
    -- Pressure measurements
    station_pressure_hpa DECIMAL(7, 2),
    sea_level_pressure_hpa DECIMAL(7, 2),
    qnh_pressure_hpa DECIMAL(7, 2),
    
    -- Wind measurements
    wind_speed_kmh DECIMAL(6, 2),
    wind_speed_knots DECIMAL(6, 2),
    wind_direction VARCHAR(10),
    wind_direction_degrees INTEGER,
    wind_gust_kmh DECIMAL(6, 2),
    wind_gust_knots DECIMAL(6, 2),
    max_gust_kmh DECIMAL(6, 2),
    max_gust_knots DECIMAL(6, 2),
    max_gust_direction VARCHAR(10),
    max_gust_time_utc TIMESTAMPTZ,
    max_gust_time_local TIMESTAMPTZ,
    
    -- Precipitation
    rainfall_1hr_mm DECIMAL(6, 2),
    rainfall_10min_mm DECIMAL(6, 2),
    rainfall_period_mm DECIMAL(6, 2),
    rainfall_24hr_mm DECIMAL(6, 2),
    
    -- Other measurements
    relative_humidity_percent DECIMAL(5, 2),
    visibility_km DECIMAL(6, 2),
    cloud_description VARCHAR(100),
    cloud_oktas INTEGER,
    delta_t_celsius DECIMAL(5, 2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Composite index for efficient querying
    UNIQUE(bom_id, observation_time_utc)
);

-- Historical data table for BOM historical data (static locations)
CREATE TABLE IF NOT EXISTS weather_historical (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    station_name VARCHAR(255) NOT NULL,
    bom_id VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    date DATE NOT NULL,
    max_temperature DECIMAL(5, 2),
    min_temperature DECIMAL(5, 2),
    rainfall_mm DECIMAL(6, 2),
    wind_speed_kmh DECIMAL(6, 2),
    wind_direction VARCHAR(10),
    humidity_percent DECIMAL(5, 2),
    pressure_hpa DECIMAL(7, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(station_name, date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_observations_bom_id ON weather_observations(bom_id);
CREATE INDEX IF NOT EXISTS idx_observations_time ON weather_observations(observation_time_utc);
CREATE INDEX IF NOT EXISTS idx_observations_station_time ON weather_observations(bom_id, observation_time_utc);
CREATE INDEX IF NOT EXISTS idx_stations_bom_id ON weather_stations(bom_id);
CREATE INDEX IF NOT EXISTS idx_stations_active ON weather_stations(is_active);
CREATE INDEX IF NOT EXISTS idx_historical_station_date ON weather_historical(station_name, date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_weather_metadata_updated_at 
    BEFORE UPDATE ON weather_metadata 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weather_stations_updated_at 
    BEFORE UPDATE ON weather_stations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for current weather (latest observation per station)
CREATE OR REPLACE VIEW current_weather AS
SELECT DISTINCT ON (w.bom_id)
    w.bom_id,
    w.station_name,
    w.latitude,
    w.longitude,
    w.height_meters,
    w.timezone,
    o.observation_time_utc,
    o.observation_time_local,
    o.temperature_celsius,
    o.apparent_temperature_celsius,
    o.dew_point_celsius,
    o.max_temperature_celsius,
    o.min_temperature_celsius,
    o.station_pressure_hpa,
    o.sea_level_pressure_hpa,
    o.wind_speed_kmh,
    o.wind_direction,
    o.wind_direction_degrees,
    o.wind_gust_kmh,
    o.rainfall_1hr_mm,
    o.rainfall_24hr_mm,
    o.relative_humidity_percent,
    o.visibility_km,
    o.cloud_description,
    o.cloud_oktas
FROM weather_stations w
LEFT JOIN weather_observations o ON w.bom_id = o.bom_id
WHERE w.is_active = true
ORDER BY w.bom_id, o.observation_time_utc DESC;

-- Create view for temperature summary
CREATE OR REPLACE VIEW temperature_summary AS
SELECT 
    bom_id,
    station_name,
    temperature_celsius,
    apparent_temperature_celsius,
    max_temperature_celsius,
    min_temperature_celsius,
    observation_time_utc,
    observation_time_local
FROM current_weather
WHERE temperature_celsius IS NOT NULL
ORDER BY temperature_celsius DESC;

-- Row Level Security (RLS) policies
ALTER TABLE weather_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_historical ENABLE ROW LEVEL SECURITY;

-- Allow public read access to weather data
CREATE POLICY "Allow public read access to weather metadata" ON weather_metadata FOR SELECT USING (true);
CREATE POLICY "Allow public read access to weather stations" ON weather_stations FOR SELECT USING (true);
CREATE POLICY "Allow public read access to weather observations" ON weather_observations FOR SELECT USING (true);
CREATE POLICY "Allow public read access to weather historical" ON weather_historical FOR SELECT USING (true);

-- Allow service role to insert/update data
CREATE POLICY "Allow service role to manage weather metadata" ON weather_metadata FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role to manage weather stations" ON weather_stations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role to manage weather observations" ON weather_observations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role to manage weather historical" ON weather_historical FOR ALL USING (auth.role() = 'service_role');

-- Allow anon role to insert data (for direct API access)
CREATE POLICY "Allow anon to insert weather metadata" ON weather_metadata FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon to insert weather stations" ON weather_stations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon to insert weather observations" ON weather_observations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon to insert weather historical" ON weather_historical FOR INSERT WITH CHECK (true);
