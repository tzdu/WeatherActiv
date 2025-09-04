'use client'

import { useEffect, useRef, useState } from 'react'
import { CurrentWeather, WeatherStation } from '@/lib/supabase'
import { MapPin, Thermometer, Wind, Droplets, Eye, Cloud, Search, X } from 'lucide-react'

interface WeatherMapProps {
  weatherData: CurrentWeather[]
  stations: WeatherStation[]
}

interface WeatherPopupProps {
  weather: CurrentWeather
  onClose: () => void
}

function WeatherPopup({ weather, onClose }: WeatherPopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
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
            ×
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
            <div>Elevation: {weather.height_meters?.toFixed(1) || 'N/A'}m</div>
            <div>Last Updated: {new Date(weather.observation_time_utc).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WeatherMap({ weatherData, stations }: WeatherMapProps) {
  const [selectedWeather, setSelectedWeather] = useState<CurrentWeather | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [nearestWeather, setNearestWeather] = useState<CurrentWeather | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const searchMarker = useRef<any>(null)

  // Function to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Function to find nearest weather station
  const findNearestWeatherStation = (lat: number, lng: number) => {
    let nearest: CurrentWeather | null = null
    let minDistance = Infinity

    weatherData.forEach(weather => {
      if (weather.latitude && weather.longitude) {
        const distance = calculateDistance(lat, lng, weather.latitude, weather.longitude)
        if (distance < minDistance) {
          minDistance = distance
          nearest = weather
        }
      }
    })

    return { station: nearest, distance: minDistance }
  }

  // Function to geocode address using OpenStreetMap Nominatim API
  const geocodeAddress = async (address: string) => {
    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&countrycodes=au&addressdetails=1`
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Geocoding error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Function to handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      await geocodeAddress(searchQuery.trim())
    }
  }

  // Function to select a search result
  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    
    setSelectedLocation(result)
    setSearchResults([])
    setSearchQuery(result.display_name)

    // Find nearest weather station
    const { station, distance } = findNearestWeatherStation(lat, lng)
    setNearestWeather(station)

    // Add marker for searched location
    if (mapInstance.current) {
      // Remove existing search marker
      if (searchMarker.current) {
        mapInstance.current.removeLayer(searchMarker.current)
      }

      // Add new search marker
      const L = (window as any).L
      const searchIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background-color: #8B5CF6;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            PIN
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      })

      searchMarker.current = L.marker([lat, lng], { icon: searchIcon })
        .addTo(mapInstance.current)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-lg">${result.display_name}</h3>
            <p class="text-sm text-gray-600">Searched Location</p>
            ${station ? `
              <p class="text-sm text-gray-600 mt-2">
                Nearest Weather Station: <strong>${(station as CurrentWeather).station_name || 'Unknown'}</strong><br>
                Distance: <strong>${distance.toFixed(1)} km</strong><br>
                Temperature: <strong>${(station as CurrentWeather).temperature_celsius?.toFixed(1) || 'N/A'}°C</strong>
              </p>
              <button onclick="window.showNearestWeather()" class="mt-2 px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600">
                View Weather Details
              </button>
            ` : '<p class="text-sm text-gray-600 mt-2">No weather data available</p>'}
          </div>
        `)

      // Center map on searched location
      mapInstance.current.setView([lat, lng], 12)
    }
  }

  // Function to clear search
  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setSelectedLocation(null)
    setNearestWeather(null)
    
    if (searchMarker.current && mapInstance.current) {
      mapInstance.current.removeLayer(searchMarker.current)
      searchMarker.current = null
    }
  }

  // Initialize Leaflet Map (much simpler than HERE Maps)
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || mapLoaded) return

      // Load Leaflet CSS and JS
      const cssLink = document.createElement('link')
      cssLink.rel = 'stylesheet'
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(cssLink)

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => {
        try {
          const L = (window as any).L
          
          // Create map centered on Melbourne
          const map = L.map(mapRef.current).setView([-37.8136, 144.9631], 8)
          mapInstance.current = map
          
          // Add OpenStreetMap tiles (free, no API key needed)
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map)

          // Add weather station markers
          weatherData.forEach(weather => {
            if (!weather.latitude || !weather.longitude) return

            // Create custom marker icon based on temperature
            const temp = weather.temperature_celsius || 0
            let color = '#3B82F6' // blue (cold)
            if (temp > 25) color = '#EF4444' // red (hot)
            else if (temp > 15) color = '#F59E0B' // orange (warm)

            const customIcon = L.divIcon({
              className: 'custom-div-icon',
              html: `
                <div style="
                  background-color: ${color};
                  width: 32px;
                  height: 32px;
                  border-radius: 50%;
                  border: 2px solid white;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: 10px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">
                  ${temp.toFixed(0)}°
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            })

            const marker = L.marker([weather.latitude, weather.longitude], { icon: customIcon })
              .addTo(map)
              .bindPopup(`
                <div class="p-2">
                  <h3 class="font-bold text-lg">${weather.station_name}</h3>
                  <p class="text-2xl font-bold text-blue-600">${weather.temperature_celsius?.toFixed(1) || 'N/A'}°C</p>
                  <p class="text-sm text-gray-600">${weather.wind_speed_kmh?.toFixed(1) || 'N/A'} km/h ${weather.wind_direction || ''}</p>
                  <p class="text-sm text-gray-600">Humidity: ${weather.relative_humidity_percent?.toFixed(1) || 'N/A'}%</p>
                  <button onclick="window.openWeatherPopup('${weather.bom_id}')" class="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                    View Details
                  </button>
                </div>
              `)

            // Add click event for detailed popup
            marker.on('click', () => {
              setSelectedWeather(weather)
            })
          })

          // Fit map to show all markers
          if (weatherData.length > 0) {
            const group = new L.featureGroup()
            weatherData.forEach(weather => {
              if (weather.latitude && weather.longitude) {
                group.addLayer(L.marker([weather.latitude, weather.longitude]))
              }
            })
            map.fitBounds(group.getBounds().pad(0.1))
          }

          setMapLoaded(true)
        } catch (error) {
          console.error('Error initializing Leaflet map:', error)
        }
      }
      script.onerror = () => {
        console.error('Failed to load Leaflet')
      }
      document.head.appendChild(script)
    }

    initMap()
  }, [weatherData, mapLoaded])

  return (
    <div className="w-full h-full relative">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 z-[1000] w-80">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for an address in Australia..."
              className="w-full px-4 py-3 pr-12 pl-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto z-[9999]">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => selectSearchResult(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                >
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {result.display_name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {result.lat}, {result.lon}
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {/* Loading Indicator */}
          {isSearching && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 text-center z-[9999]">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Searching...</p>
            </div>
          )}
        </form>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '500px' }}
      />
      
      {/* Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading Map...</p>
          </div>
        </div>
      )}

      {/* Weather Popup */}
      {selectedWeather && (
        <WeatherPopup 
          weather={selectedWeather} 
          onClose={() => setSelectedWeather(null)} 
        />
      )}

      {/* Nearest Weather Popup for Searched Location */}
      {nearestWeather && selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Weather Near Your Location
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {selectedLocation.display_name}
                </p>
              </div>
              <button
                onClick={() => {
                  setNearestWeather(null)
                  setSelectedLocation(null)
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Nearest Station Info */}
            <div className="p-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Nearest Weather Station
                </h4>
                <p className="text-blue-800 dark:text-blue-200">
                  <strong>{nearestWeather.station_name}</strong><br/>
                  Distance: {calculateDistance(
                    parseFloat(selectedLocation.lat),
                    parseFloat(selectedLocation.lon),
                    nearestWeather.latitude!,
                    nearestWeather.longitude!
                  ).toFixed(1)} km away
                </p>
              </div>

              {/* Weather Content */}
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {nearestWeather.temperature_celsius?.toFixed(1) || 'N/A'}°C
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-300">
                  Feels like {nearestWeather.apparent_temperature_celsius?.toFixed(1) || 'N/A'}°C
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {nearestWeather.cloud_description || 'Clear skies'}
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
                    <div>Max: {nearestWeather.max_temperature_celsius?.toFixed(1) || 'N/A'}°C</div>
                    <div>Min: {nearestWeather.min_temperature_celsius?.toFixed(1) || 'N/A'}°C</div>
                  </div>
                </div>

                {/* Wind */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Wind</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div>{nearestWeather.wind_speed_kmh?.toFixed(1) || 'N/A'} km/h</div>
                    <div>{nearestWeather.wind_direction || 'N/A'}</div>
                    {nearestWeather.wind_gust_kmh && (
                      <div className="text-xs">Gust: {nearestWeather.wind_gust_kmh.toFixed(1)} km/h</div>
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
                    <div>1hr: {nearestWeather.rainfall_1hr_mm?.toFixed(1) || '0.0'} mm</div>
                    <div>24hr: {nearestWeather.rainfall_24hr_mm?.toFixed(1) || '0.0'} mm</div>
                  </div>
                </div>

                {/* Humidity & Visibility */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-5 w-5 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Conditions</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div>Humidity: {nearestWeather.relative_humidity_percent?.toFixed(1) || 'N/A'}%</div>
                    <div>Visibility: {nearestWeather.visibility_km?.toFixed(1) || 'N/A'} km</div>
                  </div>
                </div>
              </div>

              {/* Station Info */}
              <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div>Station ID: {nearestWeather.bom_id}</div>
                <div>Elevation: {nearestWeather.height_meters?.toFixed(1) || 'N/A'}m</div>
                <div>Last Updated: {new Date(nearestWeather.observation_time_utc).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-[1000]">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Map Legend</h4>
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
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">PIN</div>
            <span className="text-gray-700 dark:text-gray-300">Searched Location</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Click markers for details
        </p>
      </div>
    </div>
  )
}
