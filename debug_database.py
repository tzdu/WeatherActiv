#!/usr/bin/env python3
"""
Debug script to check database contents
"""

import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv('.env.local')

# Get Supabase credentials
supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not supabase_url or not supabase_key:
    print("ERROR: Missing Supabase credentials")
    exit(1)

supabase = create_client(supabase_url, supabase_key)

print("=== DATABASE DEBUG ===")

# Check weather_historical table
print("\n1. WEATHER_HISTORICAL TABLE:")
try:
    result = supabase.table('weather_historical').select('bom_id, station_name').limit(10).execute()
    print(f"   Records: {len(result.data) if result.data else 0}")
    if result.data:
        for record in result.data[:5]:
            print(f"   - {record['bom_id']}: {record['station_name']}")
    else:
        print("   No data found")
except Exception as e:
    print(f"   Error: {e}")

# Check weather_observations table
print("\n2. WEATHER_OBSERVATIONS TABLE:")
try:
    result = supabase.table('weather_observations').select('bom_id, station_name').limit(10).execute()
    print(f"   Records: {len(result.data) if result.data else 0}")
    if result.data:
        for record in result.data[:5]:
            print(f"   - {record['bom_id']}: {record['station_name']}")
    else:
        print("   No data found")
except Exception as e:
    print(f"   Error: {e}")

# Check current_weather table
print("\n3. CURRENT_WEATHER TABLE:")
try:
    result = supabase.table('current_weather').select('bom_id, station_name').limit(10).execute()
    print(f"   Records: {len(result.data) if result.data else 0}")
    if result.data:
        for record in result.data[:5]:
            print(f"   - {record['bom_id']}: {record['station_name']}")
    else:
        print("   No data found")
except Exception as e:
    print(f"   Error: {e}")

print("\n=== DEBUG COMPLETE ===")
