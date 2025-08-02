import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testConnection() {
  console.log('🧪 Testing server connection...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test signup
    console.log('\n2. Testing signup endpoint...');
    const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'testpass123'
      })
    });
    const signupData = await signupResponse.json();
    console.log('✅ Signup response:', signupData);

    if (signupData.success && signupData.data.token) {
      const token = signupData.data.token;
      const userId = signupData.data.userId;

      // Test get users endpoint
      console.log('\n3. Testing get users endpoint...');
      const usersResponse = await fetch(`${BASE_URL}/chat/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const usersData = await usersResponse.json();
      console.log('✅ Get users response:', usersData);

      // Test get profile endpoint
      console.log('\n4. Testing get profile endpoint...');
      const profileResponse = await fetch(`${BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const profileData = await profileResponse.json();
      console.log('✅ Get profile response:', profileData);
    }

    console.log('\n🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testConnection(); 