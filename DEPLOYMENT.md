# Deployment Guide

## Environment Variables Required

Make sure to set these environment variables on your deployment platform:

### Database
```
DATABASE_URL=postgresql://username:password@host:port/database
```

### JWT Configuration
```
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
```

### App Configuration
```
PORT=3001
NODE_ENV=production
```

### Cloudinary (Optional)
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### YouTube API (Optional)
```
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CLIENT_ID=your_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_REDIRECT_URI=https://yourdomain.com/media/youtube/auth-callback
```

### Firebase FCM (Optional)
```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
```

### CORS
```
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Build Commands

### For Render.com
```
npm install && npm run build
```

### Start Command
```
npm run start:prod
```

## Database Setup

The application will automatically:
1. Generate Prisma client during build (`postinstall` script)
2. Push database schema during production start (`start:prod` script)

## Troubleshooting

### Common Issues

1. **Prisma Schema Not Found**: Make sure `prisma/schema.prisma` is committed to git
2. **JWT Configuration Error**: Ensure `JWT_SECRET` and `JWT_EXPIRES_IN` are set
3. **Database Connection**: Verify `DATABASE_URL` is correct and database is accessible
4. **Build Failures**: Check that all environment variables are set correctly

### Manual Database Setup (if needed)
```bash
npx prisma db push
npx prisma generate
```
