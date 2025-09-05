#!/usr/bin/env python3
"""
Simple script to update weather data and deploy dashboard
This script fetches latest weather data and updates Supabase
"""

import os
import sys
import asyncio
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from parser import run_weather_pipeline
from supabase_uploader import SupabaseWeatherUploader

def update_weather_data():
    """Update weather data in Supabase"""
    print("Starting weather data update...")
    
    # Get Supabase credentials
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')  # Use service role for updates
    
    if not supabase_url or not supabase_key:
        print("ERROR: Missing Supabase credentials in .env.local")
        print("Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        return False
    
    try:
        # Step 1: Download and parse latest weather data
        print("Fetching latest weather data from BoM...")
        parser = run_weather_pipeline()
        
        if not parser:
            print("ERROR: Failed to fetch weather data")
            return False
        
        print(f"SUCCESS: Fetched data for {len(parser.get_stations_for_db())} stations")
        
        # Step 2: Upload to Supabase
        print("Uploading to Supabase...")
        uploader = SupabaseWeatherUploader(supabase_url, supabase_key)
        
        async def upload_data():
            return await uploader.upload_parsed_data(parser)
        
        upload_result = asyncio.run(upload_data())
        
        if upload_result['success']:
            print("SUCCESS: Weather data updated successfully!")
            
            # Show summary
            metadata_count = upload_result['metadata'].get('count', 0)
            stations_count = upload_result['stations'].get('count', 0)
            observations_count = upload_result['observations'].get('count', 0)
            
            print(f"Update Summary:")
            print(f"  - Metadata records: {metadata_count}")
            print(f"  - Station records: {stations_count}")
            print(f"  - Observation records: {observations_count}")
            print(f"  - Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            return True
        else:
            print(f"ERROR: Upload failed: {upload_result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"ERROR: Update failed: {e}")
        return False

def show_current_data():
    """Show current weather data from Supabase"""
    print("Current Weather Data:")
    
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("ERROR: Missing Supabase credentials")
        return
    
    try:
        uploader = SupabaseWeatherUploader(supabase_url, supabase_key)
        current_weather = uploader.get_current_weather(10)
        
        if current_weather:
            for weather in current_weather:
                temp = weather.get('temperature_celsius', 'N/A')
                station = weather.get('station_name', 'Unknown')
                time_str = weather.get('observation_time_local', 'N/A')
                print(f"  - {station}: {temp}C (at {time_str})")
        else:
            print("  No current weather data available")
            
    except Exception as e:
        print(f"ERROR: Failed to fetch current data: {e}")

def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Usage: python update_weather_data.py [command]")
        print("Commands:")
        print("  update  - Update weather data in Supabase")
        print("  show    - Show current weather data")
        print("  deploy  - Update data and show status")
        return
    
    command = sys.argv[1].lower()
    
    if command == 'update':
        success = update_weather_data()
        if success:
            print("\nSUCCESS: Weather data update completed!")
            print("Your dashboard will now show the latest weather data.")
        else:
            print("\nERROR: Weather data update failed!")
            sys.exit(1)
            
    elif command == 'show':
        show_current_data()
        
    elif command == 'deploy':
        print("Deploying latest weather data...")
        success = update_weather_data()
        if success:
            print("\nSUCCESS: Deployment successful!")
            print("Dashboard is now updated with latest weather data.")
            show_current_data()
        else:
            print("\nERROR: Deployment failed!")
            sys.exit(1)
            
    else:
        print(f"Unknown command: {command}")
        print("Available commands: update, show, deploy")

if __name__ == "__main__":
    main()
