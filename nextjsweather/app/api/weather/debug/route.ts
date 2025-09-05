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
    console.log('=== DEBUG API CALLED ===', timestamp)
    
    const results: any = {
      timestamp,
      environment: {
        supabaseUrl: supabaseUrl ? 'SET' : 'NOT SET',
        supabaseKey: supabaseKey ? 'SET' : 'NOT SET'
      },
      tables: {}
    }
    
    // Check current_weather table
    try {
      const { data: currentWeather, error: currentError } = await supabase
        .from('current_weather')
        .select('*')
        .limit(5)
      
      results.tables.current_weather = {
        count: currentWeather?.length || 0,
        error: currentError?.message || null,
        sample: currentWeather?.[0] || null
      }
    } catch (e) {
      results.tables.current_weather = { error: e instanceof Error ? e.message : String(e) }
    }
    
    // Check weather_observations table
    try {
      const { data: observations, error: obsError } = await supabase
        .from('weather_observations')
        .select('*')
        .limit(5)
      
      results.tables.weather_observations = {
        count: observations?.length || 0,
        error: obsError?.message || null,
        sample: observations?.[0] || null
      }
    } catch (e) {
      results.tables.weather_observations = { error: e instanceof Error ? e.message : String(e) }
    }
    
    // Check weather_stations table
    try {
      const { data: stations, error: stationsError } = await supabase
        .from('weather_stations')
        .select('*')
        .limit(5)
      
      results.tables.weather_stations = {
        count: stations?.length || 0,
        error: stationsError?.message || null,
        sample: stations?.[0] || null
      }
    } catch (e) {
      results.tables.weather_stations = { error: e instanceof Error ? e.message : String(e) }
    }
    
    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { error: 'Debug API failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
