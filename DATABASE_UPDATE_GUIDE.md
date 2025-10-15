# Database Update Guide for Events API

## 🎯 Overview

The Events API has been added to your backend with enhanced Event model fields. You need to update your database schema to include the new fields.

## 📋 Changes Made

### 1. Enhanced Event Model
Added the following fields to the Event model:

**Contact Information:**
- `contactPerson` - Event organizer name
- `contactPhone` - Contact phone number  
- `contactEmail` - Contact email address

**Registration Management:**
- `maxParticipants` - Maximum number of participants
- `registeredParticipants` - Current registration count
- `registrationRequired` - Whether registration is required
- `registrationFee` - Registration fee amount

**Financial Tracking:**
- `targetAmount` - Fundraising target amount
- `raisedAmount` - Amount raised so far

**Impact Metrics:**
- `bloodUnitsCollected` - Blood units collected (for blood camps)
- `peopleServed` - Number of people served (for medical camps)
- `volunteersParticipated` - Number of volunteers

**Additional Information:**
- `notes` - Additional notes or instructions

## 🔧 Database Migration Steps

### Step 1: Generate Migration
```bash
cd muktsar-api
npx prisma db push
```

### Step 2: Generate Prisma Client
```bash
npx prisma generate
```

### Step 3: Verify Migration
```bash
npx prisma studio
```

## 🚀 API Endpoints Added

The following endpoints are now available:

### Core CRUD Operations
- `POST /events` - Create new event
- `GET /events` - Get all events with filtering
- `GET /events/:id` - Get event by ID
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event

### Special Endpoints
- `GET /events/featured` - Get featured events
- `GET /events/upcoming` - Get upcoming events
- `GET /events/stats` - Get event statistics
- `GET /events/category/:category` - Get events by category

## 📊 Query Parameters

The `/events` endpoint supports comprehensive filtering:

```javascript
{
  search: string,           // Search in title, description, location
  category: EventCategory,  // BLOOD_CAMP, MEDICAL_CAMP, etc.
  status: EventStatus,      // UPCOMING, ACTIVE, COMPLETED, etc.
  isFeatured: boolean,      // Filter featured events
  upcoming_only: boolean,   // Show only upcoming events
  page: number,            // Page number (default: 1)
  limit: number,           // Items per page (default: 20)
  sortBy: string,          // Sort field (default: eventDate)
  sortOrder: 'asc'|'desc', // Sort order (default: desc)
  sort: string             // Alternative sort format (-eventDate)
}
```

## 🧪 Testing the API

### 1. Start Your Backend
```bash
cd muktsar-api
npm run start:dev
```

### 2. Test Basic Endpoints
```bash
# Get all events
curl http://localhost:3001/events

# Get event statistics
curl http://localhost:3001/events/stats

# Create a test event
curl -X POST http://localhost:3001/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Blood Camp",
    "description": "Test event",
    "eventDate": "2024-02-15",
    "startTime": "09:00",
    "endTime": "17:00",
    "location": "Test Location",
    "address": "Test Address",
    "category": "BLOOD_CAMP"
  }'
```

## 🔍 Troubleshooting

### Common Issues

1. **Migration Fails**
   ```bash
   # Reset database (WARNING: This will delete all data)
   npx prisma migrate reset
   
   # Or push schema changes
   npx prisma db push --force-reset
   ```

2. **Prisma Client Out of Sync**
   ```bash
   npx prisma generate
   ```

3. **Port Already in Use**
   ```bash
   # Kill process on port 3001
   lsof -ti:3001 | xargs kill -9
   ```

### Verification Steps

1. **Check Database Schema**
   ```bash
   npx prisma studio
   ```
   - Open http://localhost:5555
   - Verify Event model has new fields

2. **Test API Endpoints**
   - Use the test commands in `test-events-api.md`
   - Verify all endpoints return proper responses

3. **Check Admin Panel Integration**
   - Start admin panel: `cd muktsar-admin-panel && npm run dev`
   - Navigate to `/dashboard/events`
   - Test creating and managing events

## ✅ Success Indicators

After successful migration, you should be able to:

- ✅ Create events with comprehensive details
- ✅ Filter events by category, status, featured status
- ✅ View event statistics and analytics
- ✅ Upload and manage event media
- ✅ Track event impact metrics
- ✅ Manage event registrations and participants

## 🎉 Next Steps

1. **Test Event Creation**: Create a few sample events
2. **Upload Event Media**: Test image and video uploads
3. **Check Analytics**: View event statistics
4. **Admin Panel**: Test the complete admin interface
5. **Frontend Integration**: Connect events to your public website

The Events API is now fully functional and ready for use! 🌟
