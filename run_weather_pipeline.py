#!/usr/bin/env python3
"""
Automated Weather Data Pipeline
Downloads, parses, and uploads BoM weather data to Supabase
"""

import os
import sys
import asyncio
import schedule
import time
from datetime import datetime
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add current directory to path for imports
sys.path.append(str(Path(__file__).parent))

from parser import BoMWeatherParser, run_weather_pipeline
from supabase_uploader import SupabaseWeatherUploader

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('weather_pipeline.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class WeatherPipelineManager:
    """Manages the complete weather data pipeline"""
    
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_ANON_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            logger.error("Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.")
            sys.exit(1)
        
        self.uploader = SupabaseWeatherUploader(self.supabase_url, self.supabase_key)
        self.stats = {
            'runs': 0,
            'successful_uploads': 0,
            'failed_uploads': 0,
            'last_run': None,
            'last_success': None
        }
    
    async def run_pipeline_cycle(self):
        """Run a single pipeline cycle"""
        logger.info("🔄 Starting weather pipeline cycle")
        self.stats['runs'] += 1
        self.stats['last_run'] = datetime.now()
        
        try:
            # Step 1: Download and parse weather data
            logger.info("📥 Downloading and parsing weather data...")
            parser = run_weather_pipeline()
            
            if not parser:
                logger.error("❌ Weather parsing failed")
                self.stats['failed_uploads'] += 1
                return False
            
            # Step 2: Upload to Supabase
            logger.info("☁️ Uploading to Supabase...")
            upload_result = await self.uploader.upload_parsed_data(parser)
            
            if upload_result['success']:
                logger.info("✅ Pipeline cycle completed successfully")
                self.stats['successful_uploads'] += 1
                self.stats['last_success'] = datetime.now()
                
                # Log upload statistics
                metadata_count = upload_result['metadata'].get('count', 0)
                stations_count = upload_result['stations'].get('count', 0)
                observations_count = upload_result['observations'].get('count', 0)
                
                logger.info(f"📊 Upload Summary:")
                logger.info(f"  - Metadata: {metadata_count}")
                logger.info(f"  - Stations: {stations_count}")
                logger.info(f"  - Observations: {observations_count}")
                
                return True
            else:
                logger.error(f"❌ Upload failed: {upload_result.get('error', 'Unknown error')}")
                self.stats['failed_uploads'] += 1
                return False
                
        except Exception as e:
            logger.error(f"❌ Pipeline cycle failed: {e}")
            self.stats['failed_uploads'] += 1
            return False
    
    def print_stats(self):
        """Print pipeline statistics"""
        logger.info("📈 Pipeline Statistics:")
        logger.info(f"  - Total runs: {self.stats['runs']}")
        logger.info(f"  - Successful uploads: {self.stats['successful_uploads']}")
        logger.info(f"  - Failed uploads: {self.stats['failed_uploads']}")
        logger.info(f"  - Success rate: {(self.stats['successful_uploads'] / max(1, self.stats['runs'])) * 100:.1f}%")
        
        if self.stats['last_run']:
            logger.info(f"  - Last run: {self.stats['last_run'].strftime('%Y-%m-%d %H:%M:%S')}")
        if self.stats['last_success']:
            logger.info(f"  - Last success: {self.stats['last_success'].strftime('%Y-%m-%d %H:%M:%S')}")
    
    async def test_connection(self):
        """Test Supabase connection"""
        logger.info("🔍 Testing Supabase connection...")
        try:
            current_weather = self.uploader.get_current_weather(1)
            if current_weather is not None:
                logger.info("✅ Supabase connection successful")
                return True
            else:
                logger.warning("⚠️ Supabase connection test returned no data")
                return False
        except Exception as e:
            logger.error(f"❌ Supabase connection failed: {e}")
            return False

def run_single_cycle():
    """Run a single pipeline cycle (for scheduled jobs)"""
    manager = WeatherPipelineManager()
    asyncio.run(manager.run_pipeline_cycle())

def run_continuous():
    """Run pipeline continuously with hourly updates"""
    manager = WeatherPipelineManager()
    
    logger.info("🚀 Starting continuous weather pipeline")
    logger.info("📅 Schedule: Every hour at minute 0")
    
    # Test connection first
    if not asyncio.run(manager.test_connection()):
        logger.error("❌ Connection test failed, exiting")
        return
    
    # Run immediately
    asyncio.run(manager.run_pipeline_cycle())
    
    # Schedule hourly runs
    schedule.every().hour.at(":00").do(run_single_cycle)
    
    logger.info("⏰ Pipeline scheduled. Press Ctrl+C to stop.")
    
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    except KeyboardInterrupt:
        logger.info("🛑 Pipeline stopped by user")
        manager.print_stats()

def run_manual():
    """Run pipeline manually"""
    manager = WeatherPipelineManager()
    
    logger.info("🔧 Running manual pipeline cycle")
    
    # Test connection first
    if not asyncio.run(manager.test_connection()):
        logger.error("❌ Connection test failed")
        return
    
    # Run pipeline
    success = asyncio.run(manager.run_pipeline_cycle())
    
    if success:
        logger.info("✅ Manual pipeline completed successfully")
    else:
        logger.error("❌ Manual pipeline failed")
    
    manager.print_stats()

def show_current_data():
    """Show current weather data from Supabase"""
    manager = WeatherPipelineManager()
    
    logger.info("🌡️ Current Weather Data:")
    
    try:
        current_weather = manager.uploader.get_current_weather(10)
        
        if current_weather:
            for weather in current_weather:
                temp = weather.get('temperature_celsius', 'N/A')
                station = weather.get('station_name', 'Unknown')
                time_str = weather.get('observation_time_local', 'N/A')
                logger.info(f"  - {station}: {temp}°C (at {time_str})")
        else:
            logger.info("  No current weather data available")
            
    except Exception as e:
        logger.error(f"❌ Failed to fetch current data: {e}")

def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Usage: python run_weather_pipeline.py [command]")
        print("Commands:")
        print("  manual     - Run pipeline once manually")
        print("  continuous - Run pipeline continuously (hourly)")
        print("  test       - Test Supabase connection")
        print("  current    - Show current weather data")
        print("  stats      - Show pipeline statistics")
        return
    
    command = sys.argv[1].lower()
    
    if command == 'manual':
        run_manual()
    elif command == 'continuous':
        run_continuous()
    elif command == 'test':
        manager = WeatherPipelineManager()
        asyncio.run(manager.test_connection())
    elif command == 'current':
        show_current_data()
    elif command == 'stats':
        manager = WeatherPipelineManager()
        manager.print_stats()
    else:
        print(f"Unknown command: {command}")
        print("Available commands: manual, continuous, test, current, stats")

if __name__ == "__main__":
    main()
