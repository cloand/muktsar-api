// Comprehensive API test script
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAPIs() {
  console.log('🧪 Testing NGO Management APIs...\n');

  try {
    // Test Events API
    console.log('📅 Testing Events API...');

    // Get all events
    const eventsResponse = await axios.get(`${BASE_URL}/events`);
    console.log('✅ GET /events:', eventsResponse.status, `(${eventsResponse.data.data?.length || 0} events)`);

    // Get event stats
    const statsResponse = await axios.get(`${BASE_URL}/events/stats`);
    console.log('✅ GET /events/stats:', statsResponse.status);
    console.log('   📊 Stats:', JSON.stringify(statsResponse.data, null, 2));

    // Get upcoming events
    const upcomingResponse = await axios.get(`${BASE_URL}/events/upcoming`);
    console.log('✅ GET /events/upcoming:', upcomingResponse.status, `(${upcomingResponse.data?.length || 0} upcoming)`);

    // Get featured events
    const featuredResponse = await axios.get(`${BASE_URL}/events/featured`);
    console.log('✅ GET /events/featured:', featuredResponse.status, `(${featuredResponse.data?.length || 0} featured)`);

    // Create a test event
    const newEvent = {
      title: 'API Test Blood Camp',
      description: 'Test event created by API verification script',
      eventDate: '2024-03-15',
      startTime: '09:00',
      endTime: '17:00',
      location: 'Community Center',
      address: '123 Test Street, Test City',
      category: 'BLOOD_CAMP',
      contactPerson: 'Test Organizer',
      contactPhone: '+1234567890',
      maxParticipants: 50,
      registrationRequired: true,
      isFeatured: false
    };

    const createResponse = await axios.post(`${BASE_URL}/events`, newEvent);
    console.log('✅ POST /events:', createResponse.status, '(Event created)');
    const createdEventId = createResponse.data.id;

    // Get the created event
    const getEventResponse = await axios.get(`${BASE_URL}/events/${createdEventId}`);
    console.log('✅ GET /events/:id:', getEventResponse.status);

    // Update the event
    const updateResponse = await axios.patch(`${BASE_URL}/events/${createdEventId}`, {
      isFeatured: true,
      registeredParticipants: 25
    });
    console.log('✅ PATCH /events/:id:', updateResponse.status, '(Event updated)');

    console.log('\n📸 Testing Media API...');

    // Get all media
    const mediaResponse = await axios.get(`${BASE_URL}/media`);
    console.log('✅ GET /media:', mediaResponse.status, `(${mediaResponse.data.data?.length || 0} media files)`);

    // Get media stats
    const mediaStatsResponse = await axios.get(`${BASE_URL}/media/stats`);
    console.log('✅ GET /media/stats:', mediaStatsResponse.status);
    console.log('   📊 Media Stats:', JSON.stringify(mediaStatsResponse.data, null, 2));

    // Get featured media
    const featuredMediaResponse = await axios.get(`${BASE_URL}/media/featured`);
    console.log('✅ GET /media/featured:', featuredMediaResponse.status, `(${featuredMediaResponse.data?.length || 0} featured)`);

    // Get media by category
    const eventMediaResponse = await axios.get(`${BASE_URL}/media/category/EVENTS`);
    console.log('✅ GET /media/category/EVENTS:', eventMediaResponse.status, `(${eventMediaResponse.data?.length || 0} event media)`);

    console.log('\n🩸 Testing Blood Camps API...');
    const bloodCampsResponse = await axios.get(`${BASE_URL}/blood-camps`);
    console.log('✅ GET /blood-camps:', bloodCampsResponse.status, `(${bloodCampsResponse.data?.length || 0} blood camps)`);

    console.log('\n🏥 Testing Medical Camps API...');
    const medicalCampsResponse = await axios.get(`${BASE_URL}/medical-camps`);
    console.log('✅ GET /medical-camps:', medicalCampsResponse.status, `(${medicalCampsResponse.data?.length || 0} medical camps)`);

    console.log('\n👥 Testing Team Members API...');
    const teamResponse = await axios.get(`${BASE_URL}/team-members`);
    console.log('✅ GET /team-members:', teamResponse.status, `(${teamResponse.data?.length || 0} team members)`);

    console.log('\n🎉 All API tests passed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Events API - Fully functional');
    console.log('   ✅ Media API - Fully functional');
    console.log('   ✅ Blood Camps API - Working');
    console.log('   ✅ Medical Camps API - Working');
    console.log('   ✅ Team Members API - Working');
    console.log('\n🚀 Your backend is ready for the admin panel!');

  } catch (error) {
    console.error('\n❌ API test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   URL:', error.config?.url);
      console.error('   Data:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   🔌 Server not running. Start with: npm run start:dev');
    }
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure the server is running on port 3001');
    console.error('   2. Check if database is connected');
    console.error('   3. Verify Prisma client is generated');
  }
}

// Check if axios is available
if (typeof require !== 'undefined') {
  testAPIs();
} else {
  console.error('❌ This script requires Node.js. Run with: node test-apis.js');
}
