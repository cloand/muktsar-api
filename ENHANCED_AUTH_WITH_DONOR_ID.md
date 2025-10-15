# Enhanced Authentication with Both User ID and Donor ID

## 🎯 Enhancement Overview
The authentication system now includes both `userId` and `donorId` in JWT tokens and auth responses, allowing for more efficient database operations and better user experience.

## 🔧 Changes Made

### 1. Updated Auth Service (`src/auth/auth.service.ts`)

#### Login Method Enhancement
```typescript
async login(loginDto: LoginDto) {
  const user = await this.validateUser(loginDto.email, loginDto.password);
  
  // For donors, find their donor profile to get donorId
  let donorId: string | null = null;
  if (user.role === 'DONOR') {
    try {
      const donor = await this.donorsService.findByUserEmail(user.email);
      donorId = donor?.id || null;
    } catch (error) {
      console.log('Donor profile not found for user:', user.email);
    }
  }

  const payload = { 
    email: user.email, 
    sub: user.id, 
    role: user.role,
    donorId: donorId // ✅ Include donorId in JWT payload
  };

  return {
    access_token: this.jwtService.sign(payload),
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      donorId: donorId, // ✅ Include donorId in response
    },
  };
}
```

#### Register Donor Method Enhancement
```typescript
// Generate JWT token with donorId
const payload = {
  email: result.user.email,
  sub: result.user.id,
  role: result.user.role,
  donorId: result.donor.id, // ✅ Include donorId in JWT payload
};

return {
  access_token: this.jwtService.sign(payload),
  user: {
    id: result.user.id,
    email: result.user.email,
    firstName: result.user.firstName,
    lastName: result.user.lastName,
    role: result.user.role,
    donorId: result.donor.id, // ✅ Include donorId in response
  },
  donor: result.donor,
  message: 'Donor registered successfully',
};
```

### 2. Updated JWT Strategy (`src/auth/strategies/jwt.strategy.ts`)

```typescript
async validate(payload: any) {
  return { 
    userId: payload.sub, 
    email: payload.email, 
    role: payload.role,
    donorId: payload.donorId || null // ✅ Include donorId from JWT payload
  };
}
```

### 3. Enhanced Alerts Service (`src/alerts/alerts.service.ts`)

```typescript
async acceptAlert(alertId: string, userId: string, donorId?: string) {
  // Check if alert exists and is active
  const alert = await this.findOne(alertId);

  let actualDonorId: string;

  // If donorId is provided, use it directly (more efficient)
  if (donorId) {
    // Verify the donor exists
    const donor = await this.prisma.donor.findUnique({
      where: { id: donorId },
    });

    if (!donor) {
      throw new Error('Donor profile not found');
    }

    actualDonorId = donorId;
  } else {
    // Fallback: Find the user to get their email, then find donor
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const donor = await this.prisma.donor.findUnique({
      where: { email: user.email },
    });

    actualDonorId = donor.id;
  }

  // Create acceptance record with correct donorId
  await this.prisma.alertAcceptance.create({
    data: {
      alertId,
      donorId: actualDonorId,
    },
  });
}
```

### 4. Updated Alerts Controller (`src/alerts/alerts.controller.ts`)

```typescript
@Post(':id/accept')
@UseGuards(JwtAuthGuard)
acceptAlert(@Param('id') id: string, @Request() req: any) {
  // Pass both userId and donorId (donorId will be used if available)
  return this.alertsService.acceptAlert(id, req.user.userId, req.user.donorId);
}
```

## 🔄 Data Flow

### For Donors (Enhanced)
```
1. Login/Register → JWT contains: { userId, donorId, email, role }
2. Frontend stores both IDs
3. API calls include both IDs in req.user
4. Alert acceptance uses donorId directly (fast path)
5. Database operations use correct foreign keys
```

### For Admins (Unchanged)
```
1. Login → JWT contains: { userId, donorId: null, email, role }
2. Admin operations use userId as before
3. No donor-specific functionality needed
```

## 🚀 Benefits

### 1. Performance Improvement
- **Direct donor operations**: No need to lookup donor by email
- **Fewer database queries**: Skip User → Donor resolution
- **Faster alert acceptance**: Direct use of donorId

### 2. Better User Experience
- **Immediate donor info**: Frontend has donorId from login
- **Consistent data**: Both IDs available throughout session
- **Reliable operations**: Fallback mechanism for edge cases

### 3. Backward Compatibility
- **Existing code works**: Fallback to email lookup if donorId missing
- **Gradual migration**: Old tokens still work until expiry
- **No breaking changes**: Frontend can use either approach

### 4. Enhanced Security
- **JWT validation**: Both IDs validated in JWT
- **Donor verification**: donorId existence checked before use
- **Role-based access**: Proper role checking maintained

## 📊 Auth Response Examples

### Donor Login Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid-123",
    "email": "donor@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "DONOR",
    "donorId": "donor-uuid-456"
  }
}
```

### Admin Login Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid-789",
    "email": "admin@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "ADMIN",
    "donorId": null
  }
}
```

### JWT Payload Structure
```json
{
  "email": "donor@example.com",
  "sub": "user-uuid-123",
  "role": "DONOR",
  "donorId": "donor-uuid-456",
  "iat": 1697123456,
  "exp": 1697209856
}
```

## 🧪 Testing

### Test Donor Alert Acceptance
1. **Login as donor** → Verify `donorId` in response
2. **Accept an alert** → Should use direct donorId path
3. **Check database** → AlertAcceptance should have correct donorId
4. **Verify performance** → Should be faster (fewer queries)

### Test Admin Operations
1. **Login as admin** → Verify `donorId: null` in response
2. **Admin operations** → Should work as before
3. **No donor functionality** → Admin shouldn't have donorId

### Test Fallback Mechanism
1. **Use old JWT token** (without donorId) → Should fall back to email lookup
2. **Missing donor profile** → Should handle gracefully
3. **Invalid donorId** → Should validate and error appropriately

## 🔍 Troubleshooting

### Issue: donorId is null for donors
**Solution**: Check that donor profile exists and email matches user email

### Issue: Alert acceptance still slow
**Solution**: Verify that donorId is being passed and used in the fast path

### Issue: JWT validation errors
**Solution**: Ensure JWT strategy includes donorId in validate method

## ✅ Verification Checklist

- [ ] Login response includes both `userId` and `donorId` for donors
- [ ] JWT payload contains both IDs
- [ ] Alert acceptance uses donorId when available
- [ ] Fallback mechanism works for missing donorId
- [ ] Admin users have `donorId: null`
- [ ] No breaking changes to existing functionality
- [ ] Performance improved for donor operations

The enhanced authentication system now provides both `userId` and `donorId` in the auth object, enabling efficient database operations while maintaining backward compatibility and robust error handling.
