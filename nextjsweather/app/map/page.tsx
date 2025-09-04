'use client'

import { useState, useEffect } from 'react'
import { CurrentWeather, WeatherStation } from '@/lib/supabase'
import WeatherMap from '@/components/WeatherMap'
import { RefreshCw, MapPin, Thermometer, Wind, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function MapPage() {
  const [weatherData, setWeatherData] = useState<CurrentWeather[]>([])
  const [stations, setStations] = useState<WeatherStation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Fetch current weather data from Supabase
  const fetchWeatherData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/weather/current')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setWeatherData(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching weather data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch stations data
  const fetchStations = async () => {
    try {
      const response = await fetch('/api/weather/stations')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setStations(data)
    } catch (err) {
      console.error('Error fetching stations:', err)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchWeatherData()
    fetchStations()
  }, [])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    fetchWeatherData()
  }

  if (loading && weatherData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading weather map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Weatheractiv Map
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Weather stations in construction across Victoria
            </p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard View
            </Link>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-red-800 dark:text-red-200">
              Warning: {error}
            </p>
            <button
              onClick={fetchWeatherData}
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Data Status */}
        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-800 dark:text-green-200 font-medium">
              Live Data Connected - {weatherData.length} stations active
            </span>
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="h-[600px] w-full">
            <WeatherMap weatherData={weatherData} stations={stations} />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Stations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{weatherData.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <Thermometer className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Temperature</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {weatherData.length > 0 
                    ? `${(weatherData.reduce((sum, station) => sum + (station.temperature_celsius || 0), 0) / weatherData.length).toFixed(1)}°C`
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <Wind className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Wind Speed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {weatherData.length > 0 
                    ? `${(weatherData.reduce((sum, station) => sum + (station.wind_speed_kmh || 0), 0) / weatherData.length).toFixed(1)} km/h`
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            How to Use the Map
          </h3>
          <ul className="text-blue-800 dark:text-blue-200 space-y-1">
            <li>• <strong>Click on any weather station marker</strong> to see detailed weather information</li>
            <li>• <strong>Zoom and pan</strong> to explore different areas of Victoria</li>
            <li>• <strong>Color-coded markers</strong> show temperature: Red (hot), Orange (warm), Blue (cold)</li>
            <li>• <strong>Auto-refresh</strong> every 5 minutes for the latest data</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
