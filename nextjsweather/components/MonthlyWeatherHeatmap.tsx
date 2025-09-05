'use client'

import { useState, useEffect } from 'react'
import { Calendar, Thermometer, Droplets, Wind, Eye, TrendingUp } from 'lucide-react'

interface MonthlyData {
  year: number
  month: number
  monthName: string
  station_name: string
  bom_id: string
  dataPoints: number
  avgMaxTemp: number
  avgMinTemp: number
  totalRainfall: number
  avgWindSpeed: number
  avgHumidity: number
  avgPressure: number
  maxTemp: number | null
  minTemp: number | null
  maxRainfall: number
  maxWindSpeed: number
}

interface WeatherThresholds {
  temperature: {
    heatStress: number // 35°C - All stages, worker safety
    concreteFreeze: number // 0°C - Concrete pouring
    mortarFreeze: number // 4.4°C - Bricklaying
    concreteHeat: number // 40°C - Concrete work
  }
  windSpeed: {
    generalWork: number // 64.4 km/hr - General site work
    craneOps: number // 56.33 km/hr - Crane operations
  }
  rainfall: {
    concreteDisrupt: number // 10 mm/hr - Concrete pouring
    excavationRisk: number // 12.7 mm/hr - Excavation
    allWorkCease: number // 104 mm/hr - All work ceases
  }
}

interface MonthlyWeatherHeatmapProps {
  stationId: string
  stationName?: string
}

export default function MonthlyWeatherHeatmap({ stationId, stationName }: MonthlyWeatherHeatmapProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'rainfall' | 'wind' | 'humidity'>('temperature')
  const [hoveredCell, setHoveredCell] = useState<{ year: number; month: number } | null>(null)

  // Construction safety thresholds
  const thresholds: WeatherThresholds = {
    temperature: {
      heatStress: 35, // °C - All stages, worker safety
      concreteFreeze: 0, // °C - Concrete pouring
      mortarFreeze: 4.4, // °C - Bricklaying
      concreteHeat: 40 // °C - Concrete work
    },
    windSpeed: {
      generalWork: 64.4, // km/hr - General site work
      craneOps: 56.33 // km/hr - Crane operations
    },
    rainfall: {
      concreteDisrupt: 10, // mm/hr - Concrete pouring
      excavationRisk: 12.7, // mm/hr - Excavation
      allWorkCease: 104 // mm/hr - All work ceases
    }
  }

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const metrics = [
    { key: 'temperature', label: 'Temperature', icon: Thermometer, color: 'orange' },
    { key: 'rainfall', label: 'Rainfall', icon: Droplets, color: 'blue' },
    { key: 'wind', label: 'Wind Speed', icon: Wind, color: 'green' },
    { key: 'humidity', label: 'Humidity', icon: Eye, color: 'purple' }
  ] as const

  useEffect(() => {
    fetchMonthlyData()
  }, [stationId])

  const fetchMonthlyData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/weather/monthly-summary?station=${stationId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setMonthlyData(data)
    } catch (err) {
      console.error('Error fetching monthly data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch monthly data')
    } finally {
      setLoading(false)
    }
  }

  const getValueForMetric = (data: MonthlyData, metric: string) => {
    switch (metric) {
      case 'temperature':
        return data.avgMaxTemp
      case 'rainfall':
        return data.totalRainfall
      case 'wind':
        return data.avgWindSpeed
      case 'humidity':
        return data.avgHumidity
      default:
        return 0
    }
  }

  const getIntensityColor = (value: number, metric: string) => {
    const colors = {
      temperature: {
        0: 'bg-blue-100 dark:bg-blue-900/20',
        1: 'bg-blue-200 dark:bg-blue-800/30',
        2: 'bg-blue-300 dark:bg-blue-700/40',
        3: 'bg-orange-300 dark:bg-orange-600/50',
        4: 'bg-orange-400 dark:bg-orange-500/60',
        5: 'bg-red-400 dark:bg-red-500/70'
      },
      rainfall: {
        0: 'bg-gray-100 dark:bg-gray-700',
        1: 'bg-blue-100 dark:bg-blue-900/20',
        2: 'bg-blue-200 dark:bg-blue-800/30',
        3: 'bg-blue-300 dark:bg-blue-700/40',
        4: 'bg-blue-400 dark:bg-blue-600/50',
        5: 'bg-blue-500 dark:bg-blue-500/60'
      },
      wind: {
        0: 'bg-gray-100 dark:bg-gray-700',
        1: 'bg-green-100 dark:bg-green-900/20',
        2: 'bg-green-200 dark:bg-green-800/30',
        3: 'bg-green-300 dark:bg-green-700/40',
        4: 'bg-green-400 dark:bg-green-600/50',
        5: 'bg-green-500 dark:bg-green-500/60'
      },
      humidity: {
        0: 'bg-gray-100 dark:bg-gray-700',
        1: 'bg-purple-100 dark:bg-purple-900/20',
        2: 'bg-purple-200 dark:bg-purple-800/30',
        3: 'bg-purple-300 dark:bg-purple-700/40',
        4: 'bg-purple-400 dark:bg-purple-600/50',
        5: 'bg-purple-500 dark:bg-purple-500/60'
      }
    }

    const metricColors = colors[metric as keyof typeof colors]
    
    // Determine intensity based on value ranges
    let intensity = 0
    if (metric === 'temperature') {
      if (value >= 30) intensity = 5
      else if (value >= 25) intensity = 4
      else if (value >= 20) intensity = 3
      else if (value >= 15) intensity = 2
      else if (value >= 10) intensity = 1
    } else if (metric === 'rainfall') {
      if (value >= 100) intensity = 5
      else if (value >= 75) intensity = 4
      else if (value >= 50) intensity = 3
      else if (value >= 25) intensity = 2
      else if (value > 0) intensity = 1
    } else if (metric === 'wind') {
      if (value >= 20) intensity = 5
      else if (value >= 15) intensity = 4
      else if (value >= 10) intensity = 3
      else if (value >= 5) intensity = 2
      else if (value > 0) intensity = 1
    } else if (metric === 'humidity') {
      if (value >= 80) intensity = 5
      else if (value >= 70) intensity = 4
      else if (value >= 60) intensity = 3
      else if (value >= 50) intensity = 2
      else if (value > 0) intensity = 1
    }

    return metricColors[intensity as keyof typeof metricColors] || metricColors[0]
  }

  const getFormattedValue = (value: number, metric: string) => {
    switch (metric) {
      case 'temperature':
        return `${value.toFixed(1)}°C`
      case 'rainfall':
        return `${value.toFixed(1)}mm`
      case 'wind':
        return `${value.toFixed(1)} km/h`
      case 'humidity':
        return `${value.toFixed(1)}%`
      default:
        return value.toFixed(1)
    }
  }

  const getWeatherWarnings = (data: MonthlyData) => {
    const warnings: string[] = []
    
    // Temperature warnings
    if (data.maxTemp !== null) {
      if (data.maxTemp >= thresholds.temperature.heatStress) {
        warnings.push(`WARNING: Heat stress risk (${data.maxTemp.toFixed(1)}°C >= 35°C)`)
      }
      if (data.maxTemp >= thresholds.temperature.concreteHeat) {
        warnings.push(`STOP: Concrete work unsafe (${data.maxTemp.toFixed(1)}°C >= 40°C)`)
      }
    }
    
    if (data.minTemp !== null) {
      if (data.minTemp <= thresholds.temperature.concreteFreeze) {
        warnings.push(`FREEZE: Concrete pouring risk (${data.minTemp.toFixed(1)}°C <= 0°C)`)
      }
      if (data.minTemp <= thresholds.temperature.mortarFreeze) {
        warnings.push(`COLD: Bricklaying risk (${data.minTemp.toFixed(1)}°C <= 4.4°C)`)
      }
    }
    
    // Wind speed warnings
    if (data.maxWindSpeed >= thresholds.windSpeed.craneOps) {
      warnings.push(`CRANE: Operations unsafe (${data.maxWindSpeed.toFixed(1)} km/h >= 56.3 km/h)`)
    }
    if (data.maxWindSpeed >= thresholds.windSpeed.generalWork) {
      warnings.push(`WIND: General work unsafe (${data.maxWindSpeed.toFixed(1)} km/h >= 64.4 km/h)`)
    }
    
    // Rainfall warnings (using max daily rainfall as proxy for hourly)
    if (data.maxRainfall >= thresholds.rainfall.concreteDisrupt) {
      warnings.push(`RAIN: Concrete work disrupted (${data.maxRainfall.toFixed(1)}mm >= 10mm/hr)`)
    }
    if (data.maxRainfall >= thresholds.rainfall.excavationRisk) {
      warnings.push(`EXCAVATION: Unsafe (${data.maxRainfall.toFixed(1)}mm >= 12.7mm/hr)`)
    }
    if (data.maxRainfall >= thresholds.rainfall.allWorkCease) {
      warnings.push(`STOP: All work cease (${data.maxRainfall.toFixed(1)}mm >= 104mm/hr)`)
    }
    
    return warnings
  }

  // Get unique years from data
  const years = Array.from(new Set(monthlyData.map(d => d.year))).sort((a, b) => b - a)

  // Create a map for quick lookup
  const dataMap = new Map()
  monthlyData.forEach(data => {
    dataMap.set(`${data.year}-${data.month}`, data)
  })

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Monthly Weather Heatmap - {stationName || 'Loading...'}
          </h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Monthly Weather Heatmap - {stationName || 'Error'}
          </h2>
        </div>
        <div className="text-center text-red-600 dark:text-red-400">
          <p>Error loading data: {error}</p>
          <button
            onClick={fetchMonthlyData}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Yearly Weather Heatmap - {stationName || 'Historical Data'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Years (rows) × Months (columns) - {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} data
        </p>
      </div>

      {/* Metric Selector */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <button
                key={metric.key}
                onClick={() => setSelectedMetric(metric.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedMetric === metric.key
                    ? `bg-${metric.color}-600 text-white`
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                {metric.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Heatmap Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                Year
              </th>
              {months.map(month => (
                <th key={month} className="text-center p-3 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 min-w-[100px]">
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map(year => (
              <tr key={year}>
                <td className="p-3 text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  {year}
                </td>
                {months.map((_, monthIndex) => {
                  const month = monthIndex + 1
                  const data = dataMap.get(`${year}-${month}`)
                  const value = data ? getValueForMetric(data, selectedMetric) : 0
                  const colorClass = data ? getIntensityColor(value, selectedMetric) : 'bg-gray-100 dark:bg-gray-700'
                  const isHovered = hoveredCell?.year === year && hoveredCell?.month === month
                  const warnings = data ? getWeatherWarnings(data) : []
                  const hasWarnings = warnings.length > 0

                  return (
                    <td
                      key={month}
                      className={`p-3 text-center text-sm border border-gray-200 dark:border-gray-600 transition-all cursor-pointer relative ${colorClass} ${
                        isHovered ? 'ring-2 ring-blue-500 scale-105 z-10 relative' : ''
                      } ${hasWarnings ? 'ring-2 ring-red-500' : ''}`}
                      onMouseEnter={() => setHoveredCell({ year, month })}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={data ? `${year} ${months[monthIndex]}: ${getFormattedValue(value, selectedMetric)}${hasWarnings ? '\n\n⚠️ Warnings:\n' + warnings.join('\n') : ''}` : 'No data'}
                    >
                      {data ? (
                        <div className="flex flex-col items-center space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                              {getFormattedValue(value, selectedMetric)}
                            </span>
                            {hasWarnings && (
                              <span className="text-red-500 text-sm font-bold" title={`${warnings.length} warning(s)`}>
                                !
                              </span>
                            )}
                          </div>
                          <span className="text-gray-600 dark:text-gray-400 text-xs">
                            {data.dataPoints} days
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-lg">-</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5].map(intensity => (
                <div
                  key={intensity}
                  className={`w-4 h-4 rounded-sm ${getIntensityColor(intensity * 5, selectedMetric)}`}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
        
        {/* Construction Safety Warnings Legend */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
            ⚠️ Construction Safety Thresholds
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-yellow-700 dark:text-yellow-300">
            <div>
              <strong>Temperature:</strong>
              <ul className="mt-1 space-y-1">
                <li>• ≥35°C: Heat stress risk</li>
                <li>• ≥40°C: Concrete work unsafe</li>
                <li>• ≤0°C: Concrete pouring risk</li>
                <li>• ≤4.4°C: Bricklaying risk</li>
              </ul>
            </div>
            <div>
              <strong>Wind Speed:</strong>
              <ul className="mt-1 space-y-1">
                <li>• ≥56.3 km/h: Crane ops unsafe</li>
                <li>• ≥64.4 km/h: General work unsafe</li>
              </ul>
            </div>
            <div>
              <strong>Rainfall:</strong>
              <ul className="mt-1 space-y-1">
                <li>• ≥10 mm/hr: Concrete disrupted</li>
                <li>• ≥12.7 mm/hr: Excavation unsafe</li>
                <li>• ≥104 mm/hr: All work cease</li>
              </ul>
            </div>
          </div>
        </div>
        
        {hoveredCell && (() => {
          const data = dataMap.get(`${hoveredCell.year}-${hoveredCell.month}`)
          if (!data) return null
          
          return (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <strong>{hoveredCell.year} {months[hoveredCell.month - 1]}:</strong>
              <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                <div>Max Temp: {data.maxTemp?.toFixed(1)}°C</div>
                <div>Min Temp: {data.minTemp?.toFixed(1)}°C</div>
                <div>Rainfall: {data.totalRainfall.toFixed(1)}mm</div>
                <div>Wind: {data.avgWindSpeed.toFixed(1)} km/h</div>
                <div>Humidity: {data.avgHumidity.toFixed(1)}%</div>
                <div>Pressure: {data.avgPressure.toFixed(1)} hPa</div>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
