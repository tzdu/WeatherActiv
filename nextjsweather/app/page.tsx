import Link from 'next/link'
import { Map, Grid3X3 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          Victoria Weather
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Choose your preferred view
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/map"
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-colors"
          >
            <Map className="h-6 w-6" />
            <div className="text-left">
              <div className="font-semibold">Interactive Map</div>
              <div className="text-sm opacity-90">Click stations for weather popups</div>
            </div>
          </Link>
          
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg transition-colors"
          >
            <Grid3X3 className="h-6 w-6" />
            <div className="text-left">
              <div className="font-semibold">Dashboard View</div>
              <div className="text-sm opacity-90">Grid layout with charts</div>
            </div>
          </Link>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          Real-time weather data from Bureau of Meteorology
        </p>
      </div>
    </div>
  )
}
