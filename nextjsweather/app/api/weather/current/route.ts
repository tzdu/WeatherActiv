import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    const timestamp = new Date().toISOString()
    console.log('=== CURRENT WEATHER API CALLED ===', timestamp)
    console.log('Supabase URL:', supabaseUrl ? 'SET' : 'NOT SET')
    console.log('Supabase Key:', supabaseKey ? 'SET' : 'NOT SET')
    
    // Try to fetch real data from Supabase first
    if (supabaseUrl && supabaseKey) {
      console.log('Fetching from current_weather table...')
      const { data, error } = await supabase
        .from('current_weather')
        .select('*')
        .order('observation_time_utc', { ascending: false })

      console.log('Current weather query result:', { dataLength: data?.length, error })

      if (!error && data && data.length > 0) {
        console.log(`SUCCESS: Fetched ${data.length} weather stations from current_weather table`)
        return NextResponse.json(data, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
      }
      
      // If no data in current_weather view, try fetching from observations table
      console.log('Trying weather_observations table...')
      const { data: obsData, error: obsError } = await supabase
        .from('weather_observations')
        .select(`
          *,
          weather_stations!inner(
            bom_id,
            station_name,
            latitude,
            longitude,
            height_meters,
            timezone
          )
        `)
        .order('observation_time_utc', { ascending: false })

      console.log('Weather observations query result:', { dataLength: obsData?.length, error: obsError })

      if (!obsError && obsData && obsData.length > 0) {
        console.log(`SUCCESS: Fetched ${obsData.length} weather observations from Supabase`)
        return NextResponse.json(obsData, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
      }
    }

    // Fallback to sample data if Supabase is not configured or fails
    const sampleData = [
      {
        bom_id: '086338',
        station_name: 'MELBOURNE (OLYMPIC PARK)',
        latitude: -37.8255,
        longitude: 144.9816,
        height_meters: 7.53,
        timezone: 'Australia/Melbourne',
        observation_time_utc: '2025-09-04T09:48:30Z',
        observation_time_local: '2025-09-04T19:48:30+10:00',
        temperature_celsius: 18.5,
        apparent_temperature_celsius: 16.2,
        dew_point_celsius: 12.1,
        max_temperature_celsius: 22.3,
        min_temperature_celsius: 8.7,
        station_pressure_hpa: 1013.2,
        sea_level_pressure_hpa: 1015.8,
        wind_speed_kmh: 15.2,
        wind_direction: 'SW',
        wind_direction_degrees: 240,
        wind_gust_kmh: 22.1,
        rainfall_1hr_mm: 0.0,
        rainfall_24hr_mm: 2.3,
        relative_humidity_percent: 65.4,
        visibility_km: 10.0,
        cloud_description: 'Partly cloudy',
        cloud_oktas: 4
      },
      {
        bom_id: '086282',
        station_name: 'MELBOURNE AIRPORT',
        latitude: -37.6654,
        longitude: 144.8322,
        height_meters: 113.4,
        timezone: 'Australia/Melbourne',
        observation_time_utc: '2025-09-04T09:48:30Z',
        observation_time_local: '2025-09-04T19:48:30+10:00',
        temperature_celsius: 17.8,
        apparent_temperature_celsius: 15.1,
        dew_point_celsius: 11.3,
        max_temperature_celsius: 21.9,
        min_temperature_celsius: 7.2,
        station_pressure_hpa: 1012.8,
        sea_level_pressure_hpa: 1015.4,
        wind_speed_kmh: 18.7,
        wind_direction: 'W',
        wind_direction_degrees: 270,
        wind_gust_kmh: 25.3,
        rainfall_1hr_mm: 0.0,
        rainfall_24hr_mm: 1.8,
        relative_humidity_percent: 62.1,
        visibility_km: 15.0,
        cloud_description: 'Clear',
        cloud_oktas: 2
      },
      {
        bom_id: '087113',
        station_name: 'AVALON AIRPORT',
        latitude: -38.0288,
        longitude: 144.4783,
        height_meters: 10.6,
        timezone: 'Australia/Melbourne',
        observation_time_utc: '2025-09-04T09:48:30Z',
        observation_time_local: '2025-09-04T19:48:30+10:00',
        temperature_celsius: 16.9,
        apparent_temperature_celsius: 14.3,
        dew_point_celsius: 10.8,
        max_temperature_celsius: 20.5,
        min_temperature_celsius: 6.9,
        station_pressure_hpa: 1014.1,
        sea_level_pressure_hpa: 1016.7,
        wind_speed_kmh: 22.4,
        wind_direction: 'SW',
        wind_direction_degrees: 225,
        wind_gust_kmh: 28.9,
        rainfall_1hr_mm: 0.0,
        rainfall_24hr_mm: 0.5,
        relative_humidity_percent: 58.7,
        visibility_km: 20.0,
        cloud_description: 'Mostly clear',
        cloud_oktas: 3
      },
      {
        bom_id: '086071',
        station_name: 'GEELONG RACECOURSE',
        latitude: -38.1667,
        longitude: 144.3500,
        height_meters: 8.0,
        timezone: 'Australia/Melbourne',
        observation_time_utc: '2025-09-04T09:48:30Z',
        observation_time_local: '2025-09-04T19:48:30+10:00',
        temperature_celsius: 19.2,
        apparent_temperature_celsius: 17.1,
        dew_point_celsius: 13.5,
        max_temperature_celsius: 23.1,
        min_temperature_celsius: 9.2,
        station_pressure_hpa: 1013.8,
        sea_level_pressure_hpa: 1016.4,
        wind_speed_kmh: 12.8,
        wind_direction: 'S',
        wind_direction_degrees: 180,
        wind_gust_kmh: 18.5,
        rainfall_1hr_mm: 0.0,
        rainfall_24hr_mm: 1.2,
        relative_humidity_percent: 68.3,
        visibility_km: 12.0,
        cloud_description: 'Partly cloudy',
        cloud_oktas: 5
      },
      {
        bom_id: '086338',
        station_name: 'FRANKSTON',
        latitude: -38.1500,
        longitude: 145.1167,
        height_meters: 10.0,
        timezone: 'Australia/Melbourne',
        observation_time_utc: '2025-09-04T09:48:30Z',
        observation_time_local: '2025-09-04T19:48:30+10:00',
        temperature_celsius: 20.1,
        apparent_temperature_celsius: 18.3,
        dew_point_celsius: 14.2,
        max_temperature_celsius: 24.5,
        min_temperature_celsius: 10.8,
        station_pressure_hpa: 1014.2,
        sea_level_pressure_hpa: 1016.8,
        wind_speed_kmh: 14.6,
        wind_direction: 'SE',
        wind_direction_degrees: 135,
        wind_gust_kmh: 20.1,
        rainfall_1hr_mm: 0.0,
        rainfall_24hr_mm: 0.8,
        relative_humidity_percent: 71.2,
        visibility_km: 8.0,
        cloud_description: 'Overcast',
        cloud_oktas: 7
      },
      {
        bom_id: '086282',
        station_name: 'BALLARAT AIRPORT',
        latitude: -37.5167,
        longitude: 143.7833,
        height_meters: 435.0,
        timezone: 'Australia/Melbourne',
        observation_time_utc: '2025-09-04T09:48:30Z',
        observation_time_local: '2025-09-04T19:48:30+10:00',
        temperature_celsius: 15.3,
        apparent_temperature_celsius: 12.8,
        dew_point_celsius: 8.9,
        max_temperature_celsius: 18.7,
        min_temperature_celsius: 4.2,
        station_pressure_hpa: 1008.5,
        sea_level_pressure_hpa: 1011.1,
        wind_speed_kmh: 25.8,
        wind_direction: 'NW',
        wind_direction_degrees: 315,
        wind_gust_kmh: 32.4,
        rainfall_1hr_mm: 0.0,
        rainfall_24hr_mm: 3.1,
        relative_humidity_percent: 55.6,
        visibility_km: 25.0,
        cloud_description: 'Clear',
        cloud_oktas: 1
      },
      {
        bom_id: '087113',
        station_name: 'BENDIGO AIRPORT',
        latitude: -36.7333,
        longitude: 144.3167,
        height_meters: 213.0,
        timezone: 'Australia/Melbourne',
        observation_time_utc: '2025-09-04T09:48:30Z',
        observation_time_local: '2025-09-04T19:48:30+10:00',
        temperature_celsius: 22.7,
        apparent_temperature_celsius: 20.9,
        dew_point_celsius: 16.8,
        max_temperature_celsius: 26.3,
        min_temperature_celsius: 12.4,
        station_pressure_hpa: 1010.2,
        sea_level_pressure_hpa: 1012.8,
        wind_speed_kmh: 16.3,
        wind_direction: 'NE',
        wind_direction_degrees: 45,
        wind_gust_kmh: 22.7,
        rainfall_1hr_mm: 0.0,
        rainfall_24hr_mm: 0.0,
        relative_humidity_percent: 63.4,
        visibility_km: 30.0,
        cloud_description: 'Clear',
        cloud_oktas: 0
      },
      {
        bom_id: '086071',
        station_name: 'SHEPPARTON AIRPORT',
        latitude: -36.4167,
        longitude: 145.3833,
        height_meters: 115.0,
        timezone: 'Australia/Melbourne',
        observation_time_utc: '2025-09-04T09:48:30Z',
        observation_time_local: '2025-09-04T19:48:30+10:00',
        temperature_celsius: 24.1,
        apparent_temperature_celsius: 22.5,
        dew_point_celsius: 18.2,
        max_temperature_celsius: 28.7,
        min_temperature_celsius: 14.6,
        station_pressure_hpa: 1011.8,
        sea_level_pressure_hpa: 1014.4,
        wind_speed_kmh: 11.2,
        wind_direction: 'E',
        wind_direction_degrees: 90,
        wind_gust_kmh: 15.8,
        rainfall_1hr_mm: 0.0,
        rainfall_24hr_mm: 0.0,
        relative_humidity_percent: 67.8,
        visibility_km: 20.0,
        cloud_description: 'Mostly clear',
        cloud_oktas: 2
      }
    ]

    return NextResponse.json(sampleData)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}