# Admin Last Donation Date Update - Implementation Guide

## Overview
This implementation allows only admin users to update a donor's last donation date. When a donor like "Sanam" donates blood today, only an admin can mark Sanam's last donation date as today.

## 🔧 Backend Implementation

### 1. Database Schema
The `Donor` model already includes the `lastDonationDate` field:
```prisma
model Donor {
  id                String     @id @default(uuid())
  name              String
  email             String     @unique
  // ... other fields
  lastDonationDate  DateTime?  @map("last_donation_date")
  totalDonations    Int        @default(0) @map("total_donations")
  // ... other fields
}
```

### 2. Service Layer (`src/donors/donors.service.ts`)
Added new method to update last donation date:
```typescript
async updateLastDonationDate(id: string, lastDonationDate: Date) {
  const donor = await this.findOne(id);
  
  return this.prisma.donor.update({
    where: { id },
    data: { 
      lastDonationDate,
      // Optionally increment total donations count
      totalDonations: { increment: 1 }
    },
  });
}
```

### 3. Controller Layer (`src/donors/donors.controller.ts`)
Added admin-only endpoint:
```typescript
@Patch(':id/last-donation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
@ApiOperation({ summary: 'Update donor last donation date (Admin only)' })
updateLastDonationDate(
  @Param('id') id: string, 
  @Body() updateLastDonationDto: UpdateLastDonationDto
) {
  // Validation logic and service call
}
```

### 4. DTO (Data Transfer Object)
Created `src/donors/dto/update-last-donation.dto.ts`:
```typescript
export class UpdateLastDonationDto {
  @IsNotEmpty({ message: 'Last donation date is required' })
  @IsDateString({}, { message: 'Last donation date must be a valid date string' })
  lastDonationDate: string;
}
```

## 🔐 Security Features

### Admin-Only Access
- **JWT Authentication**: Requires valid JWT token
- **Role-Based Authorization**: Only `ADMIN` and `SUPER_ADMIN` roles can access
- **Guards**: Uses `JwtAuthGuard` and `RolesGuard` for protection

### Input Validation
- **Date Format Validation**: Ensures valid ISO date string
- **Future Date Prevention**: Cannot set donation date in the future
- **Required Field**: Last donation date is mandatory

## 📡 API Usage

### Endpoint
```
PATCH /donors/{donorId}/last-donation
```

### Headers
```
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
```

### Request Body
```json
{
  "lastDonationDate": "2024-01-15T10:30:00.000Z"
}
```

### Response
```json
{
  "id": "donor-uuid",
  "name": "Sanam",
  "email": "sanam@example.com",
  "lastDonationDate": "2024-01-15T10:30:00.000Z",
  "totalDonations": 5,
  // ... other donor fields
}
```

### Error Responses
```json
// Invalid date format
{
  "statusCode": 400,
  "message": "Invalid date format. Please provide a valid date.",
  "error": "Bad Request"
}

// Future date
{
  "statusCode": 400,
  "message": "Last donation date cannot be in the future.",
  "error": "Bad Request"
}

// Unauthorized access
{
  "statusCode": 403,
  "message": "Forbidden - Admin access required",
  "error": "Forbidden"
}
```

## 🧪 Testing

### Manual Testing
1. Start the NestJS server: `npm run start:dev`
2. Get an admin JWT token by logging in
3. Use the test script: `node test-last-donation-update.js`

### Example cURL Commands
```bash
# Update last donation date
curl -X PATCH http://localhost:3000/donors/{donor-id}/last-donation \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{"lastDonationDate": "2024-01-15T10:30:00.000Z"}'

# Get donor to verify update
curl -X GET http://localhost:3000/donors/{donor-id} \
  -H "Authorization: Bearer {admin-token}"
```

## 🎯 Use Case Example

**Scenario**: Donor "Sanam" donates blood today

1. **Admin logs in** to the system
2. **Admin finds Sanam** in the donor list
3. **Admin updates** Sanam's last donation date to today
4. **System automatically increments** Sanam's total donation count
5. **Sanam's profile** now shows the updated last donation date

## 🔄 Integration Points

### With Existing Systems
- **Donor Management**: Integrates with existing donor CRUD operations
- **Authentication**: Uses existing JWT and role-based auth system
- **Database**: Works with existing Prisma schema and migrations

### Future Enhancements
- **Audit Trail**: Track who updated the donation date and when
- **Bulk Updates**: Allow updating multiple donors at once
- **Notification System**: Notify donors when their donation is recorded
- **Donation History**: Maintain detailed donation history records

## 📋 Files Modified/Created

### Modified Files
- `src/donors/donors.service.ts` - Added `updateLastDonationDate` method
- `src/donors/donors.controller.ts` - Added admin endpoint and validation

### New Files
- `src/donors/dto/update-last-donation.dto.ts` - DTO for request validation
- `test-last-donation-update.js` - Test script for the functionality
- `ADMIN_LAST_DONATION_UPDATE_GUIDE.md` - This documentation

## ✅ Implementation Status

- ✅ Backend API endpoint created
- ✅ Admin-only access control implemented
- ✅ Input validation and error handling
- ✅ Database integration with Prisma
- ✅ Automatic donation count increment
- ✅ Comprehensive documentation
- ✅ Test script provided

The implementation is complete and ready for use. Only admin users can now update donor last donation dates through the secure API endpoint.
