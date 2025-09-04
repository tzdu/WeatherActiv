# 🚀 Quick Start Guide

## Step 1: Set Up Supabase Database
1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Copy and paste the entire contents of `supabase_schema.sql`
4. Click **Run** to execute the SQL
5. Verify tables were created in **Table Editor**

## Step 2: Configure Environment Variables
Run the setup script:
```bash
python setup_environment.py
```

Or manually create a `.env` file:
```bash
# Copy env_template.txt to .env and fill in your values
cp env_template.txt .env
# Edit .env with your Supabase credentials
```

## Step 3: Install Dependencies
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies (for web dashboard)
cd nextjsweather
npm install
cd ..
```

## Step 4: Test the Setup
```bash
# Test everything is working
python test_pipeline.py
```

## Step 5: Run the Pipeline

### Manual Run (Single Execution)
```bash
python run_weather_pipeline.py manual
```

### Continuous Mode (Hourly Updates)
```bash
python run_weather_pipeline.py continuous
```

### Test Connection Only
```bash
python run_weather_pipeline.py test
```

## Step 6: Start Web Dashboard
```bash
cd nextjsweather
npm run dev
```

Visit `http://localhost:3000` to see your weather dashboard!

## 🔧 Troubleshooting

### If you get import errors:
```bash
pip install -r requirements.txt
```

### If Supabase connection fails:
1. Check your `.env` file has correct credentials
2. Verify you ran the SQL schema in Supabase
3. Make sure your Supabase project is active

### If parser fails:
1. Check internet connection
2. Verify BoM FTP server is accessible
3. Check the `weather_pipeline.log` file for errors

## 📊 What You'll See

After running the pipeline, you should see:
- Weather data in your Supabase tables
- Real-time dashboard at localhost:3000
- Logs in `weather_pipeline.log`

## 🎯 Next Steps

1. **Customize the dashboard** - Edit components in `nextjsweather/components/`
2. **Add more data sources** - Modify `parser.py` for additional weather data
3. **Set up monitoring** - Use the logging system to monitor pipeline health
4. **Deploy to production** - Consider deploying to Vercel/Netlify for the web app
