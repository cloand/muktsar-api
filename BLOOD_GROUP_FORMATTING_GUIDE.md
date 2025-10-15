# Blood Group Formatting Guide for React Native App

## Overview
This guide shows how to display blood groups in user-friendly format (A+, B-, etc.) instead of backend format (A_POSITIVE, B_NEGATIVE, etc.) in your React Native app.

## ✅ Utility Created

**File:** `d:\Documents\muktsarNgo\app\muktsarngo\src\utils\bloodGroupFormatter.js`

This utility provides functions to:
- Convert backend format to display format
- Convert display format back to backend format
- Get blood group options for pickers/dropdowns
- Get color codes for blood groups

## 📋 Usage Examples

### 1. Display Blood Group in Profile/List

```javascript
import { formatBloodGroup } from '../utils/bloodGroupFormatter';

// In your component
const DonorProfile = ({ donor }) => {
  return (
    <View>
      <Text>Name: {donor.name}</Text>
      <Text>Blood Group: {formatBloodGroup(donor.bloodGroup)}</Text>
      {/* Shows "A+" instead of "A_POSITIVE" */}
    </View>
  );
};
```

### 2. Blood Group Picker/Dropdown for Registration

```javascript
import { getBloodGroupOptions } from '../utils/bloodGroupFormatter';
import { Picker } from '@react-native-picker/picker';

const RegistrationForm = () => {
  const [bloodGroup, setBloodGroup] = useState('');
  const bloodGroupOptions = getBloodGroupOptions();

  return (
    <Picker
      selectedValue={bloodGroup}
      onValueChange={(value) => setBloodGroup(value)}
    >
      <Picker.Item label="Select Blood Group" value="" />
      {bloodGroupOptions.map((option) => (
        <Picker.Item 
          key={option.value} 
          label={option.label}  // Shows "A+", "B-", etc.
          value={option.value}  // Sends "A_POSITIVE", "B_NEGATIVE", etc. to backend
        />
      ))}
    </Picker>
  );
};
```

### 3. Blood Group Badge with Color

```javascript
import { formatBloodGroup, getBloodGroupColor } from '../utils/bloodGroupFormatter';

const BloodGroupBadge = ({ bloodGroup }) => {
  return (
    <View 
      style={{
        backgroundColor: getBloodGroupColor(bloodGroup),
        padding: 8,
        borderRadius: 12,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: 'bold' }}>
        {formatBloodGroup(bloodGroup)}
      </Text>
    </View>
  );
};
```

### 4. Filter Donors by Blood Group

```javascript
import { getBloodGroupOptions } from '../utils/bloodGroupFormatter';

const DonorFilter = ({ onFilterChange }) => {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const bloodGroupOptions = getBloodGroupOptions();

  const handleFilterChange = (value) => {
    setSelectedBloodGroup(value);
    // Send backend format to API
    onFilterChange({ bloodGroup: value });
  };

  return (
    <Picker
      selectedValue={selectedBloodGroup}
      onValueChange={handleFilterChange}
    >
      <Picker.Item label="All Blood Groups" value="" />
      {bloodGroupOptions.map((option) => (
        <Picker.Item 
          key={option.value} 
          label={option.label}  // Display format
          value={option.value}  // Backend format
        />
      ))}
    </Picker>
  );
};
```

### 5. Display in FlatList

```javascript
import { formatBloodGroup } from '../utils/bloodGroupFormatter';

const DonorList = ({ donors }) => {
  return (
    <FlatList
      data={donors}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.donorCard}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.bloodGroup}>
            Blood Group: {formatBloodGroup(item.bloodGroup)}
          </Text>
          <Text>{item.phone}</Text>
        </View>
      )}
    />
  );
};
```

## 🎨 Complete Example: Donor Profile Screen

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { formatBloodGroup, getBloodGroupColor } from '../utils/bloodGroupFormatter';

const DonorProfileScreen = ({ route }) => {
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonorProfile();
  }, []);

  const fetchDonorProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.get('http://localhost:3001/api/donors/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDonor(response.data);
    } catch (error) {
      console.error('Error fetching donor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (!donor) {
    return <Text>No donor profile found</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Donor Profile</Text>
      
      <View style={styles.infoCard}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{donor.name}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{donor.email}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{donor.phone}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Blood Group</Text>
        <View 
          style={[
            styles.bloodGroupBadge, 
            { backgroundColor: getBloodGroupColor(donor.bloodGroup) }
          ]}
        >
          <Text style={styles.bloodGroupText}>
            {formatBloodGroup(donor.bloodGroup)}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Gender</Text>
        <Text style={styles.value}>{donor.gender}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Total Donations</Text>
        <Text style={styles.value}>{donor.totalDonations}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  bloodGroupBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  bloodGroupText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DonorProfileScreen;
```

## 🔄 Registration Form Example

```javascript
import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getBloodGroupOptions } from '../utils/bloodGroupFormatter';
import axios from 'axios';

const RegistrationScreen = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    bloodGroup: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: '',
  });

  const bloodGroupOptions = getBloodGroupOptions();

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`,
        // bloodGroup is already in backend format (A_POSITIVE, etc.)
      });
      
      console.log('Registration successful:', response.data);
      // Navigate to home or login screen
    } catch (error) {
      console.error('Registration failed:', error.response?.data);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="First Name"
        value={formData.firstName}
        onChangeText={(text) => setFormData({ ...formData, firstName: text })}
      />
      
      <TextInput
        placeholder="Last Name"
        value={formData.lastName}
        onChangeText={(text) => setFormData({ ...formData, lastName: text })}
      />

      <TextInput
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
      />

      <TextInput
        placeholder="Phone"
        value={formData.phone}
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
      />

      {/* Blood Group Picker - Shows A+, B- but sends A_POSITIVE, B_NEGATIVE */}
      <Picker
        selectedValue={formData.bloodGroup}
        onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
      >
        <Picker.Item label="Select Blood Group" value="" />
        {bloodGroupOptions.map((option) => (
          <Picker.Item 
            key={option.value} 
            label={option.label}  // Shows "A+", "B-", etc.
            value={option.value}  // Sends "A_POSITIVE", "B_NEGATIVE", etc.
          />
        ))}
      </Picker>

      <Button title="Register" onPress={handleRegister} />
    </View>
  );
};

export default RegistrationScreen;
```

## 📝 Key Points

1. **Display Format**: Always use `formatBloodGroup()` when showing blood groups to users
2. **Backend Format**: Always send backend format (A_POSITIVE, etc.) to the API
3. **Pickers**: Use `getBloodGroupOptions()` which provides both formats
4. **Colors**: Use `getBloodGroupColor()` for consistent UI styling
5. **No Breaking Changes**: The backend still receives and stores the same format

## ✅ Benefits

- ✅ User-friendly display (A+ instead of A_POSITIVE)
- ✅ No backend changes required
- ✅ Consistent formatting across the app
- ✅ Easy to maintain and update
- ✅ Color-coded blood groups for better UX

## 🔍 Testing

After implementing, test:
1. Registration form shows "A+", "B-" in picker
2. Profile screen displays formatted blood groups
3. Donor list shows formatted blood groups
4. Backend still receives correct format (A_POSITIVE, etc.)
5. Filtering by blood group works correctly

