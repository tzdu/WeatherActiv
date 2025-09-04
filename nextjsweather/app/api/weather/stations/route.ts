import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    // Try to fetch real data from Supabase first
    if (supabaseUrl && supabaseKey) {
      const { data, error } = await supabase
        .from('weather_stations')
        .select('*')
        .eq('is_active', true)
        .order('station_name')

      if (!error && data && data.length > 0) {
        console.log(`Fetched ${data.length} weather stations from Supabase`)
        return NextResponse.json(data)
      }
    }

    // Fallback to sample data if Supabase is not configured or fails
    const sampleStations = [
      {
        id: '1',
        wmo_id: '95936',
        bom_id: '086338',
        station_name: 'MELBOURNE (OLYMPIC PARK)',
        station_description: 'Melbourne (Olympic Park)',
        latitude: -37.8255,
        longitude: 144.9816,
        height_meters: 7.53,
        timezone: 'Australia/Melbourne',
        station_type: 'AWS',
        forecast_district_id: 'VIC_PW007',
        is_active: true,
        created_at: '2025-09-04T09:48:30Z',
        updated_at: '2025-09-04T09:48:30Z'
      },
      {
        id: '2',
        wmo_id: '94866',
        bom_id: '086282',
        station_name: 'MELBOURNE AIRPORT',
        station_description: 'Melbourne Airport',
        latitude: -37.6654,
        longitude: 144.8322,
        height_meters: 113.4,
        timezone: 'Australia/Melbourne',
        station_type: 'AWS',
        forecast_district_id: 'VIC_PW007',
        is_active: true,
        created_at: '2025-09-04T09:48:30Z',
        updated_at: '2025-09-04T09:48:30Z'
      },
      {
        id: '3',
        wmo_id: '94854',
        bom_id: '087113',
        station_name: 'AVALON AIRPORT',
        station_description: 'Avalon',
        latitude: -38.0288,
        longitude: 144.4783,
        height_meters: 10.6,
        timezone: 'Australia/Melbourne',
        station_type: 'AWS',
        forecast_district_id: 'VIC_PW007',
        is_active: true,
        created_at: '2025-09-04T09:48:30Z',
        updated_at: '2025-09-04T09:48:30Z'
      }
    ]

    return NextResponse.json(sampleStations)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}