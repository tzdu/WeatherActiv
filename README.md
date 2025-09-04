# Weather Dashboard

A real-time weather monitoring dashboard built with Next.js, Supabase, and Leaflet maps.

## Features

- 🌦️ **Real-time Weather Data** from Bureau of Meteorology
- 🗺️ **Interactive Map** with weather station markers
- 📊 **Project Management** with location-based monitoring
- 📅 **Calendar Heatmap** for historical data visualization
- 🔄 **Auto-refresh** every 5 minutes

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Maps**: Leaflet.js with OpenStreetMap
- **Data Source**: Bureau of Meteorology FTP

## Deployment

This project is deployed on Vercel with the following structure:

```
WeatherActiv/
├── nextjsweather/          # Next.js application
│   ├── app/               # App router pages
│   ├── components/        # React components
│   └── lib/              # Supabase configuration
├── parser.py             # Weather data parser
└── supabase_schema.sql   # Database schema
```

## Environment Variables

Required environment variables for deployment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Data Pipeline

1. **Python Parser** downloads data from BoM FTP
2. **Supabase** stores weather observations
3. **Next.js App** displays real-time data
4. **Auto-refresh** keeps data current

## Local Development

```bash
# Install dependencies
cd nextjsweather
npm install

# Start development server
npm run dev

# Run data parser (optional)
cd ..
python run_weather_pipeline.py
```

## Live Demo

Visit the deployed application to see real-time weather data from Victoria, Australia.