import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const station = searchParams.get('station')
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    if (!station) {
      return NextResponse.json(
        { error: 'Station parameter is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('weather_historical')
      .select('*')
      .eq('bom_id', station)

    // If year is specified, filter by year
    if (year) {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      query = query.gte('date', startDate).lte('date', endDate)
    }

    // If month is specified, filter by month
    if (month) {
      const monthNum = parseInt(month)
      if (monthNum >= 1 && monthNum <= 12) {
        const yearToUse = year || new Date().getFullYear().toString()
        const startDate = `${yearToUse}-${monthNum.toString().padStart(2, '0')}-01`
        const endDate = new Date(parseInt(yearToUse), monthNum, 0).toISOString().split('T')[0]
        query = query.gte('date', startDate).lte('date', endDate)
      }
    }

    const { data, error } = await query.order('date', { ascending: true })

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