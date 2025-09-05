"""
Supabase Weather Data Uploader
Uploads parsed weather data from BoM parser to Supabase database
"""

import os
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
import asyncio
from supabase import create_client, Client
from parser import BoMWeatherParser

class SupabaseWeatherUploader:
    """Handles uploading weather data to Supabase"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        """Initialize Supabase client"""
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.upload_stats = {
            'metadata': 0,
            'stations': 0,
            'observations': 0,
            'errors': []
        }
    
    async def upload_parsed_data(self, parser: BoMWeatherParser) -> Dict[str, Any]:
        """Upload all parsed data to Supabase"""
        print("🚀 Starting Supabase upload...")
        
        try:
            # Upload metadata
            metadata_result = await self._upload_metadata(parser.get_metadata_for_db())
            
            # Upload stations
            stations_result = await self._upload_stations(parser.get_stations_for_db())
            
            # Upload observations
            observations_result = await self._upload_observations(parser.get_observations_for_db())
            
            return {
                'success': True,
                'metadata': metadata_result,
                'stations': stations_result,
                'observations': observations_result,
                'stats': self.upload_stats
            }
            
        except Exception as e:
            print(f"❌ Upload failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'stats': self.upload_stats
            }
    
    async def _upload_metadata(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Upload metadata to Supabase"""
        try:
            # Check if metadata already exists
            existing = self.supabase.table('weather_metadata').select('report_id').eq('report_id', metadata['report_id']).execute()
            
            if existing.data:
                print(f"📋 Metadata for {metadata['report_id']} already exists, skipping...")
                return {'status': 'skipped', 'reason': 'already_exists'}
            
            # Convert datetime objects to ISO strings
            clean_metadata = self._clean_datetime_fields(metadata)
            
            # Insert new metadata
            result = self.supabase.table('weather_metadata').insert(clean_metadata).execute()
            
            if result.data:
                self.upload_stats['metadata'] = 1
                print(f"✅ Uploaded metadata for report {metadata['report_id']}")
                return {'status': 'success', 'count': 1}
            else:
                raise Exception("No data returned from metadata insert")
                
        except Exception as e:
            error_msg = f"Metadata upload failed: {e}"
            self.upload_stats['errors'].append(error_msg)
            print(f"❌ {error_msg}")
            return {'status': 'error', 'error': str(e)}
    
    async def _upload_stations(self, stations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Upload stations to Supabase with upsert logic"""
        try:
            if not stations:
                return {'status': 'skipped', 'reason': 'no_data'}
            
            # Clean datetime fields for all stations
            clean_stations = [self._clean_datetime_fields(station) for station in stations]
            
            # Get existing station IDs
            existing_ids = set()
            for station in clean_stations:
                if station.get('bom_id'):
                    existing_ids.add(station['bom_id'])
            
            if existing_ids:
                # Check which stations already exist
                existing = self.supabase.table('weather_stations').select('bom_id').in_('bom_id', list(existing_ids)).execute()
                existing_bom_ids = {row['bom_id'] for row in existing.data}
                
                # Filter out existing stations
                new_stations = [s for s in clean_stations if s.get('bom_id') not in existing_bom_ids]
                
                if not new_stations:
                    print(f"📋 All {len(stations)} stations already exist, skipping...")
                    return {'status': 'skipped', 'reason': 'all_exist'}
                
                # Insert only new stations
                result = self.supabase.table('weather_stations').insert(new_stations).execute()
                inserted_count = len(result.data) if result.data else 0
                
                self.upload_stats['stations'] = inserted_count
                print(f"✅ Uploaded {inserted_count} new stations ({len(stations) - inserted_count} already existed)")
                return {'status': 'success', 'count': inserted_count, 'skipped': len(stations) - inserted_count}
            else:
                return {'status': 'skipped', 'reason': 'no_valid_ids'}
                
        except Exception as e:
            error_msg = f"Stations upload failed: {e}"
            self.upload_stats['errors'].append(error_msg)
            print(f"❌ {error_msg}")
            return {'status': 'error', 'error': str(e)}
    
    async def _upload_observations(self, observations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Upload observations to Supabase with conflict resolution"""
        try:
            if not observations:
                return {'status': 'skipped', 'reason': 'no_data'}
            
            # Clean datetime fields for all observations
            clean_observations = [self._clean_datetime_fields(obs) for obs in observations]
            
            # Use upsert to handle duplicates
            result = self.supabase.table('weather_observations').upsert(
                clean_observations,
                on_conflict='bom_id,observation_time_utc'
            ).execute()
            
            inserted_count = len(result.data) if result.data else 0
            self.upload_stats['observations'] = inserted_count
            
            print(f"✅ Uploaded {inserted_count} observations")
            return {'status': 'success', 'count': inserted_count}
            
        except Exception as e:
            error_msg = f"Observations upload failed: {e}"
            self.upload_stats['errors'].append(error_msg)
            print(f"❌ {error_msg}")
            return {'status': 'error', 'error': str(e)}
    
    async def upload_historical_data(self, historical_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Upload historical weather data"""
        try:
            if not historical_data:
                return {'status': 'skipped', 'reason': 'no_data'}
            
            # Use upsert for historical data
            result = self.supabase.table('weather_historical').upsert(
                historical_data,
                on_conflict='station_name,date'
            ).execute()
            
            inserted_count = len(result.data) if result.data else 0
            print(f"✅ Uploaded {inserted_count} historical records")
            return {'status': 'success', 'count': inserted_count}
            
        except Exception as e:
            error_msg = f"Historical data upload failed: {e}"
            print(f"❌ {error_msg}")
            return {'status': 'error', 'error': str(e)}
    
    def get_current_weather(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get current weather data from Supabase"""
        try:
            result = self.supabase.table('current_weather').select('*').limit(limit).execute()
            return result.data if result.data else []
        except Exception as e:
            print(f"❌ Failed to get current weather: {e}")
            return []
    
    def get_temperature_summary(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get temperature summary from Supabase"""
        try:
            result = self.supabase.table('temperature_summary').select('*').limit(limit).execute()
            return result.data if result.data else []
        except Exception as e:
            print(f"❌ Failed to get temperature summary: {e}")
            return []
    
    def get_station_history(self, bom_id: str, days: int = 7) -> List[Dict[str, Any]]:
        """Get historical data for a specific station"""
        try:
            from datetime import datetime, timedelta
            start_date = datetime.now() - timedelta(days=days)
            
            result = self.supabase.table('weather_observations').select('*').eq(
                'bom_id', bom_id
            ).gte('observation_time_utc', start_date.isoformat()).order(
                'observation_time_utc', desc=True
            ).execute()
            
            return result.data if result.data else []
        except Exception as e:
            print(f"❌ Failed to get station history: {e}")
            return []
    
    def _clean_datetime_fields(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert datetime objects to ISO strings and fix data types for JSON serialization"""
        cleaned = {}
        
        # Fields that should be integers in the database
        integer_fields = {
            'wind_direction_degrees', 'cloud_oktas'
        }
        
        for key, value in data.items():
            if isinstance(value, datetime):
                cleaned[key] = value.isoformat()
            elif key in integer_fields and isinstance(value, (int, float)):
                # Convert float values to integers for integer fields
                cleaned[key] = int(value) if value is not None else None
            else:
                cleaned[key] = value
        return cleaned

async def run_weather_pipeline_with_supabase():
    """Run the complete weather pipeline with Supabase upload"""
    
    # Get Supabase credentials from environment variables
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.")
        return None
    
    print("🔄 Starting weather pipeline with Supabase upload...")
    
    # Run the weather parser
    from parser import run_weather_pipeline
    parser = run_weather_pipeline()
    
    if not parser:
        print("❌ Weather parsing failed, skipping upload")
        return None
    
    # Initialize Supabase uploader
    uploader = SupabaseWeatherUploader(supabase_url, supabase_key)
    
    # Upload data to Supabase
    upload_result = await uploader.upload_parsed_data(parser)
    
    if upload_result['success']:
        print("✅ Weather data successfully uploaded to Supabase!")
        print(f"📊 Upload Summary:")
        print(f"  - Metadata: {upload_result['metadata']['count'] if 'count' in upload_result['metadata'] else 0}")
        print(f"  - Stations: {upload_result['stations']['count'] if 'count' in upload_result['stations'] else 0}")
        print(f"  - Observations: {upload_result['observations']['count'] if 'count' in upload_result['observations'] else 0}")
        
        # Show some current weather data
        current_weather = uploader.get_current_weather(5)
        if current_weather:
            print(f"\n🌡️ Current Weather Sample:")
            for weather in current_weather:
                temp = weather.get('temperature_celsius', 'N/A')
                station = weather.get('station_name', 'Unknown')
                print(f"  - {station}: {temp}°C")
        
        return uploader
    else:
        print(f"❌ Upload failed: {upload_result.get('error', 'Unknown error')}")
        return None

if __name__ == "__main__":
    # Example usage
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == 'test':
        # Test mode - just show current data
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_ANON_KEY')
        
        if supabase_url and supabase_key:
            uploader = SupabaseWeatherUploader(supabase_url, supabase_key)
            current_weather = uploader.get_current_weather(10)
            
            print("🌡️ Current Weather Data:")
            for weather in current_weather:
                print(f"  {weather.get('station_name')}: {weather.get('temperature_celsius')}°C")
        else:
            print("❌ Missing Supabase credentials")
    else:
        # Run full pipeline
        asyncio.run(run_weather_pipeline_with_supabase())
