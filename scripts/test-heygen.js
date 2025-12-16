// Test HeyGen API Connection
// Run with: node scripts/test-heygen.js

require('dotenv').config({ path: '.env.local' });

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_API_URL = 'https://api.heygen.com/v2';

async function testHeyGen() {
  console.log('🧪 Testing HeyGen API Connection...\n');

  if (!HEYGEN_API_KEY) {
    console.error('❌ HEYGEN_API_KEY not found in .env.local');
    console.log('💡 Make sure you have HEYGEN_API_KEY=your_key in .env.local');
    return;
  }

  console.log(`✅ API Key found: ${HEYGEN_API_KEY.substring(0, 10)}...`);

  try {
    // Test: List Avatars
    console.log('\n1️⃣  Fetching available avatars...');
    const response = await fetch(`${HEYGEN_API_URL}/avatars`, {
      method: 'GET',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const avatars = data.data.avatars || [];

    console.log(`✅ Successfully connected to HeyGen!`);
    console.log(`✅ Found ${avatars.length} avatars available`);

    if (avatars.length > 0) {
      console.log('\n📋 Sample Avatars:');
      avatars.slice(0, 5).forEach((avatar, index) => {
        console.log(`   ${index + 1}. ${avatar.avatar_name}`);
        console.log(`      ID: ${avatar.avatar_id}`);
        console.log(`      Gender: ${avatar.gender || 'N/A'}`);
        console.log('');
      });

      console.log('\n✅ HeyGen is ready to use!');
      console.log('\n📝 Next steps:');
      console.log('   1. Choose an avatar from the list above');
      console.log('   2. Copy the avatar_id');
      console.log('   3. Use it in your video generation');
    }

  } catch (error) {
    console.error('\n❌ Error connecting to HeyGen:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check your API key is valid');
    console.log('   2. Verify you\'re on Creator plan ($24/mo) or higher');
    console.log('   3. Free trial doesn\'t include API access');
    console.log('   4. Get API key at: https://app.heygen.com/settings/api');
  }
}

testHeyGen();
