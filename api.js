import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { getBaseURL, APP_CONFIG, ENDPOINTS, getFullURL } from '../config/config';

// Create axios instance with base configuration from centralized config
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: APP_CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from SecureStore using centralized config
      const token = await SecureStore.getItemAsync(APP_CONFIG.TOKEN_STORAGE_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log request for debugging (remove in production)
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    // Log successful response for debugging (remove in production)
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const { response, config } = error;
    
    // Handle different error scenarios
    if (response) {
      const { status, data } = response;
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          console.log('Unauthorized access - redirecting to login');
          await handleUnauthorized();
          break;
          
        case 403:
          // Forbidden - insufficient permissions
          Alert.alert(
            'Access Denied',
            'You do not have permission to perform this action.',
            [{ text: 'OK' }]
          );
          break;
          
        case 404:
          // Not found
          Alert.alert(
            'Not Found',
            'The requested resource was not found.',
            [{ text: 'OK' }]
          );
          break;
          
        case 422:
          // Validation error
          const validationMessage = data?.message || 'Validation failed';
          Alert.alert(
            'Validation Error',
            validationMessage,
            [{ text: 'OK' }]
          );
          break;
          
        case 500:
          // Server error
          Alert.alert(
            'Server Error',
            'An internal server error occurred. Please try again later.',
            [{ text: 'OK' }]
          );
          break;
          
        default:
          // Other errors
          const errorMessage = data?.message || `Request failed with status ${status}`;
          Alert.alert(
            'Error',
            errorMessage,
            [{ text: 'OK' }]
          );
      }
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      Alert.alert(
        'Request Timeout',
        'The request took too long to complete. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } else if (error.message === 'Network Error') {
      // Network error
      Alert.alert(
        'Network Error',
        'Unable to connect to the server. Please check your internet connection.',
        [{ text: 'OK' }]
      );
    } else {
      // Unknown error
      console.error('Unknown API error:', error);
      Alert.alert(
        'Unexpected Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    }
    
    return Promise.reject(error);
  }
);

// Handle unauthorized access
const handleUnauthorized = async () => {
  try {
    // Clear stored auth data from SecureStore
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('user_data');

    // Show alert and redirect to login
    Alert.alert(
      'Session Expired',
      'Your session has expired. Please log in again.',
      [
        {
          text: 'OK',
          onPress: () => {
            // The AuthContext will handle the navigation
            // by detecting the cleared auth state
            console.log('Session cleared - AuthContext will handle navigation');
          }
        }
      ]
    );
  } catch (error) {
    console.error('Error handling unauthorized access:', error);
  }
};

// API endpoint helpers - using centralized config
export const apiEndpoints = {
  // Authentication
  login: ENDPOINTS.LOGIN,
  logout: ENDPOINTS.LOGOUT,
  register: ENDPOINTS.REGISTER,
  registerDonor: ENDPOINTS.REGISTER,
  refreshToken: '/auth/refresh',
  profile: ENDPOINTS.PROFILE,

  // Donors
  donors: ENDPOINTS.DONORS,
  donorProfile: ENDPOINTS.DONOR_PROFILE,
  donorById: (id) => `${ENDPOINTS.DONORS}/${id}`,
  eligibleDonors: `${ENDPOINTS.DONORS}/eligible`,
  donorsByBloodGroup: (bloodGroup) => `${ENDPOINTS.DONORS}/blood-group/${bloodGroup}`,
  donorStatistics: ENDPOINTS.DONOR_STATISTICS,

  // Donations (keeping for compatibility)
  donations: '/donations',
  donationById: (id) => `/donations/${id}`,
  
  // Emergency Alerts
  alerts: ENDPOINTS.ALERTS,
  alertById: (id) => `${ENDPOINTS.ALERTS}/${id}`,
  activeAlerts: ENDPOINTS.ACTIVE_ALERTS,
  currentAlerts: `${ENDPOINTS.ALERTS}/current`,
  pastAlerts: `${ENDPOINTS.ALERTS}/past`,
  acceptAlert: (id) => `${ENDPOINTS.ALERTS}/${id}/accept`,
  acceptedDonors: (id) => `${ENDPOINTS.ALERTS}/${id}/accepted-donors`,
  markComplete: (id) => `${ENDPOINTS.ALERTS}/${id}/mark-complete`,
  resolveAlert: (id) => `/alerts/${id}/resolve`,
  cancelAlert: (id) => `/alerts/${id}/cancel`,

  // Reports
  reportsSummary: ENDPOINTS.REPORTS_SUMMARY,
  donorStatistics: ENDPOINTS.REPORTS_DONORS,
  alertStatistics: ENDPOINTS.REPORTS_ALERTS,

  // Users
  users: '/users',
  userById: (id) => `/users/${id}`,
  profile: '/users/profile',
  
  // FCM Tokens
  registerToken: '/notifications/register-token',
  unregisterToken: '/notifications/unregister-token',
};

// Convenience methods for common API operations
export const apiMethods = {
  // Authentication methods
  login: (credentials) => api.post(apiEndpoints.login, credentials),
  logout: () => api.post(apiEndpoints.logout),
  register: (userData) => api.post(apiEndpoints.register, userData),
  registerDonor: (donorData) => api.post(apiEndpoints.registerDonor, donorData),
  
  // Donor methods
  getDonors: (params) => api.get(apiEndpoints.donors, { params }),
  getDonorById: (id) => api.get(apiEndpoints.donorById(id)),
  createDonor: (donorData) => api.post(apiEndpoints.donors, donorData),
  updateDonor: (id, donorData) => api.patch(apiEndpoints.donorById(id), donorData),
  deleteDonor: (id) => api.delete(apiEndpoints.donorById(id)),
  getEligibleDonors: () => api.get(apiEndpoints.eligibleDonors),
  getDonorsByBloodGroup: (bloodGroup) => api.get(apiEndpoints.donorsByBloodGroup(bloodGroup)),
  getDonorStatistics: () => api.get(apiEndpoints.donorStatistics),
  
  // Donation methods
  getDonations: (params) => api.get(apiEndpoints.donations, { params }),
  createDonation: (donationData) => api.post(apiEndpoints.donations, donationData),
  
  // Emergency alert methods
  getAlerts: (params) => api.get(apiEndpoints.alerts, { params }),
  createAlert: (alertData) => api.post(apiEndpoints.alerts, alertData),
  getActiveAlerts: () => api.get(apiEndpoints.activeAlerts),
  getCurrentAlerts: () => api.get(apiEndpoints.currentAlerts),
  getPastAlerts: () => api.get(apiEndpoints.pastAlerts),
  acceptAlert: (alertId, donorId) => api.post(apiEndpoints.acceptAlert(alertId), { donorId }),
  getAcceptedDonors: (alertId) => api.get(apiEndpoints.acceptedDonors(alertId)),
  markAlertComplete: (alertId) => api.post(apiEndpoints.markComplete(alertId)),
  resolveAlert: (id) => api.patch(apiEndpoints.resolveAlert(id)),
  cancelAlert: (id) => api.patch(apiEndpoints.cancelAlert(id)),

  // Reports methods
  getReportsSummary: () => api.get(apiEndpoints.reportsSummary),
  getDonorStatistics: () => api.get(apiEndpoints.donorStatistics),
  getAlertStatistics: () => api.get(apiEndpoints.alertStatistics),

  // Security test methods
  getDonors: () => api.get('/donors'),
  getDonorProfile: () => api.get('/donors/me'),
  getUserProfile: () => api.get('/auth/profile'),
  getAlerts: () => api.get('/alerts'),
  createAlert: (alertData) => api.post('/alerts', alertData),

  // User methods
  getProfile: () => api.get(apiEndpoints.donorProfile),
  updateProfile: (userData) => api.put(apiEndpoints.profile, userData),

  // Notification methods
  registerFCMToken: (tokenData) => api.post(apiEndpoints.registerToken, tokenData),
  unregisterFCMToken: (tokenData) => api.post(apiEndpoints.unregisterToken, tokenData),
};

// Development mode fallback for when backend is not available
export const isDevelopmentMode = __DEV__ && process.env.NODE_ENV === 'development';

// Mock API responses for development
export const mockResponses = {
  donors: {
    data: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91-9876543210',
        bloodGroup: 'O_POSITIVE',
        gender: 'MALE',
        dateOfBirth: '1990-01-15T00:00:00.000Z',
        address: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        lastDonationDate: '2024-01-15T00:00:00.000Z',
        totalDonations: 5,
        isEligible: true,
        isActive: true,
        emergencyContact: '+91-9876543211',
        medicalConditions: null,
        notes: 'Regular donor',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+91-9876543212',
        bloodGroup: 'A_POSITIVE',
        gender: 'FEMALE',
        dateOfBirth: '1992-03-20T00:00:00.000Z',
        address: '456 Oak Avenue',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        lastDonationDate: '2024-09-01T00:00:00.000Z',
        totalDonations: 3,
        isEligible: false,
        isActive: true,
        emergencyContact: '+91-9876543213',
        medicalConditions: null,
        notes: 'Needs 120-day gap',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-09-01T00:00:00.000Z',
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    },
  },
  alerts: {
    data: [
      {
        id: '1',
        title: 'Urgent Blood Needed',
        message: 'O+ blood urgently needed at Civil Hospital Muktsar',
        hospitalName: 'Civil Hospital Muktsar',
        bloodGroup: 'O_POSITIVE',
        unitsRequired: 3,
        urgency: 'HIGH',
        status: 'ACTIVE',
        contactNumber: '+91-9876543210',
        additionalNotes: 'Patient in critical condition',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        createdBy: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Blood Donation Required',
        message: 'A+ blood needed at Government Hospital',
        hospitalName: 'Government Hospital Muktsar',
        bloodGroup: 'A_POSITIVE',
        unitsRequired: 2,
        urgency: 'MEDIUM',
        status: 'ACTIVE',
        contactNumber: '+91-9876543211',
        additionalNotes: 'Surgery scheduled for tomorrow',
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
        createdBy: '1',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    },
  },
  login: {
    access_token: 'mock-jwt-token',
    user: {
      id: '1',
      email: 'admin@muktsarngo.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
    },
  },
};

export default api;

// Alerts API object for component compatibility
export const alertsAPI = {
  getAll: () => api.get(apiEndpoints.alerts),
  getActive: () => api.get(apiEndpoints.activeAlerts),
  getPast: () => api.get(apiEndpoints.pastAlerts),
  getActiveForDonor: () => api.get('/alerts/active/for-donor'),
  getById: (id) => api.get(apiEndpoints.alertById(id)),
  create: (data) => api.post(apiEndpoints.alerts, data),
  update: (id, data) => api.patch(apiEndpoints.alertById(id), data),
  delete: (id) => api.delete(apiEndpoints.alertById(id)),
  accept: (id) => api.post(apiEndpoints.acceptAlert(id)),
  markComplete: (id) => api.post(apiEndpoints.markComplete(id)),
  getAcceptedDonors: (id) => api.get(apiEndpoints.acceptedDonors(id)),
};
