# Phone Field Addition - Complete Summary

## 🎯 Objective
Add a `phone` field to the User table in the backend database and update all related code to support it.

## ✅ Changes Completed

### 1. Database Schema Changes

**File: `prisma/schema.prisma`**

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  phone        String?  // ← NEW FIELD (optional)
  passwordHash String   @map("password_hash")
  firstName    String   @map("first_name")
  lastName     String   @map("last_name")
  role         UserRole @default(ADMIN)
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  // ... relations
}
```

### 2. DTO Updates

#### **File: `src/users/dto/create-user.dto.ts`**
Added phone field validation:
```typescript
@ApiProperty({ example: '+1234567890', required: false })
@IsString()
@IsOptional()
phone?: string;
```

#### **File: `src/auth/dto/register.dto.ts`**
Added phone field validation:
```typescript
@ApiProperty({ example: '+1234567890', required: false })
@IsString()
@IsOptional()
phone?: string;
```

### 3. Service Updates

#### **File: `src/users/users.service.ts`**
Updated `findAll()` method to include phone in select:
```typescript
async findAll() {
  return this.prisma.user.findMany({
    select: {
      id: true,
      email: true,
      phone: true,  // ← ADDED
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
```

#### **File: `src/auth/auth.service.ts`**

**Updated login response:**
```typescript
return {
  access_token: this.jwtService.sign(payload),
  user: {
    id: user.id,
    email: user.email,
    phone: user.phone,  // ← ADDED
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  },
};
```

**Updated donor registration:**
```typescript
const result = await this.donorsService.createDonorWithUser({
  user: {
    email: registerDonorDto.email,
    phone: registerDonorDto.phone,  // ← ADDED
    passwordHash: hashedPassword,
    firstName: registerDonorDto.firstName,
    lastName: registerDonorDto.lastName,
    role: 'DONOR',
  },
  donor: {
    ...donorData,
    name: `${firstName} ${lastName}`,
    dateOfBirth: new Date(registerDonorDto.dateOfBirth),
  },
});
```

**Updated registration response:**
```typescript
return {
  access_token: this.jwtService.sign(payload),
  user: {
    id: result.user.id,
    email: result.user.email,
    phone: result.user.phone,  // ← ADDED
    firstName: result.user.firstName,
    lastName: result.user.lastName,
    role: result.user.role,
  },
  donor: result.donor,
  message: 'Donor registered successfully',
};
```

## 📋 Migration Instructions

### ⚠️ IMPORTANT: Stop the Server First!

Before running migrations, you **MUST** stop the NestJS development server:

```bash
# In the terminal where the server is running, press Ctrl+C
```

### Step 1: Run Database Migration

```bash
cd c:\Users\Dell\Documents\muktsarngo\muktsar-api
npx prisma migrate dev --name add_phone_to_user
```

This command will:
1. Create a new migration file in `prisma/migrations/`
2. Apply the migration to the database
3. Regenerate the Prisma Client with updated types

### Step 2: Verify Migration

```bash
# Check that the migration was created
ls prisma/migrations

# Verify Prisma client generation
npx prisma generate
```

### Step 3: Restart the Server

```bash
npm run start:dev
```

## 🧪 Testing

### Automated Test
Run the provided test script:

```bash
node test-phone-field.js
```

This will test:
- ✅ Registration with phone number
- ✅ Login returns phone number
- ✅ Registration without phone number (optional field)

### Manual Testing

#### Test 1: Register with Phone
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "password123",
    "bloodGroup": "O_POSITIVE",
    "gender": "MALE",
    "dateOfBirth": "1990-01-01",
    "address": "123 Main St",
    "city": "City",
    "state": "State",
    "pincode": "123456",
    "emergencyContact": "9876543211"
  }'
```

Expected response:
```json
{
  "access_token": "...",
  "user": {
    "id": "...",
    "email": "john@example.com",
    "phone": "9876543210",
    "firstName": "John",
    "lastName": "Doe",
    "role": "DONOR"
  },
  "donor": { ... },
  "message": "Donor registered successfully"
}
```

#### Test 2: Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Expected response includes phone:
```json
{
  "access_token": "...",
  "user": {
    "id": "...",
    "email": "john@example.com",
    "phone": "9876543210",
    "firstName": "John",
    "lastName": "Doe",
    "role": "DONOR"
  }
}
```

## 📝 Key Points

1. **Optional Field**: The phone field is optional (`String?` in Prisma schema)
2. **Backward Compatible**: Existing users without phone numbers will have `null`
3. **No Breaking Changes**: All existing functionality continues to work
4. **Included in Responses**: Phone is now included in:
   - Login response
   - Registration response
   - User list (GET /api/users)
   - User profile (GET /api/users/:id)

## 🔧 Troubleshooting

### Error: "EPERM: operation not permitted"
**Cause**: NestJS server is still running and has locked Prisma client files.
**Solution**: Stop the server with Ctrl+C, then run the migration again.

### Error: "Drift detected"
**Cause**: Database schema doesn't match migration history.
**Solution**: 
```bash
npx prisma migrate reset --force
npx prisma migrate dev --name add_phone_to_user
```

### TypeScript Errors After Migration
**Cause**: Prisma client types not regenerated.
**Solution**:
```bash
npx prisma generate
```

## 📦 Files Modified

1. ✅ `prisma/schema.prisma` - Added phone field to User model
2. ✅ `src/users/dto/create-user.dto.ts` - Added phone validation
3. ✅ `src/auth/dto/register.dto.ts` - Added phone validation  
4. ✅ `src/users/users.service.ts` - Added phone to select queries
5. ✅ `src/auth/auth.service.ts` - Added phone to all user responses

## 🚀 Next Steps

After successful migration:

1. **Update React Native App**: Modify registration form to include phone field
2. **Update Admin Panel**: Display phone numbers in user lists
3. **Consider Validation**: Add phone format validation if needed
4. **Update Documentation**: Update API documentation with phone field
5. **Seed Data**: Update seed scripts to include phone numbers

## 📞 API Changes

### Registration Endpoint: `POST /api/auth/register`
**New Request Body** (phone is optional):
```json
{
  "firstName": "string",
  "lastName": "string",
  "name": "string",
  "email": "string",
  "phone": "string",  // ← NEW (optional)
  "password": "string",
  "bloodGroup": "enum",
  "gender": "enum",
  "dateOfBirth": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "pincode": "string",
  "emergencyContact": "string"
}
```

**Response** now includes phone in user object.

### Login Endpoint: `POST /api/auth/login`
**Response** now includes phone in user object.

### Get Users: `GET /api/users`
**Response** now includes phone for each user.

