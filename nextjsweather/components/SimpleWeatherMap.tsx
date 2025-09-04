'use client'

import { useState } from 'react'
import { CurrentWeather, WeatherStation } from '@/lib/supabase'
import { MapPin, Thermometer, Wind, Droplets, Eye, Cloud, X } from 'lucide-react'

interface SimpleWeatherMapProps {
  weatherData: CurrentWeather[]
  stations: WeatherStation[]
}

interface WeatherPopupProps {
  weather: CurrentWeather
  onClose: () => void
}

function WeatherPopup({ weather, onClose }: WeatherPopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {weather.station_name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Weather Content */}
        <div className="p-6">
          {/* Main Temperature */}
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {weather.temperature_celsius?.toFixed(1) || 'N/A'}°C
            </div>
            <div className="text-lg text-gray-600 dark:text-gray-300">
              Feels like {weather.apparent_temperature_celsius?.toFixed(1) || 'N/A'}°C
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {weather.cloud_description || 'Clear skies'}
            </div>
          </div>

          {/* Weather Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Temperature Range */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Temperature</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div>Max: {weather.max_temperature_celsius?.toFixed(1) || 'N/A'}°C</div>
                <div>Min: {weather.min_temperature_celsius?.toFixed(1) || 'N/A'}°C</div>
              </div>
            </div>

            {/* Wind */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Wind</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div>{weather.wind_speed_kmh?.toFixed(1) || 'N/A'} km/h</div>
                <div>{weather.wind_direction || 'N/A'}</div>
                {weather.wind_gust_kmh && (
                  <div className="text-xs">Gust: {weather.wind_gust_kmh.toFixed(1)} km/h</div>
                )}
              </div>
            </div>

            {/* Rainfall */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rainfall</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div>1hr: {weather.rainfall_1hr_mm?.toFixed(1) || '0.0'} mm</div>
                <div>24hr: {weather.rainfall_24hr_mm?.toFixed(1) || '0.0'} mm</div>
              </div>
            </div>

            {/* Humidity & Visibility */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Conditions</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div>Humidity: {weather.relative_humidity_percent?.toFixed(1) || 'N/A'}%</div>
                <div>Visibility: {weather.visibility_km?.toFixed(1) || 'N/A'} km</div>
              </div>
            </div>
          </div>

          {/* Pressure */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pressure</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div>Station: {weather.station_pressure_hpa?.toFixed(1) || 'N/A'} hPa</div>
              <div>Sea Level: {weather.sea_level_pressure_hpa?.toFixed(1) || 'N/A'} hPa</div>
            </div>
          </div>

          {/* Station Info */}
          <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div>Station ID: {weather.bom_id}</div>
            <div>Coordinates: {weather.latitude?.toFixed(4)}, {weather.longitude?.toFixed(4)}</div>
            <div>Elevation: {weather.height_meters?.toFixed(1) || 'N/A'}m</div>
            <div>Last Updated: {new Date(weather.observation_time_utc).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SimpleWeatherMap({ weatherData, stations }: SimpleWeatherMapProps) {
  const [selectedWeather, setSelectedWeather] = useState<CurrentWeather | null>(null)

  // Group stations by temperature for color coding
  const getTemperatureColor = (temp: number | null) => {
    if (!temp) return 'bg-gray-500'
    if (temp > 25) return 'bg-red-500'
    if (temp > 15) return 'bg-orange-500'
    return 'bg-blue-500'
  }

  return (
    <div className="w-full h-full relative">
      {/* Simple Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 p-4">
        {weatherData.map((weather) => (
          <button
            key={weather.bom_id}
            onClick={() => setSelectedWeather(weather)}
            className={`${getTemperatureColor(weather.temperature_celsius)} text-white rounded-lg p-3 hover:scale-105 transition-transform shadow-lg`}
          >
            <div className="text-center">
              <div className="text-lg font-bold">
                {weather.temperature_celsius?.toFixed(0) || 'N/A'}°
              </div>
              <div className="text-xs mt-1 truncate" title={weather.station_name}>
                {weather.station_name.split(' ')[0]}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Weather Popup */}
      {selectedWeather && (
        <WeatherPopup 
          weather={selectedWeather} 
          onClose={() => setSelectedWeather(null)} 
        />
      )}

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Temperature Legend</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Hot (&gt;25°C)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Warm (15-25°C)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Cold (&lt;15°C)</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Click stations for details
        </p>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🗺️ Station Grid</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Each tile represents a weather station. Click any tile to see detailed weather information.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          For a full interactive map, set up your HERE Maps API key.
        </p>
      </div>
    </div>
  )
}
