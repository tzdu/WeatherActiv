#!/usr/bin/env python3
"""
Test Script for Weather Pipeline
Tests the complete pipeline without running the full automation
"""

import os
import sys
import asyncio
from pathlib import Path

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

def test_imports():
    """Test if all required modules can be imported"""
    print("🔍 Testing imports...")
    
    try:
        from parser import BoMWeatherParser
        print("✅ BoMWeatherParser imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import BoMWeatherParser: {e}")
        return False
    
    try:
        from supabase_uploader import SupabaseWeatherUploader
        print("✅ SupabaseWeatherUploader imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import SupabaseWeatherUploader: {e}")
        return False
    
    try:
        from dotenv import load_dotenv
        load_dotenv()
        print("✅ Environment variables loaded")
    except ImportError as e:
        print(f"❌ Failed to import dotenv: {e}")
        return False
    
    return True

def test_parser():
    """Test the weather parser with existing data"""
    print("\n🔍 Testing weather parser...")
    
    try:
        from parser import BoMWeatherParser
        
        # Check if we have existing XML file
        xml_files = list(Path('.').glob('*.xml'))
        if not xml_files:
            print("⚠️ No XML files found. Downloading fresh data...")
            from parser import run_weather_pipeline
            parser = run_weather_pipeline()
            if not parser:
                print("❌ Failed to download and parse weather data")
                return False
        else:
            # Use existing XML file
            xml_file = xml_files[0]
            print(f"📄 Using existing XML file: {xml_file}")
            parser = BoMWeatherParser()
            data = parser.parse_file(str(xml_file))
            
            if 'error' in data:
                print(f"❌ Parser error: {data['error']}")
                return False
        
        # Test data extraction
        stations = parser.get_stations_for_db()
        observations = parser.get_observations_for_db()
        metadata = parser.get_metadata_for_db()
        
        print(f"✅ Parser test successful:")
        print(f"  - Stations: {len(stations)}")
        print(f"  - Observations: {len(observations)}")
        print(f"  - Metadata: {len(metadata) if metadata else 0}")
        
        return True
        
    except Exception as e:
        print(f"❌ Parser test failed: {e}")
        return False

async def test_supabase_connection():
    """Test Supabase connection and upload"""
    print("\n🔍 Testing Supabase connection...")
    
    try:
        from supabase_uploader import SupabaseWeatherUploader
        
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_ANON_KEY')
        
        if not supabase_url or not supabase_key:
            print("❌ Missing Supabase credentials")
            return False
        
        uploader = SupabaseWeatherUploader(supabase_url, supabase_key)
        
        # Test connection
        current_weather = uploader.get_current_weather(1)
        print("✅ Supabase connection successful")
        
        return True
        
    except Exception as e:
        print(f"❌ Supabase test failed: {e}")
        return False

async def test_full_pipeline():
    """Test the complete pipeline"""
    print("\n🔍 Testing full pipeline...")
    
    try:
        from parser import BoMWeatherParser
        from supabase_uploader import SupabaseWeatherUploader
        
        # Parse data
        parser = BoMWeatherParser()
        xml_files = list(Path('.').glob('*.xml'))
        
        if xml_files:
            data = parser.parse_file(str(xml_files[0]))
            if 'error' in data:
                print(f"❌ Parser error: {data['error']}")
                return False
        else:
            print("❌ No XML files available for testing")
            return False
        
        # Upload to Supabase
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_ANON_KEY')
        
        uploader = SupabaseWeatherUploader(supabase_url, supabase_key)
        result = await uploader.upload_parsed_data(parser)
        
        if result['success']:
            print("✅ Full pipeline test successful")
            print(f"  - Metadata: {result['metadata'].get('count', 0)}")
            print(f"  - Stations: {result['stations'].get('count', 0)}")
            print(f"  - Observations: {result['observations'].get('count', 0)}")
            return True
        else:
            print(f"❌ Pipeline test failed: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Full pipeline test failed: {e}")
        return False

async def main():
    """Main test function"""
    print("🧪 Weather Pipeline Test Suite")
    print("=" * 40)
    
    # Test imports
    if not test_imports():
        print("\n❌ Import tests failed. Install dependencies first:")
        print("pip install -r requirements.txt")
        return
    
    # Test parser
    if not test_parser():
        print("\n❌ Parser tests failed")
        return
    
    # Test Supabase connection
    if not await test_supabase_connection():
        print("\n❌ Supabase connection tests failed")
        print("Make sure you've:")
        print("1. Created the .env file with correct credentials")
        print("2. Run the SQL schema in Supabase")
        return
    
    # Test full pipeline
    if not await test_full_pipeline():
        print("\n❌ Full pipeline tests failed")
        return
    
    print("\n🎉 All tests passed! Your pipeline is ready to use.")
    print("\nNext steps:")
    print("1. Run: python run_weather_pipeline.py manual")
    print("2. Run: python run_weather_pipeline.py continuous")
    print("3. Start web dashboard: cd nextjsweather && npm run dev")

if __name__ == "__main__":
    asyncio.run(main())
