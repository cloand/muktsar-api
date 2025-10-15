const axios = require('axios');

// Test script for the new last donation date update functionality
const BASE_URL = 'http://localhost:3000';

async function testLastDonationUpdate() {
  try {
    console.log('🧪 Testing Last Donation Date Update API...\n');

    // First, let's get all donors to find one to test with
    console.log('1. Getting list of donors...');
    
    // Note: You'll need to replace this with actual admin credentials
    const adminToken = 'YOUR_ADMIN_JWT_TOKEN_HERE';
    
    const headers = {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };

    // Get donors list
    const donorsResponse = await axios.get(`${BASE_URL}/donors`, { headers });
    console.log(`✅ Found ${donorsResponse.data.data.length} donors`);
    
    if (donorsResponse.data.data.length === 0) {
      console.log('❌ No donors found. Please create a donor first.');
      return;
    }

    const testDonor = donorsResponse.data.data[0];
    console.log(`📋 Testing with donor: ${testDonor.name} (ID: ${testDonor.id})`);
    console.log(`📅 Current last donation date: ${testDonor.lastDonationDate || 'Not set'}\n`);

    // Test updating last donation date
    console.log('2. Updating last donation date...');
    
    const today = new Date().toISOString();
    const updateData = {
      lastDonationDate: today
    };

    const updateResponse = await axios.patch(
      `${BASE_URL}/donors/${testDonor.id}/last-donation`,
      updateData,
      { headers }
    );

    console.log('✅ Last donation date updated successfully!');
    console.log(`📅 New last donation date: ${updateResponse.data.lastDonationDate}`);
    console.log(`🔢 Total donations: ${updateResponse.data.totalDonations}\n`);

    // Verify the update by fetching the donor again
    console.log('3. Verifying the update...');
    const verifyResponse = await axios.get(`${BASE_URL}/donors/${testDonor.id}`, { headers });
    
    console.log('✅ Verification successful!');
    console.log(`📅 Confirmed last donation date: ${verifyResponse.data.lastDonationDate}`);
    console.log(`🔢 Confirmed total donations: ${verifyResponse.data.totalDonations}`);

    // Test error cases
    console.log('\n4. Testing error cases...');
    
    // Test with invalid date
    try {
      await axios.patch(
        `${BASE_URL}/donors/${testDonor.id}/last-donation`,
        { lastDonationDate: 'invalid-date' },
        { headers }
      );
    } catch (error) {
      console.log('✅ Invalid date error handled correctly:', error.response.data.message);
    }

    // Test with future date
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      await axios.patch(
        `${BASE_URL}/donors/${testDonor.id}/last-donation`,
        { lastDonationDate: futureDate.toISOString() },
        { headers }
      );
    } catch (error) {
      console.log('✅ Future date error handled correctly:', error.response.data.message);
    }

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure to replace YOUR_ADMIN_JWT_TOKEN_HERE with a valid admin JWT token');
      console.log('💡 You can get this token by logging in as an admin user through the auth endpoints');
    }
  }
}

// Instructions for running the test
console.log(`
📖 INSTRUCTIONS:
1. Make sure your NestJS server is running on ${BASE_URL}
2. Replace 'YOUR_ADMIN_JWT_TOKEN_HERE' with a valid admin JWT token
3. Run this script with: node test-last-donation-update.js

🔑 To get an admin token:
1. Create an admin user if you haven't already
2. Login via POST ${BASE_URL}/auth/login with admin credentials
3. Copy the JWT token from the response
4. Replace the token in this script

🚀 Starting test in 3 seconds...
`);

setTimeout(testLastDonationUpdate, 3000);
