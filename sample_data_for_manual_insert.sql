-- Sample weather data to manually insert in Supabase
-- Copy and paste this into your Supabase SQL Editor

-- Insert sample metadata
INSERT INTO weather_metadata (
    report_id, issue_time_utc, issue_time_local, sent_time, 
    sender, office, region, status, service, product_type
) VALUES (
    'IDV60920_TEST', 
    '2025-09-04T09:48:30Z', 
    '2025-09-04T19:48:30+10:00', 
    '2025-09-04T09:50:00Z',
    'Australian Government Bureau of Meteorology',
    'VICRO',
    'Victoria',
    'O',
    'WSP',
    'O'
);

-- Insert sample stations
INSERT INTO weather_stations (
    wmo_id, bom_id, station_name, station_description,
    latitude, longitude, height_meters, timezone, 
    station_type, forecast_district_id, is_active
) VALUES 
('95936', '086338', 'MELBOURNE (OLYMPIC PARK)', 'Melbourne (Olympic Park)', -37.8255, 144.9816, 7.53, 'Australia/Melbourne', 'AWS', 'VIC_PW007', true),
('94866', '086282', 'MELBOURNE AIRPORT', 'Melbourne Airport', -37.6654, 144.8322, 113.4, 'Australia/Melbourne', 'AWS', 'VIC_PW007', true),
('94854', '087113', 'AVALON AIRPORT', 'Avalon', -38.0288, 144.4783, 10.6, 'Australia/Melbourne', 'AWS', 'VIC_PW007', true);

-- Insert sample observations
INSERT INTO weather_observations (
    bom_id, wmo_id, station_name, observation_time_utc, observation_time_local,
    temperature_celsius, apparent_temperature_celsius, dew_point_celsius,
    max_temperature_celsius, min_temperature_celsius,
    station_pressure_hpa, sea_level_pressure_hpa,
    wind_speed_kmh, wind_direction, wind_direction_degrees,
    wind_gust_kmh, rainfall_1hr_mm, rainfall_24hr_mm,
    relative_humidity_percent, visibility_km, cloud_description, cloud_oktas
) VALUES 
('086338', '95936', 'MELBOURNE (OLYMPIC PARK)', '2025-09-04T09:48:30Z', '2025-09-04T19:48:30+10:00', 18.5, 16.2, 12.1, 22.3, 8.7, 1013.2, 1015.8, 15.2, 'SW', 240.0, 22.1, 0.0, 2.3, 65.4, 10.0, 'Partly cloudy', 4.0),
('086282', '94866', 'MELBOURNE AIRPORT', '2025-09-04T09:48:30Z', '2025-09-04T19:48:30+10:00', 17.8, 15.1, 11.3, 21.9, 7.2, 1012.8, 1015.4, 18.7, 'W', 270.0, 25.3, 0.0, 1.8, 62.1, 15.0, 'Clear', 2.0),
('087113', '94854', 'AVALON AIRPORT', '2025-09-04T09:48:30Z', '2025-09-04T19:48:30+10:00', 16.9, 14.3, 10.8, 20.5, 6.9, 1014.1, 1016.7, 22.4, 'SW', 225.0, 28.9, 0.0, 0.5, 58.7, 20.0, 'Mostly clear', 3.0);

-- Check the results
SELECT 'Metadata' as table_name, COUNT(*) as record_count FROM weather_metadata
UNION ALL
SELECT 'Stations' as table_name, COUNT(*) as record_count FROM weather_stations
UNION ALL
SELECT 'Observations' as table_name, COUNT(*) as record_count FROM weather_observations;
