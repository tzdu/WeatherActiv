#!/usr/bin/env node
/**
 * Upload weather data to Supabase using Node.js
 * This bypasses Python RLS issues
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://rqyosszhovyvjlexsabf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxeW9zc3pob3Z5dmpsZXhzYWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDk4MjcsImV4cCI6MjA3MTMyNTgyN30.IPH-GTvptD5VRZ9Sd0vD3_53mxRE_EnC9TX1ia5p6MM';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadWeatherData() {
    console.log('🚀 Starting weather data upload to Supabase...');
    
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
            try {
                const { data, error } = await supabase
                    .from('weather_metadata')
                    .insert(backupData.metadata);
                
                if (error) {
                    console.log(`⚠️ Metadata upload failed: ${error.message}`);
                } else {
                    console.log(`✅ Metadata uploaded: ${data?.length || 0} records`);
                }
            } catch (err) {
                console.log(`⚠️ Metadata upload error: ${err.message}`);
            }
        }
        
        // Upload stations
        if (backupData.stations && backupData.stations.length > 0) {
            console.log('📤 Uploading stations...');
            try {
                const { data, error } = await supabase
                    .from('weather_stations')
                    .insert(backupData.stations);
                
                if (error) {
                    console.log(`⚠️ Stations upload failed: ${error.message}`);
                } else {
                    console.log(`✅ Stations uploaded: ${data?.length || 0} records`);
                }
            } catch (err) {
                console.log(`⚠️ Stations upload error: ${err.message}`);
            }
        }
        
        // Upload observations
        if (backupData.observations && backupData.observations.length > 0) {
            console.log('📤 Uploading observations...');
            try {
                const { data, error } = await supabase
                    .from('weather_observations')
                    .insert(backupData.observations);
                
                if (error) {
                    console.log(`⚠️ Observations upload failed: ${error.message}`);
                } else {
                    console.log(`✅ Observations uploaded: ${data?.length || 0} records`);
                }
            } catch (err) {
                console.log(`⚠️ Observations upload error: ${err.message}`);
            }
        }
        
        console.log('🎉 Upload process completed!');
        
        // Check what's in the database now
        console.log('\n🔍 Checking database contents...');
        
        const { data: stations, error: stationsError } = await supabase
            .from('weather_stations')
            .select('count');
        
        const { data: observations, error: observationsError } = await supabase
            .from('weather_observations')
            .select('count');
        
        console.log(`📊 Database now contains:`);
        console.log(`  - Stations: ${stations?.length || 0}`);
        console.log(`  - Observations: ${observations?.length || 0}`);
        
    } catch (error) {
        console.error('❌ Upload failed:', error.message);
    }
}

// Run the upload
uploadWeatherData();
