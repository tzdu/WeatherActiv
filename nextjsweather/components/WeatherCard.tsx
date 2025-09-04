'use client'

import { CurrentWeather } from '@/lib/supabase'
import { Thermometer, Droplets, Wind, Eye, Cloud, Gauge } from 'lucide-react'

interface WeatherCardProps {
  weather: CurrentWeather
  className?: string
}

export default function WeatherCard({ weather, className = '' }: WeatherCardProps) {
  const getTemperatureColor = (temp: number) => {
    if (temp >= 35) return 'text-weather-hot'
    if (temp >= 25) return 'text-weather-warm'
    if (temp >= 15) return 'text-weather-mild'
    if (temp >= 5) return 'text-weather-cool'
    return 'text-weather-cold'
  }

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Australia/Melbourne'
    })
  }

  return (
    <div className={`weather-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {weather.station_name}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatTime(weather.observation_time_local)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className={`temperature-display ${getTemperatureColor(weather.temperature_celsius)}`}>
            {weather.temperature_celsius?.toFixed(1) || 'N/A'}°C
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Feels like {weather.apparent_temperature_celsius?.toFixed(1) || 'N/A'}°C
          </div>
        </div>
        
        <div className="space-y-2">
          {weather.max_temperature_celsius && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Max:</span>
              <span className="font-medium">{weather.max_temperature_celsius.toFixed(1)}°C</span>
            </div>
          )}
          {weather.min_temperature_celsius && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Min:</span>
              <span className="font-medium">{weather.min_temperature_celsius.toFixed(1)}°C</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="weather-metric">
          <div className="flex items-center">
            <Wind className="weather-icon text-blue-500 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Wind</span>
          </div>
          <span className="text-sm font-medium">
            {weather.wind_direction} {weather.wind_speed_kmh?.toFixed(0) || 0} km/h
            {weather.wind_gust_kmh && weather.wind_gust_kmh > weather.wind_speed_kmh && (
              <span className="text-orange-500 ml-1">
                (Gusts {weather.wind_gust_kmh.toFixed(0)})
              </span>
            )}
          </span>
        </div>

        <div className="weather-metric">
          <div className="flex items-center">
            <Droplets className="weather-icon text-blue-400 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Humidity</span>
          </div>
          <span className="text-sm font-medium">
            {weather.relative_humidity_percent?.toFixed(0) || 'N/A'}%
          </span>
        </div>

        <div className="weather-metric">
          <div className="flex items-center">
            <Gauge className="weather-icon text-purple-500 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Pressure</span>
          </div>
          <span className="text-sm font-medium">
            {weather.sea_level_pressure_hpa?.toFixed(0) || 'N/A'} hPa
          </span>
        </div>

        {weather.rainfall_1hr_mm && weather.rainfall_1hr_mm > 0 && (
          <div className="weather-metric">
            <div className="flex items-center">
              <Droplets className="weather-icon text-cyan-500 mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Rain (1h)</span>
            </div>
            <span className="text-sm font-medium">
              {weather.rainfall_1hr_mm.toFixed(1)} mm
            </span>
          </div>
        )}

        {weather.visibility_km && (
          <div className="weather-metric">
            <div className="flex items-center">
              <Eye className="weather-icon text-gray-500 mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Visibility</span>
            </div>
            <span className="text-sm font-medium">
              {weather.visibility_km.toFixed(1)} km
            </span>
          </div>
        )}

        {weather.cloud_description && (
          <div className="weather-metric">
            <div className="flex items-center">
              <Cloud className="weather-icon text-gray-400 mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Clouds</span>
            </div>
            <span className="text-sm font-medium">
              {weather.cloud_description}
              {weather.cloud_oktas && ` (${weather.cloud_oktas}/8)`}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div>ID: {weather.bom_id}</div>
          <div>Location: {weather.latitude?.toFixed(4)}, {weather.longitude?.toFixed(4)}</div>
          {weather.height_meters && <div>Elevation: {weather.height_meters.toFixed(1)}m</div>}
        </div>
      </div>
    </div>
  )
}
