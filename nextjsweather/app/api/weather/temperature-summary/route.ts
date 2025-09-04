import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const { data, error } = await supabase
      .from('temperature_summary')
      .select('*')
      .limit(limit)
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch temperature summary' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
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
