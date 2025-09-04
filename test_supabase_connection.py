#!/usr/bin/env python3
"""
Test Supabase connection and check what's happening
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def test_connection():
    """Test Supabase connection and check policies"""
    
    # Get Supabase credentials
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    print(f"🔍 Testing Supabase connection...")
    print(f"URL: {supabase_url}")
    print(f"Key: {supabase_key[:20]}..." if supabase_key else "No key found")
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials in .env file")
        return False
    
    # Create Supabase client
    supabase: Client = create_client(supabase_url, supabase_key)
    
    try:
        # Test basic connection
        print("🔍 Testing basic connection...")
        result = supabase.table('weather_stations').select('count').limit(1).execute()
        print("✅ Basic connection successful")
        
        # Test if we can read data
        print("🔍 Testing read access...")
        result = supabase.table('weather_stations').select('*').limit(1).execute()
        print(f"✅ Read access successful - found {len(result.data)} records")
        
        # Test if we can insert data
        print("🔍 Testing insert access...")
        test_data = {
            'bom_id': 'TEST123',
            'station_name': 'Test Station',
            'latitude': -37.8,
            'longitude': 144.9
        }
        
        result = supabase.table('weather_stations').insert(test_data).execute()
        print(f"✅ Insert access successful - inserted {len(result.data)} records")
        
        # Clean up test data
        supabase.table('weather_stations').delete().eq('bom_id', 'TEST123').execute()
        print("✅ Test data cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Supabase Connection Test")
    print("=" * 40)
    
    success = test_connection()
    
    if success:
        print("\n✅ All tests passed! Supabase is working correctly.")
    else:
        print("\n❌ Tests failed. Check the error messages above.")
