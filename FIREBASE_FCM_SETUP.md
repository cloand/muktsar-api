# Firebase FCM (Push Notifications) Setup Guide

This guide explains how to set up Firebase Cloud Messaging (FCM) for push notifications in your Muktsar NGO application.

## 🔥 Firebase Project Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `muktsar-ngo` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Cloud Messaging

1. In your Firebase project, go to **Project Settings** (gear icon)
2. Navigate to the **Cloud Messaging** tab
3. Note down your **Server key** and **Sender ID**

### 3. Generate Service Account Key

1. In Firebase Console, go to **Project Settings** → **Service accounts**
2. Click **"Generate new private key"**
3. Download the JSON file (keep it secure!)
4. The JSON file contains all the credentials you need

## 🔧 Backend Configuration

### 1. Environment Variables

Add these variables to your `.env` file using the values from your downloaded service account JSON:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
```

### 2. Mapping Service Account JSON to Environment Variables

From your downloaded service account JSON file, map the values like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",           → FIREBASE_PROJECT_ID
  "private_key_id": "key-id",                → FIREBASE_PRIVATE_KEY_ID
  "private_key": "-----BEGIN PRIVATE KEY-----\n...", → FIREBASE_PRIVATE_KEY
  "client_email": "firebase-adminsdk-...",   → FIREBASE_CLIENT_EMAIL
  "client_id": "123456789",                  → FIREBASE_CLIENT_ID
  "auth_uri": "https://accounts.google.com/o/oauth2/auth", → FIREBASE_AUTH_URI
  "token_uri": "https://oauth2.googleapis.com/token", → FIREBASE_TOKEN_URI
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs", → FIREBASE_AUTH_PROVIDER_X509_CERT_URL
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..." → FIREBASE_CLIENT_X509_CERT_URL
}
```

**Important:** For the `FIREBASE_PRIVATE_KEY`, make sure to:
- Keep the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts
- Replace actual newlines with `\n` in the environment variable
- Wrap the entire value in double quotes

## 📱 Frontend/Mobile App Setup

### For React Native

1. Install Firebase SDK:
```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

2. Configure Firebase in your React Native app:
   - Add `google-services.json` (Android) to `android/app/`
   - Add `GoogleService-Info.plist` (iOS) to `ios/YourApp/`

3. Register FCM token with your backend:
```javascript
import messaging from '@react-native-firebase/messaging';

// Get FCM token
const fcmToken = await messaging().getToken();

// Register with your backend
await fetch('http://your-api/api/notifications/register-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`,
  },
  body: JSON.stringify({
    token: fcmToken,
    deviceId: 'unique-device-id',
  }),
});
```

## 🧪 Testing FCM Notifications

### 1. Test with API Endpoint

Once you have registered FCM tokens, you can test notifications:

```bash
# Test notification to all donors
curl -X POST "http://localhost:3001/api/notifications/test-notification" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Alert",
    "message": "This is a test emergency alert!"
  }'
```

### 2. Check Active Tokens

```bash
# Get count of active FCM tokens
curl -X GET "http://localhost:3001/api/notifications/tokens/count" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Create Emergency Alert

When you create an emergency alert, FCM notifications will be sent automatically:

```bash
curl -X POST "http://localhost:3001/api/alerts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "title": "Emergency Blood Needed",
    "message": "Urgent blood donation required",
    "hospitalName": "City Hospital",
    "hospitalAddress": "123 Main St",
    "contactPerson": "Dr. Smith",
    "contactPhone": "+1234567890",
    "bloodGroup": "O_POSITIVE",
    "unitsRequired": 5,
    "urgency": "HIGH"
  }'
```

## 🔍 Troubleshooting

### Common Issues

1. **Firebase not initialized**: Check your environment variables are correctly set
2. **Invalid private key**: Ensure the private key format is correct with proper `\n` escaping
3. **No tokens found**: Make sure mobile apps have registered their FCM tokens
4. **Notifications not received**: Check device notification permissions and Firebase project configuration

### Debug Logs

The application logs FCM operations. Check your console for:
- `Firebase Admin SDK initialized successfully`
- `Successfully sent message: ...`
- `Found X active FCM tokens`

### Testing Firebase Configuration

You can test if Firebase is properly configured by checking the logs when the server starts. If you see initialization errors, double-check your environment variables.

## 📋 Features Implemented

✅ **Firebase Admin SDK Integration**
✅ **FCM Token Management** (register/unregister)
✅ **Send Notifications to All Donors**
✅ **Send Notifications to Specific Users**
✅ **Automatic Notifications on Alert Creation**
✅ **Test Notification Endpoint**
✅ **Token Count Monitoring**
✅ **Error Handling and Logging**
✅ **Support for Android and iOS**

## 🚀 Next Steps

1. Set up your Firebase project and get the service account JSON
2. Update your `.env` file with Firebase credentials
3. Configure your mobile app to register FCM tokens
4. Test notifications using the provided endpoints
5. Monitor logs for any issues

The FCM notification system is now ready to send emergency alerts to all registered donors automatically when new alerts are created!
