#!/usr/bin/env python3
"""
Debug script to check what data is being uploaded to Supabase
"""

import os
import sys
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from parser import run_weather_pipeline

def debug_upload_data():
    """Debug what data is being prepared for upload"""
    print("🔍 Debugging upload data...")
    
    # Run the parser
    parser = run_weather_pipeline()
    
    if not parser:
        print("❌ Parser failed")
        return
    
    # Get the data that would be uploaded
    observations = parser.get_observations_for_db()
    stations = parser.get_stations_for_db()
    
    print(f"📊 Data Summary:")
    print(f"  - Stations: {len(stations)}")
    print(f"  - Observations: {len(observations)}")
    
    if observations:
        print(f"\n🔍 Sample Observation Data Types:")
        sample_obs = observations[0]
        for key, value in sample_obs.items():
            print(f"  - {key}: {type(value).__name__} = {value}")
        
        # Check for potential type issues
        print(f"\n⚠️ Potential Type Issues:")
        for i, obs in enumerate(observations[:5]):  # Check first 5
            for key, value in obs.items():
                if isinstance(value, str) and value.replace('.', '').replace('-', '').isdigit():
                    print(f"  - Observation {i}, {key}: '{value}' (string that looks like number)")
                elif isinstance(value, float) and value.is_integer():
                    print(f"  - Observation {i}, {key}: {value} (float that's actually integer)")
    
    if stations:
        print(f"\n🔍 Sample Station Data Types:")
        sample_station = stations[0]
        for key, value in sample_station.items():
            print(f"  - {key}: {type(value).__name__} = {value}")
    
    # Save sample data to file for inspection
    debug_data = {
        'sample_observations': observations[:3] if observations else [],
        'sample_stations': stations[:3] if stations else []
    }
    
    with open('debug_upload_data.json', 'w') as f:
        json.dump(debug_data, f, indent=2, default=str)
    
    print(f"\n💾 Sample data saved to debug_upload_data.json")

if __name__ == "__main__":
    debug_upload_data()
