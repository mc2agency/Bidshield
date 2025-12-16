// Test HeyGen API Connection
// Run with: npx ts-node scripts/test-heygen.ts

import { listAvatars, listVoices, generateVideo } from '../lib/heygen-api';

async function testHeyGen() {
  console.log('🧪 Testing HeyGen API Connection...\n');

  try {
    // Test 1: List Avatars
    console.log('1️⃣  Fetching available avatars...');
    const avatars = await listAvatars();
    console.log(`✅ Found ${avatars.length} avatars`);
    console.log('Sample avatars:');
    avatars.slice(0, 3).forEach((avatar: any) => {
      console.log(`   - ${avatar.avatar_name} (${avatar.avatar_id})`);
    });

    // Test 2: List Voices
    console.log('\n2️⃣  Fetching available voices...');
    const voices = await listVoices();
    console.log(`✅ Found ${voices.length} voices`);
    console.log('Sample voices:');
    voices.slice(0, 3).forEach((voice: any) => {
      console.log(`   - ${voice.voice_name} (${voice.language})`);
    });

    // Test 3: Generate Sample Video
    console.log('\n3️⃣  Generating sample video...');
    console.log('Script: "Welcome to MC2 Estimating Academy!"');

    const video = await generateVideo({
      script: 'Welcome to MC2 Estimating Academy! This is a test video.',
      title: 'API Test Video',
      avatarId: avatars[0].avatar_id, // Use first available avatar
    });

    console.log(`✅ Video generation started`);
    console.log(`   Video ID: ${video.video_id}`);
    console.log(`   Status: ${video.status}`);
    console.log('\n⏳ Video is processing (takes 2-5 minutes)');
    console.log(`   Check status at: https://app.heygen.com/videos/${video.video_id}`);

    console.log('\n✅ All tests passed! HeyGen is ready to use.');

  } catch (error) {
    console.error('\n❌ Error:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check your API key in .env.local');
    console.log('   2. Verify you\'re on Creator plan or higher');
    console.log('   3. Ensure you have credits remaining');
  }
}

testHeyGen();
