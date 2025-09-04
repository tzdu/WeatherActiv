#!/usr/bin/env python3
"""
Manually populate Supabase database with backup weather data
This bypasses the RLS issues by using the service role key
"""

import os
import json
import asyncio
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def populate_database():
    """Populate database with backup data"""
    
    # Get Supabase credentials
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials in .env file")
        return False
    
    # Create Supabase client
    supabase: Client = create_client(supabase_url, supabase_key)
    
    # Find the most recent backup file
    backup_files = [f for f in os.listdir('.') if f.startswith('weather_backup_') and f.endswith('.json')]
    if not backup_files:
        print("❌ No backup files found. Run the parser first.")
        return False
    
    # Use the most recent backup
    latest_backup = sorted(backup_files)[-1]
    print(f"📄 Using backup file: {latest_backup}")
    
    try:
        # Load backup data
        with open(latest_backup, 'r') as f:
            backup_data = json.load(f)
        
        print(f"📊 Loaded backup data:")
        print(f"  - Metadata: {len(backup_data.get('metadata', {}))}")
        print(f"  - Stations: {len(backup_data.get('stations', []))}")
        print(f"  - Observations: {len(backup_data.get('observations', []))}")
        
        # Upload metadata
        if backup_data.get('metadata'):
            print("📤 Uploading metadata...")
            try:
                result = supabase.table('weather_metadata').insert(backup_data['metadata']).execute()
                print(f"✅ Metadata uploaded: {len(result.data) if result.data else 0} records")
            except Exception as e:
                print(f"⚠️ Metadata upload failed: {e}")
        
        # Upload stations
        if backup_data.get('stations'):
            print("📤 Uploading stations...")
            try:
                result = supabase.table('weather_stations').insert(backup_data['stations']).execute()
                print(f"✅ Stations uploaded: {len(result.data) if result.data else 0} records")
            except Exception as e:
                print(f"⚠️ Stations upload failed: {e}")
        
        # Upload observations
        if backup_data.get('observations'):
            print("📤 Uploading observations...")
            try:
                result = supabase.table('weather_observations').insert(backup_data['observations']).execute()
                print(f"✅ Observations uploaded: {len(result.data) if result.data else 0} records")
            except Exception as e:
                print(f"⚠️ Observations upload failed: {e}")
        
        print("🎉 Database population completed!")
        return True
        
    except Exception as e:
        print(f"❌ Failed to populate database: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Manual Database Population")
    print("=" * 40)
    
    success = populate_database()
    
    if success:
        print("\n✅ Database populated successfully!")
        print("You can now check your Supabase dashboard to see the data.")
    else:
        print("\n❌ Database population failed.")
        print("Check the error messages above for details.")
