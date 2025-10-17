# Render Environment Variables Setup

## Critical Database Connection Fix

To fix the "too many connections" error, you need to update your environment variables on Render.com:

### 1. Update DATABASE_URL on Render

Go to your Render dashboard → Your service → Environment tab

**Replace your current DATABASE_URL with:**
```
postgresql://ugotowi7vtzczjuycvay:KXKf1cgSMr0HW3rr94GraFeGLDCiKD@bxhoupp0553sltytq24m-postgresql.services.clever-cloud.com:50013/bxhoupp0553sltytq24m?connection_limit=1&pool_timeout=5&sslmode=require
```

**⚠️ CRITICAL for Clever Cloud Free Tier:**
- `connection_limit=1` - Only 1 connection (free tier has very low limits)
- `pool_timeout=5` - Quick timeout to prevent hanging
- `sslmode=require` - Required for Clever Cloud security

### 2. Add DIRECT_URL on Render

**Add a new environment variable:**
- **Key:** `DIRECT_URL`
- **Value:** `postgresql://ugotowi7vtzczjuycvay:KXKf1cgSMr0HW3rr94GraFeGLDCiKD@bxhoupp0553sltytq24m-postgresql.services.clever-cloud.com:50013/bxhoupp0553sltytq24m`

### 3. What These Changes Do

- **connection_limit=1**: SINGLE connection only (critical for free tier)
- **pool_timeout=5**: Fast 5-second timeout to prevent hanging
- **sslmode=require**: Required SSL connection for Clever Cloud
- **DIRECT_URL**: Used for migrations and schema operations
- **Graceful shutdown**: Properly closes connections when app restarts
- **Health monitoring**: New `/api/health` endpoint shows connection status

### 4. After Making Changes

1. Save the environment variables on Render
2. Trigger a new deployment (or it will auto-deploy from the git push)
3. Monitor the logs for successful database connection

### 5. Expected Result

You should see in the logs:
```
[PrismaService] Successfully connected to database
🚀 Application is running on port: 3001
```

Instead of the previous error:
```
FATAL: too many connections for role "ugotowi7vtzczjuycvay"
```

This fix addresses the root cause of the database connection exhaustion issue.
