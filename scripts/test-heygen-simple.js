// Simple HeyGen API Test (no dependencies)
// Usage: HEYGEN_API_KEY=your_key node scripts/test-heygen-simple.js

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_API_URL = 'https://api.heygen.com/v2';

async function testHeyGen() {
  console.log('🧪 Testing HeyGen API Connection...\n');

  if (!HEYGEN_API_KEY) {
    console.error('❌ No API key provided');
    console.log('💡 Usage: HEYGEN_API_KEY=your_key node scripts/test-heygen-simple.js');
    process.exit(1);
  }

  console.log(`✅ API Key: ${HEYGEN_API_KEY.substring(0, 15)}...`);

  try {
    console.log('\n1️⃣  Testing API connection...');
    const response = await fetch(`${HEYGEN_API_URL}/avatars`, {
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
      },
    });

    console.log(`   Response status: ${response.status}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error ${response.status}: ${error}`);
    }

    const data = await response.json();
    const avatars = data.data?.avatars || [];

    console.log(`\n✅ SUCCESS! Connected to HeyGen API`);
    console.log(`✅ Found ${avatars.length} avatars available\n`);

    if (avatars.length > 0) {
      console.log('📋 First 5 Avatars:\n');
      avatars.slice(0, 5).forEach((avatar, i) => {
        console.log(`${i + 1}. ${avatar.avatar_name || 'Unnamed'}`);
        console.log(`   ID: ${avatar.avatar_id}`);
        console.log(`   Preview: https://app.heygen.com/avatars`);
        console.log('');
      });

      console.log('\n🎯 You\'re ready to create videos!');
      console.log('\n📝 Next: Write a script and generate your first video');
      console.log('   See HEYGEN-SETUP.md for detailed instructions\n');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\n💡 Common issues:');
    console.log('   • API key is invalid or expired');
    console.log('   • Not on Creator plan ($24/mo) - free trial has no API access');
    console.log('   • Network/firewall blocking request');
    console.log('\n🔗 Get your API key: https://app.heygen.com/settings/api\n');
    process.exit(1);
  }
}

testHeyGen();
