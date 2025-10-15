# Alerts Tab Implementation Guide

## Overview
This guide provides step-by-step instructions to replace the "Reports" tab with an "Alerts" tab in the MuktsarNGO React Native app.

---

## Step 1: Update API Service (api.js)

### File: `D:\Documents\muktsarNgo\app\muktsarngo\src\services\api.js`

Add the following endpoints to the `apiEndpoints` object (around line 150):

```javascript
// Emergency Alerts - ADD THESE NEW ENDPOINTS
alerts: ENDPOINTS.ALERTS,
alertById: (id) => `${ENDPOINTS.ALERTS}/${id}`,
activeAlerts: ENDPOINTS.ACTIVE_ALERTS,
pastAlerts: `${ENDPOINTS.ALERTS}/past`,  // NEW
currentAlerts: `${ENDPOINTS.ALERTS}/current`,  // NEW
acceptAlert: (id) => `${ENDPOINTS.ALERTS}/${id}/accept`,  // NEW
acceptedDonors: (id) => `${ENDPOINTS.ALERTS}/${id}/accepted-donors`,  // NEW
markComplete: (id) => `${ENDPOINTS.ALERTS}/${id}/mark-complete`,  // NEW
resolveAlert: (id) => `${ENDPOINTS.ALERTS}/${id}/resolve`,
cancelAlert: (id) => `${ENDPOINTS.ALERTS}/${id}/cancel`,
```

Add the following methods to the `apiMethods` object (around line 200):

```javascript
// Emergency alert methods - UPDATE THIS SECTION
getAlerts: (params) => api.get(apiEndpoints.alerts, { params }),
createAlert: (alertData) => api.post(apiEndpoints.alerts, alertData),
getActiveAlerts: () => api.get(apiEndpoints.activeAlerts),
getCurrentAlerts: () => api.get(apiEndpoints.currentAlerts),  // NEW
getPastAlerts: () => api.get(apiEndpoints.pastAlerts),  // NEW
acceptAlert: (alertId, donorId) => api.post(apiEndpoints.acceptAlert(alertId), { donorId }),  // NEW
getAcceptedDonors: (alertId) => api.get(apiEndpoints.acceptedDonors(alertId)),  // NEW
markAlertComplete: (alertId) => api.post(apiEndpoints.markComplete(alertId)),  // NEW
resolveAlert: (id) => api.patch(apiEndpoints.resolveAlert(id)),
cancelAlert: (id) => api.patch(apiEndpoints.cancelAlert(id)),
```

---

## Step 2: Update ApiService.js

### File: `D:\Documents\muktsarNgo\app\muktsarngo\src\services\ApiService.js`

Add these methods to the ApiService class (around line 180):

```javascript
// Alerts API - ADD THESE NEW METHODS
async getCurrentAlerts() {
  return apiMethods.getCurrentAlerts();
}

async getPastAlerts() {
  return apiMethods.getPastAlerts();
}

async acceptAlert(alertId, donorId) {
  return apiMethods.acceptAlert(alertId, donorId);
}

async getAcceptedDonors(alertId) {
  return apiMethods.getAcceptedDonors(alertId);
}

async markAlertComplete(alertId) {
  return apiMethods.markAlertComplete(alertId);
}
```

---

## Step 3: Update config.js

### File: `D:\Documents\muktsarNgo\app\muktsarngo\src\config\config.js`

Verify these endpoints exist in the ENDPOINTS object:

```javascript
export const ENDPOINTS = {
  // ... existing endpoints ...
  
  // Alerts
  ALERTS: "/alerts",
  ACTIVE_ALERTS: "/alerts/active",
  
  // Add if missing:
  CURRENT_ALERTS: "/alerts/current",
  PAST_ALERTS: "/alerts/past",
};
```

---

## Step 4: Create AlertsTabContent Component

### File: `D:\Documents\muktsarNgo\app\muktsarngo\src\components\AlertsTabContent.js`

This component will be created in the next step (see separate file).

---

## Step 5: Create AlertDetailScreen

### File: `D:\Documents\muktsarNgo\app\muktsarngo\src\screens\AlertDetailScreen.js`

This screen will be created in the next step (see separate file).

---

## Step 6: Update AdminDashboardScreen.js

### File: `D:\Documents\muktsarNgo\app\muktsarngo\src\screens\AdminDashboardScreen.js`

### Change 1: Update the SegmentedButtons (around line 450)

**FIND:**
```javascript
<SegmentedButtons
  value={activeTab}
  onValueChange={setActiveTab}
  buttons={[
    {
      value: 'donors',
      label: 'Donors',
      icon: 'account-group',
    },
    {
      value: 'alerts',
      label: 'Alerts',
      icon: 'alert',
    },
    {
      value: 'reports',  // REMOVE THIS
      label: 'Reports',
      icon: 'chart-line',
    },
  ]}
  style={styles.segmentedButtons}
/>
```

**REPLACE WITH:**
```javascript
<SegmentedButtons
  value={activeTab}
  onValueChange={setActiveTab}
  buttons={[
    {
      value: 'donors',
      label: 'Donors',
      icon: 'account-group',
    },
    {
      value: 'alerts',
      label: 'Alerts',
      icon: 'bell-alert',
    },
  ]}
  style={styles.segmentedButtons}
/>
```

### Change 2: Update Tab Content Rendering (around line 700)

**FIND:**
```javascript
{activeTab === 'alerts' && (
  <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
    {/* Alerts Header */}
    <View style={styles.sectionHeader}>
      <Title style={styles.sectionTitle}>Emergency Alerts</Title>
      <Text style={styles.sectionSubtitle}>Send urgent blood donation alerts</Text>
    </View>

    {/* Alert Form */}
    <Card style={styles.alertCard}>
      {/* ... existing alert form ... */}
    </Card>
  </ScrollView>
)}

{activeTab === 'reports' && (
  <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
    {/* ... existing reports content ... */}
  </ScrollView>
)}
```

**REPLACE WITH:**
```javascript
{activeTab === 'alerts' && (
  <AlertsTabContent 
    user={user} 
    navigation={navigation}
    theme={theme}
  />
)}
```

### Change 3: Add Import at the top of the file

**ADD THIS IMPORT:**
```javascript
import AlertsTabContent from '../components/AlertsTabContent';
```

### Change 4: Remove Reports State and Functions

**REMOVE THESE (around line 80-90):**
```javascript
// Reports state
const [reportsSummary, setReportsSummary] = useState(null);
const [reportsLoading, setReportsLoading] = useState(false);
```

**REMOVE THIS FUNCTION (around line 200):**
```javascript
// Load reports summary
const loadReportsSummary = async () => {
  // ... entire function ...
};
```

**UPDATE useEffect (around line 100):**

**FIND:**
```javascript
useEffect(() => {
  if (activeTab === 'donors') {
    loadDonors();
  } else if (activeTab === 'reports') {
    loadReportsSummary();
  }
}, [activeTab]);
```

**REPLACE WITH:**
```javascript
useEffect(() => {
  if (activeTab === 'donors') {
    loadDonors();
  }
}, [activeTab]);
```

---

## Step 7: Update DonorHomeScreen.js

### File: `D:\Documents\muktsarNgo\app\muktsarngo\src\screens\DonorHomeScreen.js`

Add a new "Alerts" section to the donor home screen.

**FIND (around line 150):**
```javascript
{/* Recent Alerts Section */}
<Card style={styles.card}>
  <Card.Title
    title="Recent Alerts"
    left={(props) => <Avatar.Icon {...props} icon="bell-alert" />}
    right={(props) => (
      <Button onPress={navigateToAlerts}>View All</Button>
    )}
  />
  <Card.Content>
    {/* ... existing alert content ... */}
  </Card.Content>
</Card>
```

**UPDATE navigateToAlerts function:**
```javascript
const navigateToAlerts = () => {
  // Navigate to the new comprehensive alerts screen
  navigation.navigate('AlertList');
};
```

---

## Step 8: Update AppNavigator.js

### File: `D:\Documents\muktsarNgo\app\muktsarngo\src\navigation\AppNavigator.js`

**ADD THIS IMPORT:**
```javascript
import AlertDetailScreen from '../screens/AlertDetailScreen';
```

**ADD THIS SCREEN (after AlertListScreen):**
```javascript
<Stack.Screen
  name="AlertDetail"
  component={AlertDetailScreen}
  options={{
    headerShown: false,
    title: 'Alert Details',
  }}
/>
```

---

## Step 9: Update AlertListScreen.js

### File: `D:\Documents\muktsarNgo\app\muktsarngo\src\screens\AlertListScreen.js`

This screen needs to be updated to support both donor and admin views with Current/Past tabs.

**See the separate AlertListScreen.js file for the complete updated version.**

---

## API Endpoints Required (Backend)

Make sure your backend supports these endpoints:

### For Donors:
- `GET /api/alerts/current` - Get active alerts
- `GET /api/alerts/past` - Get past/completed alerts
- `POST /api/alerts/:id/accept` - Accept an alert (body: `{ donorId }`)

### For Admins:
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/current` - Get active alerts
- `GET /api/alerts/past` - Get past alerts
- `POST /api/alerts` - Create new alert
- `GET /api/alerts/:id/accepted-donors` - Get list of donors who accepted
- `POST /api/alerts/:id/mark-complete` - Mark alert as completed
- `POST /api/alerts/:id/resolve` - Resolve alert
- `POST /api/alerts/:id/cancel` - Cancel alert

---

## Testing Checklist

### Donor Flow:
- [ ] Can see current alerts
- [ ] Can see past alerts
- [ ] Can tap "I'm Ready to Donate" button
- [ ] Receives confirmation message
- [ ] Alert shows in backend/admin view

### Admin Flow:
- [ ] Can see all alerts (current and past)
- [ ] Can create new alerts
- [ ] Can tap an alert to see details
- [ ] Can see list of donors who accepted
- [ ] Can mark alert as completed
- [ ] Completed alerts move to "Past Alerts"

---

## Summary of Changes

1. ✅ Updated `api.js` with new alert endpoints
2. ✅ Updated `ApiService.js` with new methods
3. ✅ Created `AlertsTabContent.js` component
4. ✅ Created `AlertDetailScreen.js` screen
5. ✅ Updated `AdminDashboardScreen.js` to replace Reports with Alerts
6. ✅ Updated `AlertListScreen.js` for donor/admin views
7. ✅ Updated `AppNavigator.js` with new screen
8. ✅ Verified backend API endpoints

---

## Next Steps

1. Apply all the changes listed above
2. Test the donor flow
3. Test the admin flow
4. Verify backend integration
5. Test edge cases (no alerts, network errors, etc.)

