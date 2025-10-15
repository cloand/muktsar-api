import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  HelperText,
  Chip,
  useTheme,
  Avatar,
  SegmentedButtons,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { commonStyles } from '../theme/theme';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showDemoCredentials, setShowDemoCredentials] = useState(true);
  const [userType, setUserType] = useState('donor'); // 'donor' or 'admin'

  // Get auth context and theme
  const { login, loading, error, clearError, isAuthenticated, user } = useAuth();
  const theme = useTheme();

  // Navigate based on user role if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN' || user.role === 'admin') {
        navigation.replace('AdminDashboard');
      } else {
        navigation.replace('Home');
      }
    }
  }, [isAuthenticated, user, navigation]);

  // Clear errors when user starts typing
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [phone, password]);

  // Validate phone format
  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  // Handle login
  const handleLogin = async () => {
    // Clear previous errors
    setPhoneError('');
    setPasswordError('');
    clearError();

    // Validation
    let hasErrors = false;

    if (!phone.trim()) {
      setPhoneError('Phone number is required');
      hasErrors = true;
    } else if (!validatePhone(phone)) {
      setPhoneError('Please enter a valid phone number (e.g., +919876543210)');
      hasErrors = true;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      hasErrors = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      const response = await login(phone.trim(), password);
      if (response.user) {
        const userRole = response.user.role;
        const isAdmin = userRole === 'ADMIN' || userRole === 'admin';

        // Check if user type matches selected type
        if (userType === 'admin' && !isAdmin) {
          Alert.alert(
            'Access Denied',
            'This account does not have admin privileges. Please select "Donor" or use an admin account.',
            [{ text: 'OK' }]
          );
          return;
        }

        if (userType === 'donor' && isAdmin) {
          Alert.alert(
            'Wrong Login Type',
            'This is an admin account. Please select "Admin" to continue.',
            [{ text: 'OK' }]
          );
          return;
        }

        Alert.alert(
          'Login Successful',
          `Welcome back, ${response.user.firstName || response.user.name}!`,
          [
            {
              text: 'Continue',
              onPress: () => {
                if (isAdmin) {
                  navigation.replace('AdminDashboard');
                } else {
                  navigation.replace('Home');
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error.message || 'Invalid email or password. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Fill demo credentials
  const fillDemoCredentials = (demoUserType) => {
    switch (demoUserType) {
      case 'admin':
        setPhone('+919876543210');
        setPassword('password');
        setUserType('admin');
        break;
      case 'donor':
        setPhone('+919876543211');
        setPassword('donor123');
        setUserType('donor');
        break;
    }
    setShowDemoCredentials(false);
  };

  return (
    <SafeAreaView style={[commonStyles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={[commonStyles.content, styles.content]}>
        {/* Header with NGO Logo */}
        <View style={styles.header}>
          <Avatar.Icon
            size={80}
            icon="heart"
            style={[styles.logo, { backgroundColor: theme.colors.primary }]}
          />
          <Title style={[styles.appName, { color: theme.colors.primary }]}>MuktsarNGO</Title>
          <Paragraph style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}>Blood Donation Management</Paragraph>
        </View>

        <Card style={[commonStyles.card, styles.card]}>
          <Card.Content style={commonStyles.cardContent}>
            <Title style={[styles.title, { color: theme.colors.onSurface }]}>Login to Continue</Title>

            {/* User Type Selector */}
            <View style={styles.userTypeSection}>
              <Text style={[styles.sectionLabel, { color: theme.colors.onSurface }]}>I am a:</Text>
              <SegmentedButtons
                value={userType}
                onValueChange={setUserType}
                buttons={[
                  {
                    value: 'donor',
                    label: 'Donor',
                    icon: 'account-heart',
                  },
                  {
                    value: 'admin',
                    label: 'Admin',
                    icon: 'account-supervisor',
                  },
                ]}
                style={styles.segmentedButtons}
              />
            </View>

            {/* Demo Credentials */}
            {showDemoCredentials && (
              <View style={styles.demoSection}>
                <Text style={[styles.demoTitle, { color: theme.colors.onSurfaceVariant }]}>Demo Credentials:</Text>
                <View style={styles.demoChips}>
                  <Chip
                    mode="outlined"
                    onPress={() => fillDemoCredentials('admin')}
                    style={[styles.demoChip, { borderColor: theme.colors.primary }]}
                    icon="account-supervisor"
                    textStyle={{ color: theme.colors.primary }}
                  >
                    Admin
                  </Chip>
                  <Chip
                    mode="outlined"
                    onPress={() => fillDemoCredentials('donor')}
                    style={[styles.demoChip, { borderColor: theme.colors.primary }]}
                    icon="account-heart"
                    textStyle={{ color: theme.colors.primary }}
                  >
                    Donor
                  </Chip>
                </View>
              </View>
            )}

            <View style={styles.form}>
              <TextInput
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                mode="outlined"
                style={[commonStyles.textInput, styles.input]}
                error={!!phoneError}
                disabled={loading}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                placeholder="+919876543210"
              />
              {phoneError ? (
                <HelperText type="error" visible={!!phoneError}>
                  {phoneError}
                </HelperText>
              ) : null}

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                mode="outlined"
                style={[commonStyles.textInput, styles.input]}
                error={!!passwordError}
                disabled={loading}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
              />
              {passwordError ? (
                <HelperText type="error" visible={!!passwordError}>
                  {passwordError}
                </HelperText>
              ) : null}

              {/* Global error message */}
              {error && (
                <HelperText type="error" visible={!!error} style={styles.errorText}>
                  {error}
                </HelperText>
              )}

              <Button
                mode="contained"
                onPress={handleLogin}
                style={[commonStyles.primaryButton, styles.button]}
                contentStyle={commonStyles.buttonContent}
                disabled={loading}
                loading={loading}
                buttonColor={theme.colors.primary}
              >
                {loading ? 'Signing In...' : 'Login'}
              </Button>

              {/* Register as Donor Button */}
              {userType === 'donor' && (
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('DonorRegistration')}
                  style={[commonStyles.outlineButton, styles.registerButton]}
                  contentStyle={commonStyles.buttonContent}
                  textColor={theme.colors.primary}
                  disabled={loading}
                >
                  New Donor? Register Here
                </Button>
              )}

              {/* Show demo credentials toggle */}
              {!showDemoCredentials && (
                <Button
                  mode="text"
                  onPress={() => setShowDemoCredentials(true)}
                  style={styles.demoToggle}
                  textColor={theme.colors.primary}
                >
                  Show Demo Credentials
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32, // theme.spacing.xl
  },
  logo: {
    marginBottom: 16, // theme.spacing.md
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8, // theme.spacing.sm
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24, // theme.spacing.lg
  },
  userTypeSection: {
    marginBottom: 24, // theme.spacing.lg
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12, // theme.spacing.sm + 4
    textAlign: 'center',
  },
  segmentedButtons: {
    marginBottom: 8, // theme.spacing.sm
  },
  demoSection: {
    marginBottom: 24, // theme.spacing.lg
    padding: 16, // theme.spacing.md
    backgroundColor: '#FFF5F5', // theme.colors.surfaceVariant
    borderRadius: 12, // theme.borderRadius.medium
    borderWidth: 1,
    borderColor: '#FFCDD2', // theme.colors.secondary
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12, // theme.spacing.sm + 4
    textAlign: 'center',
  },
  demoChips: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 8, // theme.spacing.sm
  },
  demoChip: {
    marginBottom: 8, // theme.spacing.sm
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 8, // theme.spacing.sm
  },
  errorText: {
    marginBottom: 16, // theme.spacing.md
    textAlign: 'center',
  },
  button: {
    marginTop: 24, // theme.spacing.lg
  },
  registerButton: {
    marginTop: 16, // theme.spacing.md
  },
  demoToggle: {
    marginTop: 16, // theme.spacing.md
  },
});

export default LoginScreen;
