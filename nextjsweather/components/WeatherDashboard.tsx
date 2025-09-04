'use client'

import { useState, useEffect } from 'react'
import { CurrentWeather, WeatherObservation, WeatherStation } from '@/lib/supabase'
import WeatherCard from './WeatherCard'
import TemperatureChart from './TemperatureChart'
import { RefreshCw, MapPin, Thermometer, Wind, Droplets, Calendar, Plus, Settings, BarChart3, Map } from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  location: string
  stationId: string
  description: string
  createdAt: Date
}

export default function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState<CurrentWeather[]>([])
  const [stations, setStations] = useState<WeatherStation[]>([])
  const [historicalData, setHistoricalData] = useState<WeatherObservation[]>([])
  const [selectedStation, setSelectedStation] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  // Project management state
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Melbourne CBD Project',
      location: 'MELBOURNE (OLYMPIC PARK)',
      stationId: '086338',
      description: 'Urban weather monitoring for city center',
      createdAt: new Date('2025-01-01')
    },
    {
      id: '2', 
      name: 'Airport Operations',
      location: 'MELBOURNE AIRPORT',
      stationId: '086282',
      description: 'Aviation weather tracking',
      createdAt: new Date('2025-01-15')
    }
  ])
  const [selectedProject, setSelectedProject] = useState<string>('1')
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    location: '',
    stationId: '',
    description: ''
  })

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
      
      // Set first station as default if none selected
      if (data.length > 0 && !selectedStation) {
        setSelectedStation(data[0].bom_id)
      }
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

  // Fetch historical data for selected station
  const fetchHistoricalData = async (stationId: string) => {
    if (!stationId) return
    
    try {
      const response = await fetch(`/api/weather/historical?station=${stationId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setHistoricalData(data)
    } catch (err) {
      console.error('Error fetching historical data:', err)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchWeatherData()
    fetchStations()
  }, [])

  // Fetch historical data when station changes
  useEffect(() => {
    if (selectedStation) {
      fetchHistoricalData(selectedStation)
    }
  }, [selectedStation])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    fetchWeatherData()
  }

  // Project management functions
  const handleCreateProject = () => {
    if (newProject.name && newProject.stationId) {
      const project: Project = {
        id: Date.now().toString(),
        name: newProject.name,
        location: newProject.location,
        stationId: newProject.stationId,
        description: newProject.description,
        createdAt: new Date()
      }
      setProjects([...projects, project])
      setSelectedProject(project.id)
      setNewProject({ name: '', location: '', stationId: '', description: '' })
      setShowNewProject(false)
    }
  }

  const selectedProjectData = projects.find(p => p.id === selectedProject)
  const selectedStationData = weatherData.find(station => station.bom_id === selectedProjectData?.stationId)

  // Generate fake historical data for calendar heatmap
  const generateCalendarData = () => {
    const data = []
    const currentDate = new Date()
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      // Generate fake temperature data
      const baseTemp = selectedStationData?.temperature_celsius || 20
      const variation = (Math.random() - 0.5) * 10
      const temp = Math.max(0, Math.min(40, baseTemp + variation))
      
      data.push({
        date: date.toISOString().split('T')[0],
        temperature: temp,
        rainfall: Math.random() * 20,
        intensity: Math.floor(Math.random() * 4) + 1 // 1-4 intensity levels
      })
    }
    return data
  }

  const calendarData = generateCalendarData()

  // Calendar Heatmap Component
  const CalendarHeatmap = () => {
    const getIntensityColor = (intensity: number) => {
      switch (intensity) {
        case 1: return 'bg-blue-100 dark:bg-blue-900/20'
        case 2: return 'bg-blue-200 dark:bg-blue-800/30'
        case 3: return 'bg-blue-300 dark:bg-blue-700/40'
        case 4: return 'bg-blue-400 dark:bg-blue-600/50'
        default: return 'bg-gray-100 dark:bg-gray-700'
      }
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Monthly Weather Heatmap - {selectedProjectData?.name}
          </h2>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 p-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((day, index) => (
            <div
              key={index}
              className={`aspect-square rounded-sm ${getIntensityColor(day.intensity)} border border-gray-200 dark:border-gray-600 flex flex-col items-center justify-center text-xs p-1 hover:scale-110 transition-transform cursor-pointer`}
              title={`${day.date}: ${day.temperature.toFixed(1)}°C, ${day.rainfall.toFixed(1)}mm`}
            >
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {day.temperature.toFixed(0)}°
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {day.rainfall.toFixed(0)}mm
              </span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(intensity => (
              <div
                key={intensity}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    )
  }

  if (loading && weatherData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading weather data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Weatheractiv Dashboard
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
              href="/map"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Map className="h-4 w-4" />
              Map View
            </Link>
            <button
              onClick={() => setShowNewProject(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
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

        {/* Project Selection */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Project Management</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Project:
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} - {project.location}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Info */}
            {selectedProjectData && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedProjectData.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  <strong>Location:</strong> {selectedProjectData.location}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  <strong>Station ID:</strong> {selectedProjectData.stationId}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Description:</strong> {selectedProjectData.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* New Project Modal */}
        {showNewProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Project</h3>
                <button
                  onClick={() => setShowNewProject(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter project name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Weather Station
                  </label>
                  <select
                    value={newProject.stationId}
                    onChange={(e) => {
                      const station = stations.find(s => s.bom_id === e.target.value)
                      setNewProject({
                        ...newProject, 
                        stationId: e.target.value,
                        location: station?.station_name || ''
                      })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a station...</option>
                    {stations.map((station) => (
                      <option key={station.bom_id} value={station.bom_id}>
                        {station.station_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter project description"
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleCreateProject}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Create Project
                  </button>
                  <button
                    onClick={() => setShowNewProject(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Project Weather Stats */}
        {selectedStationData && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Current Weather - {selectedProjectData?.name}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3">
                  <Thermometer className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current Temperature</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedStationData.temperature_celsius?.toFixed(1) || 'N/A'}°C
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3">
                  <Wind className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Wind Speed</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedStationData.wind_speed_kmh?.toFixed(1) || 'N/A'} km/h
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3">
                  <Droplets className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">24hr Rainfall</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedStationData.rainfall_24hr_mm?.toFixed(1) || '0.0'} mm
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3">
                  <MapPin className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Humidity</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedStationData.relative_humidity_percent?.toFixed(1) || 'N/A'}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Heatmap */}
        {selectedProjectData && <CalendarHeatmap />}

        {/* Historical Chart */}
        {selectedStationData && historicalData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Thermometer className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Temperature History - {selectedStationData.station_name}
              </h2>
            </div>
            <TemperatureChart data={historicalData} />
          </div>
        )}

        {/* Project Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{projects.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Stations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{weatherData.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Data Points</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{calendarData.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}