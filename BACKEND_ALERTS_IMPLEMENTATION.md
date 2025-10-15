# ✅ Backend Alerts API - Implementation Complete

## 🎉 All Backend Changes Applied!

I've successfully implemented all the required backend API endpoints for the Alerts feature in your MuktsarNGO app.

---

## 📝 Summary of Changes

### ✅ **Database Schema Updates:**

1. **Updated Alert Model** (`prisma/schema.prisma`)
   - Added `acceptances` relation to track donors who accepted alerts
   - Alert model now includes:
     - `expiresAt` field (required) - when the alert expires
     - Relation to `AlertAcceptance` model

2. **Created AlertAcceptance Model** (`prisma/schema.prisma`)
   - Tracks which donors accepted which alerts
   - Fields:
     - `id` - UUID primary key
     - `alertId` - Reference to Alert
     - `donorId` - Reference to Donor
     - `createdAt` - When donor accepted
   - Unique constraint on `[alertId, donorId]` to prevent duplicate acceptances

3. **Updated Donor Model** (`prisma/schema.prisma`)
   - Added `alertAcceptances` relation

4. **Migration Created**
   - ✅ Migration `20251012184037_add_alert_acceptances` applied successfully

---

### ✅ **Service Updates** (`src/alerts/alerts.service.ts`):

1. **Fixed `create()` method**
   - Now automatically sets `expiresAt` to 24 hours from creation if not provided
   - Accepts custom `expiresAt` from request body

2. **Enhanced `findActive()` method**
   - Returns active alerts that haven't expired
   - Includes `acceptedDonorsCount` field

3. **Added `findPast()` method**
   - Returns completed, cancelled, or expired alerts
   - Includes `acceptedDonorsCount` field

4. **Added `acceptAlert(alertId, donorId)` method**
   - Allows donors to accept alerts
   - Validates alert is active and not expired
   - Prevents duplicate acceptances
   - Returns success message

5. **Added `getAcceptedDonors(alertId)` method**
   - Returns list of donors who accepted the alert
   - Includes donor details and acceptance timestamp
   - Admin only

6. **Added `markComplete(alertId)` method**
   - Marks alert as COMPLETED
   - Admin only

---

### ✅ **Controller Updates** (`src/alerts/alerts.controller.ts`):

#### **New Endpoints Added:**

1. **GET `/alerts/current`**
   - Returns current/active alerts
   - Same as `/alerts/active`
   - All authenticated users

2. **GET `/alerts/past`**
   - Returns past/completed/expired alerts
   - All authenticated users

3. **POST `/alerts/:id/accept`**
   - Accept an alert
   - Request body: `{ "donorId": "donor-uuid" }`
   - Response: `{ "success": true, "message": "Alert accepted successfully" }`
   - All authenticated users (donors)

4. **GET `/alerts/:id/accepted-donors`**
   - Get list of donors who accepted the alert
   - Response: `{ "data": [{ donor details + acceptedAt }] }`
   - Admin only

5. **POST `/alerts/:id/mark-complete`**
   - Mark alert as completed
   - Response: Updated alert object
   - Admin only

---

## 📋 Complete API Endpoints

### Public Endpoints:
None - all endpoints require authentication

### Authenticated User Endpoints:

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/alerts` | Get all alerts | All |
| GET | `/alerts/active` | Get active alerts | All |
| GET | `/alerts/current` | Get current alerts (alias for active) | All |
| GET | `/alerts/past` | Get past/completed alerts | All |
| GET | `/alerts/:id` | Get alert by ID | All |
| POST | `/alerts/:id/accept` | Accept an alert | All (Donors) |

### Admin Only Endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/alerts` | Create new alert |
| PATCH | `/alerts/:id` | Update alert |
| DELETE | `/alerts/:id` | Delete/cancel alert |
| GET | `/alerts/:id/accepted-donors` | Get donors who accepted |
| POST | `/alerts/:id/mark-complete` | Mark alert as complete |

---

## 🔧 API Request/Response Examples

### 1. Create Alert (Admin)
```http
POST /alerts
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Urgent Blood Needed",
  "message": "2 units of B+ blood required urgently",
  "hospitalName": "City Hospital",
  "hospitalAddress": "123 Main St, Mumbai",
  "contactPerson": "Dr. Smith",
  "contactPhone": "9876543210",
  "bloodGroup": "B_POSITIVE",
  "unitsRequired": 2,
  "urgency": "HIGH",
  "expiresAt": "2025-10-13T18:00:00Z" // Optional, defaults to 24 hours
}
```

**Response:**
```json
{
  "id": "alert-uuid",
  "title": "Urgent Blood Needed",
  "message": "2 units of B+ blood required urgently",
  "hospitalName": "City Hospital",
  "hospitalAddress": "123 Main St, Mumbai",
  "contactPerson": "Dr. Smith",
  "contactPhone": "9876543210",
  "bloodGroup": "B_POSITIVE",
  "unitsRequired": 2,
  "urgency": "HIGH",
  "status": "ACTIVE",
  "expiresAt": "2025-10-13T18:00:00.000Z",
  "createdBy": "admin-user-id",
  "createdAt": "2025-10-12T18:00:00.000Z",
  "updatedAt": "2025-10-12T18:00:00.000Z"
}
```

### 2. Get Current Alerts
```http
GET /alerts/current
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "alert-uuid",
    "title": "Urgent Blood Needed",
    "message": "2 units required",
    "hospitalName": "City Hospital",
    "bloodGroup": "B_POSITIVE",
    "urgency": "HIGH",
    "status": "ACTIVE",
    "acceptedDonorsCount": 5,
    "expiresAt": "2025-10-13T18:00:00.000Z",
    "createdAt": "2025-10-12T18:00:00.000Z"
  }
]
```

### 3. Accept Alert (Donor)
```http
POST /alerts/:id/accept
Authorization: Bearer <donor-token>
Content-Type: application/json

{
  "donorId": "donor-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Alert accepted successfully"
}
```

### 4. Get Accepted Donors (Admin)
```http
GET /alerts/:id/accepted-donors
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "donor-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "bloodGroup": "B_POSITIVE",
      "city": "Mumbai",
      "state": "Maharashtra",
      "isEligible": true,
      "acceptedAt": "2025-10-12T18:30:00.000Z"
    }
  ]
}
```

### 5. Mark Alert Complete (Admin)
```http
POST /alerts/:id/mark-complete
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "id": "alert-uuid",
  "status": "COMPLETED",
  ...
}
```

---

## 🎯 Alert Status Flow

```
ACTIVE → COMPLETED (manually marked by admin)
ACTIVE → CANCELLED (deleted by admin)
ACTIVE → (expired when expiresAt < now)
```

---

## 🔐 Authentication & Authorization

- **All endpoints require JWT authentication** via `@UseGuards(JwtAuthGuard)`
- **Admin-only endpoints** use `@Roles('ADMIN')` decorator
- **Token format:** `Authorization: Bearer <jwt-token>`

---

## ✅ Implementation Checklist

- [x] Create AlertAcceptance model in Prisma schema
- [x] Add relations to Alert and Donor models
- [x] Run database migration
- [x] Fix Alert creation to include expiresAt
- [x] Add findPast() method
- [x] Add acceptAlert() method
- [x] Add getAcceptedDonors() method
- [x] Add markComplete() method
- [x] Add GET /alerts/current endpoint
- [x] Add GET /alerts/past endpoint
- [x] Add POST /alerts/:id/accept endpoint
- [x] Add GET /alerts/:id/accepted-donors endpoint
- [x] Add POST /alerts/:id/mark-complete endpoint
- [x] Include acceptedDonorsCount in responses

---

## 🚀 Testing the API

You can now test the API using:

1. **Swagger UI:** http://localhost:3000/api
2. **Postman/Thunder Client**
3. **React Native App**

### Test Flow:
1. Login as admin → Get JWT token
2. Create an alert → POST /alerts
3. Login as donor → Get JWT token
4. Get current alerts → GET /alerts/current
5. Accept alert → POST /alerts/:id/accept
6. Login as admin again
7. View accepted donors → GET /alerts/:id/accepted-donors
8. Mark complete → POST /alerts/:id/mark-complete

---

## 🎊 All Done!

The backend is now fully implemented and ready to work with your React Native app! All the endpoints that the mobile app expects are now available and functional.

**Start your backend server:**
```bash
npm run start:dev
```

**The API will be available at:** `http://localhost:3000`

🎉 **Happy coding!**

