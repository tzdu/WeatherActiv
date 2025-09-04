pimport { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (you can generate these from your Supabase dashboard)
export type Database = {
  public: {
    Tables: {
      // Add your table types here
      // Example:
      // weather_data: {
      //   Row: {
      //     id: string
      //     date: string
      //     temperature: number
      //     humidity: number
      //     created_at: string
      //   }
      //   Insert: {
      //     id?: string
      //     date: string
      //     temperature: number
      //     humidity: number
      //     created_at?: string
      //   }
      //   Update: {
      //     id?: string
      //     date?: string
      //     temperature?: number
      //     humidity?: number
      //     created_at?: string
      //   }
      // }
    }
  }
}
