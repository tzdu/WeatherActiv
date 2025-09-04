import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const station = searchParams.get('station')
    const days = searchParams.get('days') || '7'

    if (!station) {
      return NextResponse.json(
        { error: 'Station parameter is required' },
        { status: 400 }
      )
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - parseInt(days))

    // Fetch historical observations for the station
    const { data, error } = await supabase
      .from('weather_observations')
      .select('*')
      .eq('bom_id', station)
      .gte('observation_time_utc', startDate.toISOString())
      .lte('observation_time_utc', endDate.toISOString())
      .order('observation_time_utc', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch historical data' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
