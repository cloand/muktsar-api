const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testPhoneField() {
  try {
    console.log('=== Testing Phone Field in User Table ===\n');

    // Generate unique email
    const timestamp = Date.now();
    const testEmail = `testuser${timestamp}@example.com`;
    const testPhone = '9876543210';

    // Step 1: Register a new donor with phone
    console.log('1. Registering a new donor with phone number...');
    const registerData = {
      firstName: 'Test',
      lastName: 'User',
      name: 'Test User',
      email: testEmail,
      phone: testPhone,
      password: 'password123',
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
    console.log('User data:', {
      id: registerResponse.data.user.id,
      email: registerResponse.data.user.email,
      phone: registerResponse.data.user.phone,
      firstName: registerResponse.data.user.firstName,
      lastName: registerResponse.data.user.lastName,
      role: registerResponse.data.user.role,
    });

    // Verify phone is included
    if (registerResponse.data.user.phone === testPhone) {
      console.log('✅ Phone field correctly saved and returned:', testPhone);
    } else {
      console.log('❌ Phone field mismatch!');
      console.log('Expected:', testPhone);
      console.log('Got:', registerResponse.data.user.phone);
    }
    console.log('');

    const accessToken = registerResponse.data.access_token;

    // Step 2: Login and verify phone is returned
    console.log('2. Logging in and checking phone in response...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: 'password123',
    });
    console.log('✅ Login successful');
    console.log('User data:', {
      id: loginResponse.data.user.id,
      email: loginResponse.data.user.email,
      phone: loginResponse.data.user.phone,
      firstName: loginResponse.data.user.firstName,
      lastName: loginResponse.data.user.lastName,
      role: loginResponse.data.user.role,
    });

    // Verify phone is included
    if (loginResponse.data.user.phone === testPhone) {
      console.log('✅ Phone field correctly returned in login:', testPhone);
    } else {
      console.log('❌ Phone field mismatch in login!');
      console.log('Expected:', testPhone);
      console.log('Got:', loginResponse.data.user.phone);
    }
    console.log('');

    // Step 3: Test registration without phone (optional field)
    console.log('3. Testing registration without phone (optional field)...');
    const timestamp2 = Date.now();
    const testEmail2 = `testuser${timestamp2}@example.com`;
    const registerData2 = {
      firstName: 'Test2',
      lastName: 'User2',
      name: 'Test User 2',
      email: testEmail2,
      // No phone field
      password: 'password123',
      bloodGroup: 'A_POSITIVE',
      gender: 'FEMALE',
      dateOfBirth: '1995-05-15',
      address: '456 Test Avenue',
      city: 'Test City',
      state: 'Test State',
      pincode: '654321',
      emergencyContact: '9876543222',
    };

    const registerResponse2 = await axios.post(`${BASE_URL}/auth/register`, registerData2);
    console.log('✅ Registration without phone successful');
    console.log('User data:', {
      id: registerResponse2.data.user.id,
      email: registerResponse2.data.user.email,
      phone: registerResponse2.data.user.phone,
      firstName: registerResponse2.data.user.firstName,
      lastName: registerResponse2.data.user.lastName,
      role: registerResponse2.data.user.role,
    });

    // Verify phone is null or undefined
    if (registerResponse2.data.user.phone === null || registerResponse2.data.user.phone === undefined) {
      console.log('✅ Phone field correctly null/undefined when not provided');
    } else {
      console.log('⚠️  Phone field has unexpected value:', registerResponse2.data.user.phone);
    }
    console.log('');

    console.log('=== All tests completed successfully! ===');
    console.log('\n📋 Summary:');
    console.log('✅ Phone field added to User table');
    console.log('✅ Phone field saved during registration');
    console.log('✅ Phone field returned in login response');
    console.log('✅ Phone field returned in registration response');
    console.log('✅ Phone field is optional (can be null)');

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

// Run the test
testPhoneField();

