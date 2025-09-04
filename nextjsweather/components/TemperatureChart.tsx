'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { WeatherObservation } from '@/lib/supabase'

interface TemperatureChartProps {
  data: WeatherObservation[]
  className?: string
}

export default function TemperatureChart({ data, className = '' }: TemperatureChartProps) {
  // Transform data for the chart
  const chartData = data.map(obs => ({
    time: new Date(obs.observation_time_utc).toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Australia/Melbourne'
    }),
    temperature: obs.temperature_celsius,
    apparent: obs.apparent_temperature_celsius,
    dewPoint: obs.dew_point_celsius,
    maxTemp: obs.max_temperature_celsius,
    minTemp: obs.min_temperature_celsius,
    humidity: obs.relative_humidity_percent,
    pressure: obs.sea_level_pressure_hpa,
    windSpeed: obs.wind_speed_kmh,
    rainfall: obs.rainfall_1hr_mm
  })).reverse() // Reverse to show chronological order

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value?.toFixed(1)}${getUnit(entry.dataKey)}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const getUnit = (dataKey: string) => {
    switch (dataKey) {
      case 'temperature':
      case 'apparent':
      case 'dewPoint':
      case 'maxTemp':
      case 'minTemp':
        return '°C'
      case 'humidity':
        return '%'
      case 'pressure':
        return ' hPa'
      case 'windSpeed':
        return ' km/h'
      case 'rainfall':
        return ' mm'
      default:
        return ''
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className={`weather-card ${className}`}>
        <h3 className="text-lg font-semibold mb-4">Temperature History</h3>
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No temperature data available
        </div>
      </div>
    )
  }

  return (
    <div className={`weather-card ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Temperature History</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Temperature"
            />
            <Line 
              type="monotone" 
              dataKey="apparent" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Feels Like"
            />
            <Line 
              type="monotone" 
              dataKey="dewPoint" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Dew Point"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
