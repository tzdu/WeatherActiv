import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const station = searchParams.get('station') || '086338'

    // Get unique stations in weather_historical
    const { data: stations, error: stationsError } = await supabase
      .from('weather_historical')
      .select('bom_id, station_name')
      .order('bom_id')

    // Get sample data for the specific station
    const { data: stationData, error: stationError } = await supabase
      .from('weather_historical')
      .select('*')
      .eq('bom_id', station)
      .limit(5)

    // Get total count
    const { count, error: countError } = await supabase
      .from('weather_historical')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      totalRecords: count,
      availableStations: stations,
      sampleDataForStation: stationData,
      errors: {
        stations: stationsError,
        station: stationError,
        count: countError
      }
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
