import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const station = searchParams.get('station')
    const startYear = searchParams.get('startYear') || '2020'
    const endYear = searchParams.get('endYear') || new Date().getFullYear().toString()

    if (!station) {
      return NextResponse.json(
        { error: 'Station parameter is required' },
        { status: 400 }
      )
    }

    console.log(`Fetching monthly summary for station: ${station}, years: ${startYear}-${endYear}`)

    // First try weather_observations table (where our current data is)
    let { data, error } = await supabase
      .from('weather_observations')
      .select('*')
      .eq('bom_id', station)
      .gte('observation_time_utc', `${startYear}-01-01T00:00:00Z`)
      .lte('observation_time_utc', `${endYear}-12-31T23:59:59Z`)
      .order('observation_time_utc', { ascending: true })

    // Transform weather_observations data to match weather_historical schema
    if (data && data.length > 0) {
      console.log(`Found ${data.length} records in weather_observations for station ${station}`)
      data = data.map(obs => ({
        id: obs.id,
        station_name: obs.station_name,
        bom_id: obs.bom_id,
        latitude: null,
        longitude: null,
        date: obs.observation_time_utc.split('T')[0], // Extract date part
        max_temperature: obs.max_temperature_celsius,
        min_temperature: obs.min_temperature_celsius,
        rainfall_mm: obs.rainfall_24hr_mm,
        wind_speed_kmh: obs.wind_speed_kmh,
        wind_direction: obs.wind_direction,
        humidity_percent: obs.relative_humidity_percent,
        pressure_hpa: obs.station_pressure_hpa,
        created_at: obs.created_at
      }))
    } else {
      console.log(`No records found for station ${station} in weather_observations`)
      
      // Let's see what stations are available
      const { data: availableStations } = await supabase
        .from('weather_observations')
        .select('bom_id, station_name')
        .limit(10)
      
      console.log('Available stations in weather_observations:', availableStations)
    }

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch historical data' },
        { status: 500 }
      )
    }

    // Group data by year and month
    const monthlyData: { [key: string]: { [key: string]: any } } = {}
    
    data?.forEach(record => {
      const date = new Date(record.date)
      const year = date.getFullYear().toString()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const key = `${year}-${month}`
      
      if (!monthlyData[year]) {
        monthlyData[year] = {}
      }
      
      if (!monthlyData[year][month]) {
        monthlyData[year][month] = {
          year: parseInt(year),
          month: parseInt(month),
          monthName: date.toLocaleString('default', { month: 'short' }),
          station_name: record.station_name,
          bom_id: record.bom_id,
          dataPoints: 0,
          avgMaxTemp: 0,
          avgMinTemp: 0,
          totalRainfall: 0,
          avgWindSpeed: 0,
          avgHumidity: 0,
          avgPressure: 0,
          maxTemp: null,
          minTemp: null,
          maxRainfall: 0,
          maxWindSpeed: 0,
          tempSum: 0,
          minTempSum: 0,
          rainfallSum: 0,
          windSum: 0,
          humiditySum: 0,
          pressureSum: 0
        }
      }
      
      const monthData = monthlyData[year][month]
      monthData.dataPoints++
      
      // Accumulate values for averages
      if (record.max_temperature !== null) {
        monthData.tempSum += record.max_temperature
        if (monthData.maxTemp === null || record.max_temperature > monthData.maxTemp) {
          monthData.maxTemp = record.max_temperature
        }
      }
      
      if (record.min_temperature !== null) {
        monthData.minTempSum += record.min_temperature
        if (monthData.minTemp === null || record.min_temperature < monthData.minTemp) {
          monthData.minTemp = record.min_temperature
        }
      }
      
      if (record.rainfall_mm !== null) {
        monthData.rainfallSum += record.rainfall_mm
        if (record.rainfall_mm > monthData.maxRainfall) {
          monthData.maxRainfall = record.rainfall_mm
        }
      }
      
      if (record.wind_speed_kmh !== null) {
        monthData.windSum += record.wind_speed_kmh
        if (record.wind_speed_kmh > monthData.maxWindSpeed) {
          monthData.maxWindSpeed = record.wind_speed_kmh
        }
      }
      
      if (record.humidity_percent !== null) {
        monthData.humiditySum += record.humidity_percent
      }
      
      if (record.pressure_hpa !== null) {
        monthData.pressureSum += record.pressure_hpa
      }
    })

    // Calculate averages and clean up data
    const result: any[] = []
    Object.keys(monthlyData).sort().forEach(year => {
      Object.keys(monthlyData[year]).sort().forEach(month => {
        const data = monthlyData[year][month]
        
        // Calculate averages
        data.avgMaxTemp = data.tempSum / data.dataPoints
        data.avgMinTemp = data.minTempSum / data.dataPoints
        data.totalRainfall = data.rainfallSum
        data.avgWindSpeed = data.windSum / data.dataPoints
        data.avgHumidity = data.humiditySum / data.dataPoints
        data.avgPressure = data.pressureSum / data.dataPoints
        
        // Remove temporary fields
        delete data.tempSum
        delete data.minTempSum
        delete data.rainfallSum
        delete data.windSum
        delete data.humiditySum
        delete data.pressureSum
        
        result.push(data)
      })
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
