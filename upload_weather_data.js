#!/usr/bin/env node
/**
 * Upload weather data to Supabase using service role key
 * This bypasses RLS completely
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// IMPORTANT: Replace this with your actual service role key from Supabase Settings > API
const supabaseUrl = 'https://rqyosszhovyvjlexsabf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxeW9zc3pob3Z5dmpsZXhzYWJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTc0OTgyNywiZXhwIjoyMDcxMzI1ODI3fQ.bDVRaslVyA_sie36qrxpGr2Xho391x9ffZzlDQOJPtY'; // Service role key

async function uploadWeatherData() {
    if (supabaseServiceKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
        console.log('❌ Please update the service role key first!');
        console.log('');
        console.log('🔑 To get your service role key:');
        console.log('1. Go to your Supabase project dashboard');
        console.log('2. Navigate to Settings > API');
        console.log('3. Copy the "service_role" key (not the anon key)');
        console.log('4. Replace YOUR_SERVICE_ROLE_KEY_HERE in this script');
        console.log('5. Run: node upload_weather_data.js');
        console.log('');
        console.log('⚠️ The service role key has full database access!');
        return;
    }
    
    console.log('🚀 Starting weather data upload with service role...');
    
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
        // Find the most recent backup file
        const files = fs.readdirSync('.')
            .filter(f => f.startsWith('weather_backup_') && f.endsWith('.json'))
            .sort();
        
        if (files.length === 0) {
            console.log('❌ No backup files found. Run the Python parser first.');
            return;
        }
        
        const latestBackup = files[files.length - 1];
        console.log(`📄 Using backup file: ${latestBackup}`);
        
        // Load backup data
        const backupData = JSON.parse(fs.readFileSync(latestBackup, 'utf8'));
        
        console.log(`📊 Loaded backup data:`);
        console.log(`  - Metadata: ${Object.keys(backupData.metadata || {}).length}`);
        console.log(`  - Stations: ${backupData.stations?.length || 0}`);
        console.log(`  - Observations: ${backupData.observations?.length || 0}`);
        
        // Upload metadata
        if (backupData.metadata) {
            console.log('📤 Uploading metadata...');
            const { data, error } = await supabase
                .from('weather_metadata')
                .insert(backupData.metadata);
            
            if (error) {
                console.log(`⚠️ Metadata upload failed: ${error.message}`);
            } else {
                console.log(`✅ Metadata uploaded: ${data?.length || 0} records`);
            }
        }
        
        // Upload stations
        if (backupData.stations && backupData.stations.length > 0) {
            console.log('📤 Uploading stations...');
            const { data, error } = await supabase
                .from('weather_stations')
                .insert(backupData.stations);
            
            if (error) {
                console.log(`⚠️ Stations upload failed: ${error.message}`);
            } else {
                console.log(`✅ Stations uploaded: ${data?.length || 0} records`);
            }
        }
        
        // Upload observations
        if (backupData.observations && backupData.observations.length > 0) {
            console.log('📤 Uploading observations...');
            const { data, error } = await supabase
                .from('weather_observations')
                .insert(backupData.observations);
            
            if (error) {
                console.log(`⚠️ Observations upload failed: ${error.message}`);
            } else {
                console.log(`✅ Observations uploaded: ${data?.length || 0} records`);
            }
        }
        
        console.log('🎉 Upload process completed!');
        
        // Check what's in the database now
        console.log('\n🔍 Checking database contents...');
        
        const { data: stations, error: stationsError } = await supabase
            .from('weather_stations')
            .select('*', { count: 'exact' });
        
        const { data: observations, error: observationsError } = await supabase
            .from('weather_observations')
            .select('*', { count: 'exact' });
        
        console.log(`📊 Database now contains:`);
        console.log(`  - Stations: ${stations?.length || 0}`);
        console.log(`  - Observations: ${observations?.length || 0}`);
        
        if (stations && stations.length > 0) {
            console.log('\n🌡️ Sample station data:');
            stations.slice(0, 3).forEach(station => {
                console.log(`  - ${station.station_name}: ${station.latitude}, ${station.longitude}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Upload failed:', error.message);
    }
}

// Run the upload
uploadWeatherData();
