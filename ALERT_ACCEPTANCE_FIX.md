# Alert Acceptance Foreign Key Fix

## 🚨 Problem Fixed
**Error:** `Foreign key constraint violated on the foreign key` when donors try to accept alerts.

**Root Cause:** The frontend was sending a `User ID` as `donorId`, but the database `AlertAcceptance` table expects a `Donor ID` (foreign key to the `donors` table).

## ✅ Solution Applied

### 1. Updated `acceptAlert` Method in AlertsService
**File:** `src/alerts/alerts.service.ts`

**Changes:**
- Changed parameter from `donorId: string` to `userId: string`
- Added logic to find the user by ID first
- Then find the donor record by the user's email
- Use the actual donor ID for the AlertAcceptance record

```typescript
async acceptAlert(alertId: string, userId: string) {
  // Find the user to get their email
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Find the donor record by email
  const donor = await this.prisma.donor.findUnique({
    where: { email: user.email },
  });

  if (!donor) {
    throw new Error('Donor profile not found');
  }

  // Use donor.id for AlertAcceptance
  await this.prisma.alertAcceptance.create({
    data: {
      alertId,
      donorId: donor.id, // ✅ Now uses correct donor ID
    },
  });
}
```

### 2. Updated Controller to Use User ID from JWT
**File:** `src/alerts/alerts.controller.ts`

**Changes:**
- Removed `@Body() body: { donorId: string }` parameter
- Added `@Request() req: any` to get user from JWT
- Pass `req.user.userId` to the service

```typescript
@Post(':id/accept')
@UseGuards(JwtAuthGuard)
acceptAlert(@Param('id') id: string, @Request() req: any) {
  return this.alertsService.acceptAlert(id, req.user.userId); // ✅ Uses user ID from JWT
}
```

## 🔄 Data Flow (Fixed)

### Before (Broken)
```
Frontend → API: { donorId: "user-id-123" }
API → Database: AlertAcceptance { donorId: "user-id-123" }
Database: ❌ Foreign key violation (user-id-123 doesn't exist in donors table)
```

### After (Fixed)
```
Frontend → API: JWT token with user ID
API: Extract user ID from JWT → Find User → Find Donor by email
API → Database: AlertAcceptance { donorId: "donor-id-456" }
Database: ✅ Success (donor-id-456 exists in donors table)
```

## 🧪 Testing

### Test the Fix
1. **Login as a donor** (make sure you have a donor profile)
2. **Navigate to emergency alerts**
3. **Click "I'm Ready to Donate"**
4. **Verify success message** (no foreign key error)

### Expected Behavior
- ✅ Alert acceptance should work without errors
- ✅ Success message: "Alert accepted successfully"
- ✅ Donor should not be able to accept the same alert twice
- ✅ Alert should show updated acceptance count for admins

## 🔍 Error Handling Added

### New Error Cases
1. **User not found**: If JWT contains invalid user ID
2. **Donor profile not found**: If user doesn't have a donor profile
3. **Alert not active**: If alert is resolved/cancelled
4. **Alert expired**: If alert has passed expiration time
5. **Already accepted**: If donor already accepted this alert

### Error Messages
```typescript
// User validation
if (!user) {
  throw new Error('User not found');
}

// Donor profile validation
if (!donor) {
  throw new Error('Donor profile not found');
}

// Duplicate acceptance
if (existing) {
  return { success: true, message: 'Already accepted this alert' };
}
```

## 🔗 Database Relationships

### Correct Foreign Key Chain
```
User (id) → email
Donor (email) → id
AlertAcceptance (donorId) → Donor (id) ✅
```

### Schema Validation
- ✅ `AlertAcceptance.donorId` references `Donor.id`
- ✅ `User` and `Donor` linked by email
- ✅ JWT provides `User.id`
- ✅ Service resolves User → Donor → AlertAcceptance

## 🚀 Benefits

1. **Proper Foreign Key Relationships**: Database integrity maintained
2. **Secure User Identification**: Uses JWT user ID, not frontend-provided ID
3. **Better Error Handling**: Clear error messages for different failure cases
4. **Consistent Data Model**: Follows the established User ↔ Donor relationship
5. **No Frontend Changes Required**: Frontend can continue sending the same requests

## 📝 Notes

- **No frontend changes needed**: The API now extracts user ID from JWT automatically
- **Backward compatible**: Existing frontend code will work without modifications
- **Secure**: User ID comes from authenticated JWT token, not request body
- **Robust**: Handles edge cases like missing donor profiles or duplicate acceptances

The fix ensures that alert acceptance works correctly while maintaining proper database relationships and security.
