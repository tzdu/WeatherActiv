import { supabase } from './supabase'

// Example database operations for your weather app
export class WeatherDatabase {
  
  // Example: Save weather forecast data
  static async saveForecast(forecastData: {
    date: string
    rain_mm: number
    wind_kmh: number
    temp_max: number
    uv_index: number
    humidity: number
    location: string
  }) {
    const { data, error } = await supabase
      .from('weather_forecasts') // Replace with your actual table name
      .insert([forecastData])
      .select()
    
    if (error) {
      console.error('Error saving forecast:', error)
      throw error
    }
    
    return data
  }

  // Example: Get weather forecasts for a date range
  static async getForecasts(startDate: string, endDate: string, location?: string) {
    let query = supabase
      .from('weather_forecasts') // Replace with your actual table name
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (location) {
      query = query.eq('location', location)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching forecasts:', error)
      throw error
    }

    return data
  }

  // Example: Save task data
  static async saveTask(taskData: {
    id: string
    name: string
    start: string
    end: string
    requires: string[]
    status?: string
  }) {
    const { data, error } = await supabase
      .from('tasks') // Replace with your actual table name
      .upsert([taskData]) // upsert will insert or update if exists
      .select()
    
    if (error) {
      console.error('Error saving task:', error)
      throw error
    }
    
    return data
  }

  // Example: Get all tasks
  static async getTasks() {
    const { data, error } = await supabase
      .from('tasks') // Replace with your actual table name
      .select('*')
      .order('start', { ascending: true })

    if (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }

    return data
  }

  // Example: Update task status
  static async updateTaskStatus(taskId: string, status: string) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
      .select()

    if (error) {
      console.error('Error updating task status:', error)
      throw error
    }

    return data
  }
}

// Example usage in your components:
/*
import { WeatherDatabase } from '@/lib/database'

// In a component:
const handleSaveForecast = async () => {
  try {
    await WeatherDatabase.saveForecast({
      date: '2025-01-15',
      rain_mm: 2.5,
      wind_kmh: 25,
      temp_max: 22,
      uv_index: 4,
      humidity: 65,
      location: 'Melbourne, VIC'
    })
    console.log('Forecast saved successfully!')
  } catch (error) {
    console.error('Failed to save forecast:', error)
  }
}
*/
