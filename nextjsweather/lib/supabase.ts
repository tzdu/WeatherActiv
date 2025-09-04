import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our weather data
export interface WeatherStation {
  id: string
  wmo_id: string
  bom_id: string
  station_name: string
  station_description: string
  latitude: number
  longitude: number
  height_meters: number
  timezone: string
  station_type: string
  forecast_district_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WeatherObservation {
  id: string
  bom_id: string
  wmo_id: string
  station_name: string
  observation_time_utc: string
  observation_time_local: string
  wind_source: string
  temperature_celsius: number
  apparent_temperature_celsius: number
  dew_point_celsius: number
  max_temperature_celsius: number
  min_temperature_celsius: number
  station_pressure_hpa: number
  sea_level_pressure_hpa: number
  wind_speed_kmh: number
  wind_direction: string
  wind_direction_degrees: number
  wind_gust_kmh: number
  rainfall_1hr_mm: number
  rainfall_24hr_mm: number
  relative_humidity_percent: number
  visibility_km: number
  cloud_description: string
  cloud_oktas: number
  created_at: string
}

export interface CurrentWeather {
  bom_id: string
  station_name: string
  latitude: number
  longitude: number
  height_meters: number
  timezone: string
  observation_time_utc: string
  observation_time_local: string
  temperature_celsius: number
  apparent_temperature_celsius: number
  dew_point_celsius: number
  max_temperature_celsius: number
  min_temperature_celsius: number
  station_pressure_hpa: number
  sea_level_pressure_hpa: number
  wind_speed_kmh: number
  wind_direction: string
  wind_direction_degrees: number
  wind_gust_kmh: number
  rainfall_1hr_mm: number
  rainfall_24hr_mm: number
  relative_humidity_percent: number
  visibility_km: number
  cloud_description: string
  cloud_oktas: number
}

export interface TemperatureSummary {
  bom_id: string
  station_name: string
  temperature_celsius: number
  apparent_temperature_celsius: number
  max_temperature_celsius: number
  min_temperature_celsius: number
  observation_time_utc: string
  observation_time_local: string
}

export interface WeatherHistorical {
  id: string
  station_name: string
  bom_id: string
  latitude: number
  longitude: number
  date: string
  max_temperature: number
  min_temperature: number
  rainfall_mm: number
  wind_speed_kmh: number
  wind_direction: string
  humidity_percent: number
  pressure_hpa: number
  created_at: string
}
