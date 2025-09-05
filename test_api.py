#!/usr/bin/env python3
"""
Test the API endpoints to see what data is available
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

def test_api():
    """Test the API endpoints"""
    
    # Test the current weather API
    print("Testing Current Weather API...")
    try:
        response = requests.get("https://nextjsweather-g6yapqsuc-kevins-projects-05b0293c.vercel.app/api/weather/current")
        if response.status_code == 200:
            data = response.json()
            print(f"SUCCESS: Got {len(data)} weather stations")
            if data:
                print(f"Sample station: {data[0].get('station_name', 'Unknown')}")
        else:
            print(f"ERROR: API returned status {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"ERROR: Failed to call API: {e}")
    
    print("\nTesting Debug API...")
    try:
        response = requests.get("https://nextjsweather-g6yapqsuc-kevins-projects-05b0293c.vercel.app/api/weather/debug")
        if response.status_code == 200:
            data = response.json()
            print("SUCCESS: Debug API working")
            print(f"Timestamp: {data.get('timestamp', 'Unknown')}")
            print(f"Environment: {data.get('environment', {})}")
            print(f"Tables: {data.get('tables', {})}")
        else:
            print(f"ERROR: Debug API returned status {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"ERROR: Failed to call debug API: {e}")

if __name__ == "__main__":
    test_api()
