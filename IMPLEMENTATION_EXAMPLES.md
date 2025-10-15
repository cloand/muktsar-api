# Blood Group Formatting - Implementation Examples

## 📦 Files Created

### Utilities
- ✅ `src/utils/bloodGroupFormatter.js` - JavaScript utility functions
- ✅ `src/utils/bloodGroupFormatter.ts` - TypeScript utility functions

### Components
- ✅ `src/components/BloodGroupBadge.js` - Reusable badge component
- ✅ `src/components/BloodGroupPicker.js` - Reusable picker component

---

## 🚀 Usage Examples

### Example 1: Using BloodGroupBadge Component

```javascript
import React from 'react';
import { View, Text } from 'react-native';
import BloodGroupBadge from '../components/BloodGroupBadge';

const DonorCard = ({ donor }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{donor.name}</Text>
      <Text style={styles.email}>{donor.email}</Text>
      
      {/* Small badge */}
      <BloodGroupBadge bloodGroup={donor.bloodGroup} size="small" />
      
      {/* Medium badge (default) */}
      <BloodGroupBadge bloodGroup={donor.bloodGroup} />
      
      {/* Large badge */}
      <BloodGroupBadge bloodGroup={donor.bloodGroup} size="large" />
    </View>
  );
};
```

### Example 2: Using BloodGroupPicker Component

```javascript
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import BloodGroupPicker from '../components/BloodGroupPicker';

const RegistrationForm = () => {
  const [bloodGroup, setBloodGroup] = useState('');

  const handleSubmit = async () => {
    // bloodGroup is already in backend format (A_POSITIVE, etc.)
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...otherFormData,
        bloodGroup, // Sends "A_POSITIVE", "B_NEGATIVE", etc.
      }),
    });
  };

  return (
    <View>
      <BloodGroupPicker
        label="Blood Group"
        required={true}
        value={bloodGroup}
        onValueChange={setBloodGroup}
        placeholder="Select your blood group"
      />
      
      <Button title="Register" onPress={handleSubmit} />
    </View>
  );
};
```

### Example 3: Donor Profile Screen (Complete)

```javascript
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BloodGroupBadge from '../components/BloodGroupBadge';

const DonorProfileScreen = () => {
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonorProfile();
  }, []);

  const fetchDonorProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.get(
        'http://localhost:3001/api/donors/me',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDonor(response.data);
    } catch (error) {
      console.error('Error fetching donor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (!donor) {
    return (
      <View style={styles.centered}>
        <Text>No donor profile found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Donor Profile</Text>
      </View>

      <View style={styles.section}>
        <InfoRow label="Name" value={donor.name} />
        <InfoRow label="Email" value={donor.email} />
        <InfoRow label="Phone" value={donor.phone} />
        
        {/* Blood Group with Badge */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Blood Group</Text>
          <BloodGroupBadge bloodGroup={donor.bloodGroup} size="medium" />
        </View>
        
        <InfoRow label="Gender" value={donor.gender} />
        <InfoRow label="City" value={donor.city} />
        <InfoRow label="State" value={donor.state} />
        <InfoRow 
          label="Total Donations" 
          value={donor.totalDonations?.toString() || '0'} 
        />
        <InfoRow 
          label="Eligible to Donate" 
          value={donor.isEligible ? 'Yes' : 'No'} 
        />
      </View>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
});

export default DonorProfileScreen;
```

### Example 4: Donor List with Blood Group Badges

```javascript
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import BloodGroupBadge from '../components/BloodGroupBadge';

const DonorListScreen = () => {
  const [donors, setDonors] = useState([]);

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    // Fetch donors from API
    const response = await fetch('http://localhost:3001/api/donors');
    const data = await response.json();
    setDonors(data.data);
  };

  const renderDonorCard = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.donorName}>{item.name}</Text>
        <BloodGroupBadge bloodGroup={item.bloodGroup} size="small" />
      </View>
      
      <Text style={styles.donorInfo}>{item.email}</Text>
      <Text style={styles.donorInfo}>{item.phone}</Text>
      
      <View style={styles.cardFooter}>
        <Text style={styles.donorCity}>{item.city}, {item.state}</Text>
        <Text style={styles.donorDonations}>
          {item.totalDonations} donations
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={donors}
        keyExtractor={(item) => item.id}
        renderItem={renderDonorCard}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  donorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  donorInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  donorCity: {
    fontSize: 12,
    color: '#999',
  },
  donorDonations: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
});

export default DonorListScreen;
```

### Example 5: Registration Form (Complete)

```javascript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import BloodGroupPicker from '../components/BloodGroupPicker';
import axios from 'axios';

const RegistrationScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    bloodGroup: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: '',
  });

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleRegister = async () => {
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.password || !formData.bloodGroup) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3001/api/auth/register',
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          bloodGroup: formData.bloodGroup, // Already in backend format
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          emergencyContact: formData.emergencyContact,
        }
      );

      Alert.alert('Success', 'Registration successful!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Donor Registration</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name *"
        value={formData.firstName}
        onChangeText={(text) => updateField('firstName', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name *"
        value={formData.lastName}
        onChangeText={(text) => updateField('lastName', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Email *"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={(text) => updateField('email', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone *"
        keyboardType="phone-pad"
        value={formData.phone}
        onChangeText={(text) => updateField('phone', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Password *"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => updateField('password', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password *"
        secureTextEntry
        value={formData.confirmPassword}
        onChangeText={(text) => updateField('confirmPassword', text)}
      />

      {/* Blood Group Picker - Shows A+, B- but sends A_POSITIVE, B_NEGATIVE */}
      <BloodGroupPicker
        label="Blood Group"
        required={true}
        value={formData.bloodGroup}
        onValueChange={(value) => updateField('bloodGroup', value)}
      />

      {/* Gender Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Gender *</Text>
        <Picker
          selectedValue={formData.gender}
          onValueChange={(value) => updateField('gender', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="MALE" />
          <Picker.Item label="Female" value="FEMALE" />
          <Picker.Item label="Other" value="OTHER" />
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Date of Birth (YYYY-MM-DD) *"
        value={formData.dateOfBirth}
        onChangeText={(text) => updateField('dateOfBirth', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Address"
        value={formData.address}
        onChangeText={(text) => updateField('address', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="City"
        value={formData.city}
        onChangeText={(text) => updateField('city', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="State"
        value={formData.state}
        onChangeText={(text) => updateField('state', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Pincode"
        keyboardType="numeric"
        value={formData.pincode}
        onChangeText={(text) => updateField('pincode', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Emergency Contact"
        keyboardType="phone-pad"
        value={formData.emergencyContact}
        onChangeText={(text) => updateField('emergencyContact', text)}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  picker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RegistrationScreen;
```

---

## ✅ Summary

All examples show:
- ✅ User sees "A+", "B-", etc. in the UI
- ✅ Backend receives "A_POSITIVE", "B_NEGATIVE", etc.
- ✅ No changes needed to API
- ✅ Consistent formatting across the app
- ✅ Reusable components for easy implementation

