# Historical Weather Dashboard

This document describes the new historical weather data dashboard features added to the Weatheractiv project.

## Features

### 1. Monthly Weather Heatmap
- **Location**: Dashboard → Historical View
- **Purpose**: Visualize weather patterns across years and months
- **Data Source**: `weather_historical` table in Supabase

### 2. Interactive Metrics
The heatmap supports four different weather metrics:
- **Temperature**: Average maximum temperature (°C)
- **Rainfall**: Total monthly rainfall (mm)
- **Wind Speed**: Average wind speed (km/h)
- **Humidity**: Average humidity percentage (%)

### 3. Color-Coded Intensity
Each metric uses a color-coded intensity scale:
- **Temperature**: Blue (cool) → Orange → Red (hot)
- **Rainfall**: Gray (no rain) → Light Blue → Dark Blue (heavy rain)
- **Wind**: Gray (calm) → Light Green → Dark Green (strong winds)
- **Humidity**: Gray (low) → Light Purple → Dark Purple (high humidity)

## API Endpoints

### 1. Monthly Summary
```
GET /api/weather/monthly-summary?station={stationId}&startYear={year}&endYear={year}
```

**Parameters:**
- `station` (required): BOM station ID
- `startYear` (optional): Start year for data range (default: 2020)
- `endYear` (optional): End year for data range (default: current year)

**Response:**
```json
[
  {
    "year": 2024,
    "month": 1,
    "monthName": "Jan",
    "station_name": "MELBOURNE (OLYMPIC PARK)",
    "bom_id": "086338",
    "dataPoints": 31,
    "avgMaxTemp": 25.3,
    "avgMinTemp": 15.2,
    "totalRainfall": 45.6,
    "avgWindSpeed": 12.4,
    "avgHumidity": 68.5,
    "avgPressure": 1013.2,
    "maxTemp": 32.1,
    "minTemp": 8.5,
    "maxRainfall": 12.3,
    "maxWindSpeed": 28.7
  }
]
```

### 2. Historical Data
```
GET /api/weather/historical-data?station={stationId}&year={year}&month={month}
```

**Parameters:**
- `station` (required): BOM station ID
- `year` (optional): Filter by specific year
- `month` (optional): Filter by specific month (1-12)

**Response:**
```json
[
  {
    "id": "uuid",
    "station_name": "MELBOURNE (OLYMPIC PARK)",
    "bom_id": "086338",
    "latitude": -37.8258,
    "longitude": 144.9814,
    "date": "2024-01-15",
    "max_temperature": 28.5,
    "min_temperature": 16.2,
    "rainfall_mm": 5.2,
    "wind_speed_kmh": 15.3,
    "wind_direction": "SE",
    "humidity_percent": 65.0,
    "pressure_hpa": 1015.2,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

## Database Schema

The historical data is stored in the `weather_historical` table:

```sql
CREATE TABLE IF NOT EXISTS weather_historical (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    station_name VARCHAR(255) NOT NULL,
    bom_id VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    date DATE NOT NULL,
    max_temperature DECIMAL(5, 2),
    min_temperature DECIMAL(5, 2),
    rainfall_mm DECIMAL(6, 2),
    wind_speed_kmh DECIMAL(6, 2),
    wind_direction VARCHAR(10),
    humidity_percent DECIMAL(5, 2),
    pressure_hpa DECIMAL(7, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(station_name, date)
);
```

## Usage

### 1. Accessing Historical View
1. Open the Weatheractiv Dashboard
2. Click the "Historical View" button in the top navigation
3. Select a project with a weather station
4. The monthly heatmap will load automatically

### 2. Interacting with the Heatmap
- **Switch Metrics**: Click on Temperature, Rainfall, Wind Speed, or Humidity buttons
- **Hover for Details**: Hover over any cell to see detailed monthly statistics
- **Color Legend**: Use the legend at the bottom to understand intensity levels

### 3. Data Interpretation
- **Empty Cells**: No data available for that month/year
- **Data Points**: Number in each cell shows how many days of data are included
- **Intensity Colors**: Darker colors indicate higher values for the selected metric

## Testing

Run the test script to verify API endpoints:

```bash
cd nextjsweather
node test-historical-api.js
```

## Future Enhancements

Potential improvements for the historical dashboard:
1. **Export Functionality**: Download heatmap data as CSV/Excel
2. **Comparison Mode**: Compare multiple stations side-by-side
3. **Trend Analysis**: Show year-over-year trends and anomalies
4. **Seasonal Patterns**: Highlight seasonal weather patterns
5. **Custom Date Ranges**: Allow users to select custom date ranges
6. **Statistical Analysis**: Add statistical summaries (averages, extremes, etc.)

## Troubleshooting

### Common Issues

1. **No Data Showing**: 
   - Verify the station ID exists in the `weather_historical` table
   - Check that data exists for the selected time period

2. **API Errors**:
   - Ensure Supabase connection is configured correctly
   - Check environment variables in `.env.local`

3. **Slow Loading**:
   - Large datasets may take time to load
   - Consider adding pagination for very large date ranges

### Support

For issues or questions about the historical dashboard, check:
1. Browser console for JavaScript errors
2. Network tab for API request failures
3. Supabase logs for database connection issues
