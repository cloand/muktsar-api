# Events API Testing Guide

## Base URL
```
http://localhost:3001
```

## API Endpoints

### 1. Create Event
```http
POST /events
Content-Type: application/json

{
  "title": "Blood Donation Camp",
  "description": "Community blood donation drive",
  "eventDate": "2024-02-15",
  "startTime": "09:00",
  "endTime": "17:00",
  "location": "Community Center",
  "address": "123 Main Street, City, State",
  "category": "BLOOD_CAMP",
  "status": "UPCOMING",
  "contactPerson": "John Doe",
  "contactPhone": "+1234567890",
  "contactEmail": "john@example.com",
  "maxParticipants": 100,
  "registrationRequired": true,
  "isFeatured": false
}
```

### 2. Get All Events
```http
GET /events
```

### 3. Get All Events with Filters
```http
GET /events?category=BLOOD_CAMP&status=UPCOMING&page=1&limit=10
```

### 4. Get Event by ID
```http
GET /events/{id}
```

### 5. Update Event
```http
PATCH /events/{id}
Content-Type: application/json

{
  "title": "Updated Event Title",
  "status": "ACTIVE"
}
```

### 6. Delete Event
```http
DELETE /events/{id}
```

### 7. Get Featured Events
```http
GET /events/featured?limit=5
```

### 8. Get Upcoming Events
```http
GET /events/upcoming?limit=10
```

### 9. Get Events by Category
```http
GET /events/category/BLOOD_CAMP?limit=5
```

### 10. Get Event Statistics
```http
GET /events/stats
```

## Query Parameters for GET /events

- `search`: Search in title, description, location, address
- `category`: Filter by event category (BLOOD_CAMP, MEDICAL_CAMP, AWARENESS, FUNDRAISING, COMMUNITY)
- `status`: Filter by status (ACTIVE, INACTIVE, CANCELLED, COMPLETED, UPCOMING)
- `isFeatured`: Filter featured events (true/false)
- `upcoming_only`: Show only upcoming events (true/false)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sortBy`: Sort field (default: eventDate)
- `sortOrder`: Sort order (asc/desc, default: desc)
- `sort`: Alternative sort format (e.g., "-eventDate" for desc)

## Event Categories

- `BLOOD_CAMP`: Blood donation camps
- `MEDICAL_CAMP`: Medical checkup camps
- `AWARENESS`: Awareness campaigns
- `FUNDRAISING`: Fundraising events
- `COMMUNITY`: Community service events

## Event Status

- `UPCOMING`: Event is scheduled for future
- `ACTIVE`: Event is currently ongoing
- `COMPLETED`: Event has finished
- `CANCELLED`: Event was cancelled
- `INACTIVE`: Event is inactive

## Sample cURL Commands

### Create Event
```bash
curl -X POST http://localhost:3001/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Blood Donation Camp",
    "description": "Community blood donation drive",
    "eventDate": "2024-02-15",
    "startTime": "09:00",
    "endTime": "17:00",
    "location": "Community Center",
    "address": "123 Main Street, City, State",
    "category": "BLOOD_CAMP",
    "contactPerson": "John Doe",
    "contactPhone": "+1234567890"
  }'
```

### Get All Events
```bash
curl http://localhost:3001/events
```

### Get Upcoming Events
```bash
curl http://localhost:3001/events/upcoming
```

### Get Event Statistics
```bash
curl http://localhost:3001/events/stats
```
