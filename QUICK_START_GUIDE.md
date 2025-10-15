# Alerts Tab - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Copy Files (1 minute)

Run the PowerShell script:
```powershell
cd c:\Users\Dell\Documents\muktsarngo\muktsar-admin-panel
.\copy-alerts-files.ps1
```

This will copy:
- ✅ AlertsTabContent.js → components/
- ✅ AlertDetailScreen.js → screens/
- ✅ AlertListScreen.js (updated) → screens/

---

### Step 2: Update api.js (2 minutes)

**File:** `D:\Documents\muktsarNgo\app\muktsarngo\src\services\api.js`

**Find the `apiEndpoints` object and ADD these lines:**
```javascript
// Around line 165, in the Emergency Alerts section
pastAlerts: `${ENDPOINTS.ALERTS}/past`,
currentAlerts: `${ENDPOINTS.ALERTS}/current`,
acceptAlert: (id) => `${ENDPOINTS.ALERTS}/${id}/accept`,
acceptedDonors: (id) => `${ENDPOINTS.ALERTS}/${id}/accepted-donors`,
markComplete: (id) => `${ENDPOINTS.ALERTS}/${id}/mark-complete`,
```

**Find the `apiMethods` object and ADD these lines:**
```javascript
// Around line 210, in the Emergency alert methods section
getCurrentAlerts: () => api.get(apiEndpoints.currentAlerts),
getPastAlerts: () => api.get(apiEndpoints.pastAlerts),
acceptAlert: (alertId, donorId) => api.post(apiEndpoints.acceptAlert(alertId), { donorId }),
getAcceptedDonors: (alertId) => api.get(apiEndpoints.acceptedDonors(alertId)),
markAlertComplete: (alertId) => api.post(apiEndpoints.markComplete(alertId)),
```

---

### Step 3: Update ApiService.js (1 minute)

**File:** `D:\Documents\muktsarNgo\app\muktsarngo\src\services\ApiService.js`

**Add these methods (around line 180):**
```javascript
// Alerts API - NEW METHODS
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

### Step 4: Update AdminDashboardScreen.js (1 minute)

**File:** `D:\Documents\muktsarNgo\app\muktsarngo\src\screens\AdminDashboardScreen.js`

**4.1: Add import at the top:**
```javascript
import AlertsTabContent from '../components/AlertsTabContent';
```

**4.2: Find the SegmentedButtons (around line 450) and REMOVE the Reports button:**
```javascript
// BEFORE:
buttons={[
  { value: 'donors', label: 'Donors', icon: 'account-group' },
  { value: 'alerts', label: 'Alerts', icon: 'alert' },
  { value: 'reports', label: 'Reports', icon: 'chart-line' },  // REMOVE THIS
]}

// AFTER:
buttons={[
  { value: 'donors', label: 'Donors', icon: 'account-group' },
  { value: 'alerts', label: 'Alerts', icon: 'bell-alert' },
]}
```

**4.3: Find the tab content rendering (around line 700) and REPLACE:**
```javascript
// REMOVE ALL OF THIS:
{activeTab === 'alerts' && (
  <ScrollView style={styles.tabContent}>
    {/* ... old alert form ... */}
  </ScrollView>
)}

{activeTab === 'reports' && (
  <ScrollView style={styles.tabContent}>
    {/* ... reports content ... */}
  </ScrollView>
)}

// REPLACE WITH THIS:
{activeTab === 'alerts' && (
  <AlertsTabContent 
    user={user} 
    navigation={navigation}
    theme={theme}
  />
)}
```

**4.4: Remove old state (around line 80):**
```javascript
// REMOVE THESE:
const [reportsSummary, setReportsSummary] = useState(null);
const [reportsLoading, setReportsLoading] = useState(false);
const [alertForm, setAlertForm] = useState({ ... });
const [alertErrors, setAlertErrors] = useState({});
const [sendingAlert, setSendingAlert] = useState(false);
```

**4.5: Update useEffect (around line 100):**
```javascript
// BEFORE:
useEffect(() => {
  if (activeTab === 'donors') {
    loadDonors();
  } else if (activeTab === 'reports') {
    loadReportsSummary();
  }
}, [activeTab]);

// AFTER:
useEffect(() => {
  if (activeTab === 'donors') {
    loadDonors();
  }
}, [activeTab]);
```

**4.6: Remove these functions:**
- `loadReportsSummary()`
- `updateAlertForm()`
- `validateAlertForm()`
- `handleSendAlert()`

---

### Step 5: Update AppNavigator.js (30 seconds)

**File:** `D:\Documents\muktsarNgo\app\muktsarngo\src\navigation\AppNavigator.js`

**5.1: Add import:**
```javascript
import AlertDetailScreen from '../screens/AlertDetailScreen';
```

**5.2: Add screen (after AlertListScreen):**
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

## ✅ Done!

Your app now has:
- ✅ Alerts tab instead of Reports tab
- ✅ Current/Past alerts for donors and admins
- ✅ Donors can accept alerts
- ✅ Admins can view accepted donors
- ✅ Admins can mark alerts as complete

---

## 🧪 Quick Test

### Test as Donor:
1. Login as donor
2. Navigate to Alerts
3. See current alerts
4. Tap "I'm Ready to Donate"
5. Confirm and see success message

### Test as Admin:
1. Login as admin
2. Go to Admin Dashboard
3. Click Alerts tab (Reports should be gone)
4. See current alerts
5. Tap an alert
6. See accepted donors
7. Mark as complete

---

## 🆘 Troubleshooting

### "Cannot find module AlertsTabContent"
- Make sure you copied AlertsTabContent.js to `src/components/`
- Check the import path in AdminDashboardScreen.js

### "Cannot find module AlertDetailScreen"
- Make sure you copied AlertDetailScreen.js to `src/screens/`
- Check the import in AppNavigator.js

### "formatBloodGroup is not defined"
- Make sure bloodGroupFormatter.js exists in `src/utils/`
- This file was created earlier in the conversation

### API errors
- Check that your backend has the required endpoints
- See IMPLEMENTATION_SUMMARY.md for backend API requirements

---

## 📚 Full Documentation

For detailed information, see:
- **IMPLEMENTATION_SUMMARY.md** - Complete overview
- **ALERTS_TAB_FILES_AND_INSTRUCTIONS.md** - Detailed instructions
- **ALERTS_TAB_IMPLEMENTATION_GUIDE.md** - Step-by-step guide

---

## 🎉 You're All Set!

The Alerts tab is now ready to use. Test it thoroughly and enjoy the new functionality!

