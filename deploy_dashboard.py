
#!/usr/bin/env python3
"""
Deploy dashboard with latest weather data
This script updates weather data and provides instructions for deployment
"""

import os
import sys
import subprocess
from datetime import datetime

def run_command(command, description):
    """Run a command and return success status"""
    print(f"Running {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"SUCCESS: {description} completed successfully")
            return True
        else:
            print(f"ERROR: {description} failed:")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"ERROR: {description} failed: {e}")
        return False

def main():
    """Main deployment process"""
    print("Weather Dashboard Deployment")
    print("=" * 50)
    
    # Step 1: Update weather data
    print("\nStep 1: Updating weather data...")
    if not run_command("python update_weather_data.py update", "Weather data update"):
        print("ERROR: Weather data update failed. Please check your configuration.")
        return False
    
    # Step 2: Check if Next.js is installed
    print("\nStep 2: Checking Next.js setup...")
    nextjs_dir = "nextjsweather"
    
    if not os.path.exists(nextjs_dir):
        print(f"ERROR: Next.js directory '{nextjs_dir}' not found")
        return False
    
    if not os.path.exists(os.path.join(nextjs_dir, "package.json")):
        print(f"ERROR: package.json not found in {nextjs_dir}")
        return False
    
    # Step 3: Install dependencies if needed
    print("\nStep 3: Checking dependencies...")
    node_modules_path = os.path.join(nextjs_dir, "node_modules")
    if not os.path.exists(node_modules_path):
        print("Installing Node.js dependencies...")
        if not run_command(f"cd {nextjs_dir} && npm install", "Dependency installation"):
            print("ERROR: Failed to install dependencies")
            return False
    else:
        print("SUCCESS: Dependencies already installed")
    
    # Step 4: Build the project (optional)
    print("\nStep 4: Building project...")
    if not run_command(f"cd {nextjs_dir} && npm run build", "Project build"):
        print("WARNING: Build failed, but continuing with development mode...")
    
    # Step 5: Provide deployment instructions
    print("\nSUCCESS: Deployment Complete!")
    print("=" * 50)
    print(f"Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\nNext Steps:")
    print("1. Start the development server:")
    print(f"   cd {nextjs_dir}")
    print("   npm run dev")
    print("\n2. Open your browser to:")
    print("   http://localhost:3000")
    print("\n3. For production deployment:")
    print("   - Deploy to Vercel, Netlify, or your preferred platform")
    print("   - Set environment variables in your deployment platform")
    print("\n4. To update weather data regularly:")
    print("   python update_weather_data.py update")
    print("\nYour dashboard is ready with the latest weather data!")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)
