# Alerts Tab Implementation - Files and Instructions

## 📁 Files Created

All files have been created in the current workspace. You need to copy them to the React Native app directory.

### 1. AlertsTabContent.js
**Source:** `AlertsTabContent.js` (in current directory)
**Destination:** `D:\Documents\muktsarNgo\app\muktsarngo\src\components\AlertsTabContent.js`

This is the main component that replaces the Reports tab content in AdminDashboardScreen.

### 2. AlertDetailScreen.js
**Source:** `AlertDetailScreen.js` (in current directory)
**Destination:** `D:\Documents\muktsarNgo\app\muktsarngo\src\screens\AlertDetailScreen.js`

This screen shows alert details with list of accepted donors (admin only).

### 3. AlertListScreen_Updated.js
**Source:** `AlertListScreen_Updated.js` (in current directory)
**Destination:** `D:\Documents\muktsarNgo\app\muktsarngo\src\screens\AlertListScreen.js` (REPLACE existing file)

This is the updated AlertListScreen with Current/Past tabs for both donors and admins.

---

## 🔧 Files to Modify

### 1. api.js
**Location:** `D:\Documents\muktsarNgo\app\muktsarngo\src\services\api.js`

**Add to `apiEndpoints` object (around line 150):**
```javascript
// Emergency Alerts - UPDATE THIS SECTION
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

**Add to `apiMethods` object (around line 200):**
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

### 2. ApiService.js
**Location:** `D:\Documents\muktsarNgo\app\muktsarngo\src\services\ApiService.js`

**Add these methods (around line 180):**
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

### 3. AdminDashboardScreen.js
**Location:** `D:\Documents\muktsarNgo\app\muktsarngo\src\screens\AdminDashboardScreen.js`

**Step 1: Add import at the top**
```javascript
import AlertsTabContent from '../components/AlertsTabContent';
```

**Step 2: Update SegmentedButtons (around line 450)**

FIND:
```javascript
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
    value: 'reports',
    label: 'Reports',
    icon: 'chart-line',
  },
]}
```

REPLACE WITH:
```javascript
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
```

**Step 3: Replace tab content rendering (around line 700)**

FIND:
```javascript
{activeTab === 'alerts' && (
  <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
    {/* ... existing alert form ... */}
  </ScrollView>
)}

{activeTab === 'reports' && (
  <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
    {/* ... existing reports content ... */}
  </ScrollView>
)}
```

REPLACE WITH:
```javascript
{activeTab === 'alerts' && (
  <AlertsTabContent 
    user={user} 
    navigation={navigation}
    theme={theme}
  />
)}
```

**Step 4: Remove Reports state (around line 80-90)**

REMOVE:
```javascript
// Reports state
const [reportsSummary, setReportsSummary] = useState(null);
const [reportsLoading, setReportsLoading] = useState(false);
```

**Step 5: Remove loadReportsSummary function (around line 200)**

REMOVE the entire `loadReportsSummary` function.

**Step 6: Update useEffect (around line 100)**

FIND:
```javascript
useEffect(() => {
  if (activeTab === 'donors') {
    loadDonors();
  } else if (activeTab === 'reports') {
    loadReportsSummary();
  }
}, [activeTab]);
```

REPLACE WITH:
```javascript
useEffect(() => {
  if (activeTab === 'donors') {
    loadDonors();
  }
}, [activeTab]);
```

**Step 7: Remove old alert form state and functions**

REMOVE (around line 70-80):
```javascript
const [alertForm, setAlertForm] = useState({
  title: '',
  message: '',
  hospitalName: '',
  hospitalAddress: '',
  contactPerson: '',
  contactPhone: '',
  bloodGroup: 'O_POSITIVE',
  unitsRequired: '1',
  urgency: 'HIGH',
});
const [alertErrors, setAlertErrors] = useState({});
const [sendingAlert, setSendingAlert] = useState(false);
```

REMOVE the `updateAlertForm`, `validateAlertForm`, and `handleSendAlert` functions.

---

### 4. AppNavigator.js
**Location:** `D:\Documents\muktsarNgo\app\muktsarngo\src\navigation\AppNavigator.js`

**Add import:**
```javascript
import AlertDetailScreen from '../screens/AlertDetailScreen';
```

**Add screen (after AlertListScreen):**
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

## 📋 Step-by-Step Implementation

### Step 1: Copy New Files
```powershell
# Copy AlertsTabContent component
Copy-Item "AlertsTabContent.js" "D:\Documents\muktsarNgo\app\muktsarngo\src\components\AlertsTabContent.js"

# Copy AlertDetailScreen
Copy-Item "AlertDetailScreen.js" "D:\Documents\muktsarNgo\app\muktsarngo\src\screens\AlertDetailScreen.js"

# Backup and replace AlertListScreen
Copy-Item "D:\Documents\muktsarNgo\app\muktsarngo\src\screens\AlertListScreen.js" "D:\Documents\muktsarNgo\app\muktsarngo\src\screens\AlertListScreen.js.backup"
Copy-Item "AlertListScreen_Updated.js" "D:\Documents\muktsarNgo\app\muktsarngo\src\screens\AlertListScreen.js"
```

### Step 2: Update api.js
Open `D:\Documents\muktsarNgo\app\muktsarngo\src\services\api.js` and make the changes listed above.

### Step 3: Update ApiService.js
Open `D:\Documents\muktsarNgo\app\muktsarngo\src\services\ApiService.js` and add the new methods.

### Step 4: Update AdminDashboardScreen.js
Open `D:\Documents\muktsarNgo\app\muktsarngo\src\screens\AdminDashboardScreen.js` and make all the changes listed above.

### Step 5: Update AppNavigator.js
Open `D:\Documents\muktsarNgo\app\muktsarngo\src\navigation\AppNavigator.js` and add the new screen.

### Step 6: Verify bloodGroupFormatter utility exists
Make sure `D:\Documents\muktsarNgo\app\muktsarngo\src\utils\bloodGroupFormatter.js` exists (it was created earlier).

---

## 🧪 Testing

### Donor Flow:
1. Login as a donor
2. Navigate to Alerts (from home or menu)
3. See Current Alerts tab
4. Tap "I'm Ready to Donate" on an alert
5. Confirm donation
6. Verify confirmation message
7. Switch to Past Alerts tab
8. Verify past alerts are shown

### Admin Flow:
1. Login as admin
2. Go to Admin Dashboard
3. Click on "Alerts" tab (Reports tab should be gone)
4. See Current Alerts section
5. Tap on an alert to view details
6. See list of donors who accepted
7. Mark alert as complete
8. Verify it moves to Past Alerts
9. Switch to Past Alerts tab
10. Verify completed alerts are shown

---

## 🔌 Backend API Requirements

Your backend must support these endpoints:

### For All Users:
- `GET /api/alerts/current` - Get active alerts
- `GET /api/alerts/past` - Get past/completed alerts

### For Donors:
- `POST /api/alerts/:id/accept` - Accept an alert
  - Body: `{ "donorId": "donor-uuid" }`
  - Response: `{ "success": true, "message": "Alert accepted" }`

### For Admins:
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create new alert
- `GET /api/alerts/:id/accepted-donors` - Get list of donors who accepted
  - Response: `{ "data": [{ "id": "...", "name": "...", "email": "...", "phone": "...", "bloodGroup": "...", "city": "...", "state": "...", "isEligible": true }] }`
- `POST /api/alerts/:id/mark-complete` - Mark alert as completed
  - Response: `{ "success": true, "message": "Alert marked as complete" }`

---

## ✅ Checklist

- [ ] Copy AlertsTabContent.js to components folder
- [ ] Copy AlertDetailScreen.js to screens folder
- [ ] Replace AlertListScreen.js with updated version
- [ ] Update api.js with new endpoints
- [ ] Update ApiService.js with new methods
- [ ] Update AdminDashboardScreen.js (remove Reports, add Alerts)
- [ ] Update AppNavigator.js with AlertDetailScreen
- [ ] Verify bloodGroupFormatter.js exists
- [ ] Test donor flow
- [ ] Test admin flow
- [ ] Verify backend API endpoints

---

## 🎉 Result

After implementation:
- ✅ Reports tab is completely removed
- ✅ Alerts tab shows Current/Past alerts
- ✅ Donors can accept alerts
- ✅ Admins can view accepted donors
- ✅ Admins can mark alerts as complete
- ✅ Clean, role-based UI for both donors and admins

