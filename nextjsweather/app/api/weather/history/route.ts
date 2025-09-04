import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const station = searchParams.get('station')
    const days = parseInt(searchParams.get('days') || '7')
    const limit = parseInt(searchParams.get('limit') || '100')
    
    if (!station) {
      return NextResponse.json(
        { error: 'Station parameter is required' },
        { status: 400 }
      )
    }
    
    // Calculate start date
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('weather_observations')
      .select('*')
      .eq('bom_id', station)
      .gte('observation_time_utc', startDate.toISOString())
      .order('observation_time_utc', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch historical weather data' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      station: station,
      days: days,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
