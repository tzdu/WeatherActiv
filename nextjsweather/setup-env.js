const fs = require('fs');
const path = require('path');

// Create .env.local file with HERE Maps API key
const envContent = `# HERE Maps API Key
NEXT_PUBLIC_HERE_API_KEY=dX27NwP07cY5hk01tlBlVgSB5FMyaiAyNT6G6EwR524

# Supabase Configuration (add your actual values here)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
`;

const envPath = path.join(__dirname, '.env.local');

try {
  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('✅ .env.local already exists');
  } else {
    // Create the file
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local with HERE Maps API key');
  }
  
  console.log('🚀 You can now run: npm run dev');
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
}
