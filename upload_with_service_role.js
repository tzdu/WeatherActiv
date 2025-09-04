#!/usr/bin/env node
/**
 * Upload weather data to Supabase using service role key
 * This should bypass RLS restrictions
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Service role key - get this from Supabase Settings > API
const supabaseUrl = 'https://rqyosszhovyvjlexsabf.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Replace with your actual service role key

console.log('🔑 To use this script:');
console.log('1. Go to Supabase Settings > API');
console.log('2. Copy the "service_role" key (not the anon key)');
console.log('3. Replace YOUR_SERVICE_ROLE_KEY_HERE in this script');
console.log('4. Run: node upload_with_service_role.js');
console.log('');
console.log('⚠️ Service role key bypasses RLS completely!');

// For now, let's try a different approach - let's create a simple test
async function testConnection() {
    if (supabaseServiceKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
        console.log('❌ Please update the service role key first');
        return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
        console.log('🔍 Testing service role connection...');
        
        // Test insert with service role
        const testData = {
            bom_id: 'TEST456',
            station_name: 'Test Station Service Role',
            latitude: -37.8,
            longitude: 144.9
        };
        
        const { data, error } = await supabase
            .from('weather_stations')
            .insert(testData);
        
        if (error) {
            console.log(`❌ Service role test failed: ${error.message}`);
        } else {
            console.log('✅ Service role test successful!');
            
            // Clean up test data
            await supabase
                .from('weather_stations')
                .delete()
                .eq('bom_id', 'TEST456');
            
            console.log('✅ Test data cleaned up');
        }
        
    } catch (err) {
        console.log(`❌ Service role test error: ${err.message}`);
    }
}

testConnection();
