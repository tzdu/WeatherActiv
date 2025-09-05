// Simple test script to verify historical API endpoints
const testAPI = async () => {
  const baseUrl = 'http://localhost:3000'
  
  console.log('Testing Historical Weather API Endpoints...\n')
  
  try {
    // Test monthly summary endpoint
    console.log('1. Testing monthly summary endpoint...')
    const monthlyResponse = await fetch(`${baseUrl}/api/weather/monthly-summary?station=086338`)
    
    if (monthlyResponse.ok) {
      const monthlyData = await monthlyResponse.json()
      console.log(`✅ Monthly summary: Found ${monthlyData.length} monthly records`)
      if (monthlyData.length > 0) {
        console.log(`   Sample record: ${monthlyData[0].year}-${monthlyData[0].month}: ${monthlyData[0].avgMaxTemp.toFixed(1)}°C avg max temp`)
      }
    } else {
      console.log(`❌ Monthly summary failed: ${monthlyResponse.status}`)
    }
    
    // Test historical data endpoint
    console.log('\n2. Testing historical data endpoint...')
    const historicalResponse = await fetch(`${baseUrl}/api/weather/historical-data?station=086338&year=2024`)
    
    if (historicalResponse.ok) {
      const historicalData = await historicalResponse.json()
      console.log(`✅ Historical data: Found ${historicalData.length} daily records for 2024`)
      if (historicalData.length > 0) {
        console.log(`   Sample record: ${historicalData[0].date}: ${historicalData[0].max_temperature}°C max, ${historicalData[0].min_temperature}°C min`)
      }
    } else {
      console.log(`❌ Historical data failed: ${historicalResponse.status}`)
    }
    
  } catch (error) {
    console.log(`❌ API test failed: ${error.message}`)
    console.log('Make sure the development server is running on http://localhost:3000')
  }
}

// Run the test
testAPI()
