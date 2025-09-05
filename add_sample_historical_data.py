#!/usr/bin/env python3
"""
Quick script to add sample historical data for a few more stations
"""

import os
import sys
import random
from datetime import datetime, timedelta, date
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv('.env.local')

# Supabase configuration
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')  # Use service role key to bypass RLS

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing Supabase environment variables")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def generate_sample_data(station_name: str, target_date: date):
    """Generate sample weather data"""
    month = target_date.month
    
    # Seasonal temperature variations
    if month in [12, 1, 2]:  # Summer
        max_temp = random.uniform(25, 35)
        min_temp = random.uniform(15, 22)
    elif month in [6, 7, 8]:  # Winter
        max_temp = random.uniform(12, 18)
        min_temp = random.uniform(3, 10)
    else:  # Spring/Autumn
        max_temp = random.uniform(18, 25)
        min_temp = random.uniform(8, 15)
    
    return {
        'max_temperature': round(max_temp, 1),
        'min_temperature': round(min_temp, 1),
        'rainfall_mm': round(random.uniform(0, 20), 1),
        'wind_speed_kmh': round(random.uniform(5, 20), 1),
        'wind_direction': random.choice(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']),
        'humidity_percent': round(random.uniform(45, 80), 1),
        'pressure_hpa': round(random.uniform(1000, 1030), 1)
    }

def add_sample_stations():
    """Add sample historical data for a few more stations"""
    
    # Sample stations to add (using some of the station IDs from your current data)
    sample_stations = [
        {'bom_id': '086338', 'station_name': 'MELBOURNE (OLYMPIC PARK)'},
        {'bom_id': '086282', 'station_name': 'MELBOURNE AIRPORT'},
        {'bom_id': '088164', 'station_name': 'GEELONG RACECOURSE'},
        {'bom_id': '085151', 'station_name': 'BALLARAT AERODROME'},
        {'bom_id': '088051', 'station_name': 'WARRNAMBOOL AIRPORT'},
    ]
    
    print("🚀 Adding sample historical data...")
    
    # Generate data for 2021, 2022, 2023, and 2024
    start_date = date(2021, 1, 1)
    end_date = date(2024, 12, 31)
    
    total_records = 0
    
    for station in sample_stations:
        print(f"🌤️  Processing {station['station_name']} ({station['bom_id']})")
        
        station_data = []
        current_date = start_date
        
        # Generate data for every 2nd day to have more data points
        while current_date <= end_date:
            weather_data = generate_sample_data(station['station_name'], current_date)
            
            record = {
                'station_name': station['station_name'],
                'bom_id': station['bom_id'],
                'latitude': None,
                'longitude': None,
                'date': current_date.isoformat(),
                **weather_data
            }
            
            station_data.append(record)
            current_date += timedelta(days=2)  # Every 2nd day for more data
        
        # Insert data for this station
        try:
            result = supabase.table('weather_historical').upsert(
                station_data,
                on_conflict='station_name,date'
            ).execute()
            
            total_records += len(station_data)
            print(f"  ✅ Inserted {len(station_data)} records")
            
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    print(f"🎉 Sample data population complete!")
    print(f"📈 Total records: {total_records}")
    print(f"🏢 Stations: {len(sample_stations)}")

if __name__ == "__main__":
    add_sample_stations()
