#!/usr/bin/env python3
"""
Environment Setup Script for Weather Pipeline
Helps configure Supabase credentials and test the setup
"""

import os
import sys
from pathlib import Path

def create_env_file():
    """Create .env file with Supabase credentials"""
    env_file = Path('.env')
    
    if env_file.exists():
        print("✅ .env file already exists")
        return True
    
    print("🔧 Setting up environment variables...")
    print("\nTo get your Supabase credentials:")
    print("1. Go to your Supabase project dashboard")
    print("2. Navigate to Settings > API")
    print("3. Copy the Project URL and anon/public key")
    print()
    
    # Get Supabase URL
    supabase_url = input("Enter your Supabase URL (e.g., https://your-project-id.supabase.co): ").strip()
    if not supabase_url:
        print("❌ Supabase URL is required")
        return False
    
    # Get Supabase Key
    supabase_key = input("Enter your Supabase anon key: ").strip()
    if not supabase_key:
        print("❌ Supabase anon key is required")
        return False
    
    # Create .env file
    env_content = f"""# Supabase Configuration
SUPABASE_URL={supabase_url}
SUPABASE_ANON_KEY={supabase_key}
"""
    
    try:
        with open('.env', 'w') as f:
            f.write(env_content)
        print("✅ .env file created successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to create .env file: {e}")
        return False

def test_supabase_connection():
    """Test Supabase connection"""
    print("\n🔍 Testing Supabase connection...")
    
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_ANON_KEY')
        
        if not supabase_url or not supabase_key:
            print("❌ Missing Supabase credentials in .env file")
            return False
        
        # Test import and connection
        from supabase import create_client
        supabase = create_client(supabase_url, supabase_key)
        
        # Try a simple query
        result = supabase.table('weather_stations').select('count').limit(1).execute()
        print("✅ Supabase connection successful")
        return True
        
    except ImportError as e:
        print(f"❌ Missing required package: {e}")
        print("Run: pip install -r requirements.txt")
        return False
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        print("Check your credentials and make sure the database schema is created")
        return False

def install_dependencies():
    """Install required Python packages"""
    print("\n📦 Installing Python dependencies...")
    
    try:
        import subprocess
        result = subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Dependencies installed successfully")
            return True
        else:
            print(f"❌ Failed to install dependencies: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Weather Pipeline Environment Setup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path('parser.py').exists():
        print("❌ Please run this script from the WeatherActiv directory")
        return
    
    # Install dependencies
    if not install_dependencies():
        return
    
    # Create .env file
    if not create_env_file():
        return
    
    # Test connection
    if not test_supabase_connection():
        print("\n🔧 Troubleshooting tips:")
        print("1. Make sure you've run the SQL schema in Supabase")
        print("2. Check your Supabase URL and key are correct")
        print("3. Ensure your Supabase project is active")
        return
    
    print("\n🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Run: python run_weather_pipeline.py test")
    print("2. Run: python run_weather_pipeline.py manual")
    print("3. Start the web dashboard: cd nextjsweather && npm install && npm run dev")

if __name__ == "__main__":
    main()
