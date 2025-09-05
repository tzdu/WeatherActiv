# Weather Dashboard Deployment Guide

This guide shows you how to update weather data and deploy your dashboard.

## 🚀 Quick Start

### Option 1: Simple Update (Recommended)
```bash
# Update weather data and start dashboard
python update_weather_data.py deploy
cd nextjsweather
npm run dev
```

### Option 2: Using Batch File (Windows)
```bash
# Double-click or run:
update_weather.bat
```

### Option 3: Full Deployment
```bash
# Complete deployment with build
python deploy_dashboard.py
```

## 📊 Available Commands

### Update Weather Data
```bash
# Update weather data in Supabase
python update_weather_data.py update

# Show current weather data
python update_weather_data.py show

# Update and show status
python update_weather_data.py deploy
```

### Dashboard Commands
```bash
# Start development server
cd nextjsweather
npm run dev

# Build for production
cd nextjsweather
npm run build

# Start production server
cd nextjsweather
npm start
```

## 🔧 Configuration

Make sure your `.env.local` file contains:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📈 Data Flow

1. **Python Script** fetches latest weather data from Bureau of Meteorology
2. **Supabase** stores the weather observations and station data
3. **Next.js Dashboard** displays the most recent data from Supabase
4. **Real-time Updates** happen when you run the update script

## 🕐 Scheduling Updates

### Manual Updates
Run the update script whenever you want fresh data:
```bash
python update_weather_data.py update
```

### Automated Updates (Optional)
For continuous updates, you can use the existing pipeline:
```bash
python run_weather_pipeline.py continuous
```

## 🌐 Deployment Platforms

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify
1. Connect your repository to Netlify
2. Set build command: `cd nextjsweather && npm run build`
3. Set publish directory: `nextjsweather/out`

### Traditional Hosting
1. Build the project: `cd nextjsweather && npm run build`
2. Upload the `nextjsweather/out` folder to your server
3. Configure your web server to serve the static files

## 🔍 Troubleshooting

### Weather Data Not Updating
- Check your Supabase credentials in `.env.local`
- Verify internet connection for BoM data access
- Check the logs in `weather_pipeline.log`

### Dashboard Not Loading
- Ensure you're in the `nextjsweather` directory
- Run `npm install` to install dependencies
- Check that the development server is running on port 3000

### Build Errors
- Clear Next.js cache: `cd nextjsweather && rm -rf .next`
- Reinstall dependencies: `cd nextjsweather && rm -rf node_modules && npm install`

## 📊 Data Sources

- **Weather Data**: Bureau of Meteorology (BoM) Australia
- **Database**: Supabase (PostgreSQL)
- **Frontend**: Next.js with TypeScript
- **Styling**: Tailwind CSS

## 🎯 Features

- **Real-time Weather**: Latest observations from 100+ weather stations
- **Interactive Dashboard**: Temperature, rainfall, wind speed, humidity
- **Historical Analysis**: Monthly weather heatmaps with construction safety warnings
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Construction Safety**: Weather threshold warnings for construction work

## 📞 Support

If you encounter issues:
1. Check the logs in `weather_pipeline.log`
2. Verify your environment variables
3. Ensure all dependencies are installed
4. Check your internet connection for BoM data access
