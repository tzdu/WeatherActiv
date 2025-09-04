import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const station = searchParams.get('station')
    const year = searchParams.get('year')
    const limit = parseInt(searchParams.get('limit') || '365')
    
    let query = supabase
      .from('weather_historical')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit)
    
    if (station) {
      query = query.eq('station_name', station)
    }
    
    if (year) {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      query = query.gte('date', startDate).lte('date', endDate)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch historical data' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      station: station,
      year: year,
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
