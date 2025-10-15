const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testDonorProfile() {
  try {
    console.log('=== Testing Donor Profile API ===\n');

    // Step 1: Register a new donor
    console.log('1. Registering a new donor...');
    const registerData = {
      firstName: 'Test',
      lastName: 'Donor',
      name: 'Test Donor',
      email: `testdonor${Date.now()}@example.com`,
      password: 'password123',
      phone: '9876543210',
      bloodGroup: 'O_POSITIVE',
      gender: 'MALE',
      dateOfBirth: '1990-01-01',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      emergencyContact: '9876543211',
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('✅ Registration successful');
    console.log('Access Token:', registerResponse.data.access_token);
    console.log('User:', registerResponse.data.user);
    console.log('Donor:', registerResponse.data.donor);
    console.log('');

    const accessToken = registerResponse.data.access_token;

    // Step 2: Get donor profile using the token
    console.log('2. Getting donor profile...');
    const profileResponse = await axios.get(`${BASE_URL}/donors/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log('✅ Profile retrieved successfully');
    console.log('Profile:', profileResponse.data);
    console.log('');

    // Step 3: Test with invalid token
    console.log('3. Testing with invalid token...');
    try {
      await axios.get(`${BASE_URL}/donors/me`, {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });
      console.log('❌ Should have failed with invalid token');
    } catch (error) {
      console.log('✅ Correctly rejected invalid token');
      console.log('Error:', error.response?.status, error.response?.data?.message);
    }
    console.log('');

    // Step 4: Test without token
    console.log('4. Testing without token...');
    try {
      await axios.get(`${BASE_URL}/donors/me`);
      console.log('❌ Should have failed without token');
    } catch (error) {
      console.log('✅ Correctly rejected request without token');
      console.log('Error:', error.response?.status, error.response?.data?.message);
    }
    console.log('');

    console.log('=== All tests completed ===');
  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data);
    console.error('Full error:', error.message);
  }
}

testDonorProfile();

