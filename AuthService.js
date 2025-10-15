import * as SecureStore from 'expo-secure-store';
import { apiMethods, mockResponses } from './api';
import ApiService from './ApiService';
import { APP_CONFIG, isDevelopment, isAdmin, isDonor } from '../config/config';

// Development mode flag from centralized config
const isDevelopmentMode = isDevelopment();

class AuthService {
  constructor() {
    this.TOKEN_KEY = APP_CONFIG.TOKEN_STORAGE_KEY;
    this.USER_KEY = APP_CONFIG.USER_STORAGE_KEY;
  }

  // Login user
  async login(phone, password) {
    try {
      console.log('stsrta login')
      // Use centralized API method for NestJS authentication
      const response = await apiMethods.login({ phone, password });

      // Handle NestJS response format: { access_token, user }
      if (response.data?.access_token && response.data?.user) {
        await this.setToken(response.data.access_token);
        await this.setUser(response.data.user);

        console.log('Login successful:', {
          user: response.data.user.phone,
          role: response.data.user.role
        });

        return {
          token: response.data.access_token,
          user: response.data.user
        };
      }

      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Login error:', error);
      console.log(error,'dbdhjdbdj')
      // Fallback to mock in development if API fails
      if (isDevelopmentMode) {
        console.log('API login failed, trying mock authentication...');
        const mockResponse = await this.mockLogin(phone, password);
        if (mockResponse) {
          await this.setToken(mockResponse.token);
          await this.setUser(mockResponse.user);
          return mockResponse;
        }
      }

      // Re-throw the original error
      throw error;
    }
  }

  // Register donor
  async registerDonor(donorData) {
    try {
      console.log(donorData,'donorData')
      // Use centralized API method for donor registration
      const response = await apiMethods.registerDonor(donorData);
      console.log(response,'response');
      // Handle NestJS response format: { access_token, user, donor }
      if (response.data?.access_token && response.data?.user) {
        await this.setToken(response.data.access_token);
        await this.setUser(response.data.user);

        console.log('Donor registration successful:', {
          user: response.data.user.email,
          role: response.data.user.role
        });

        return {
          token: response.data.access_token,
          user: response.data.user,
          donor: response.data.donor
        };
      }

      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Donor registration error:', error);
      throw error;
    }
  }

  // Mock login for demo purposes
  async mockLogin(phone, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock user credentials
    const mockUsers = [
      {
        phone: '+919876543210',
        password: 'password',
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@muktsarngo.com',
          phone: '+919876543210',
          role: 'admin',
          permissions: ['read', 'write', 'delete'],
          avatar: null,
          lastLogin: new Date().toISOString(),
        },
        token: 'mock_jwt_token_admin_123456789',
      },
      {
        phone: '+919876543211',
        password: 'volunteer123',
        user: {
          id: '2',
          name: 'Volunteer User',
          email: 'volunteer@muktsarngo.com',
          phone: '+919876543211',
          role: 'volunteer',
          permissions: ['read', 'write'],
          avatar: null,
          lastLogin: new Date().toISOString(),
        },
        token: 'mock_jwt_token_volunteer_123456789',
      },
      {
        phone: '+919876543212',
        password: 'donor123',
        user: {
          id: '3',
          name: 'Donor User',
          email: 'donor@muktsarngo.com',
          phone: '+919876543212',
          role: 'donor',
          permissions: ['read'],
          avatar: null,
          lastLogin: new Date().toISOString(),
        },
        token: 'mock_jwt_token_donor_123456789',
      },
    ];

    // Find matching user
    const matchedUser = mockUsers.find(
      user => user.phone === phone && user.password === password
    );

    if (matchedUser) {
      return {
        success: true,
        message: 'Login successful',
        token: matchedUser.token,
        user: matchedUser.user,
      };
    }

    // If no match found, throw error
    throw new Error('Invalid phone number or password');
  }

  // Logout user
  async logout() {
    try {
      // Call logout API if not in development mode
      if (!isDevelopmentMode) {
        try {
          await apiMethods.logout();
        } catch (error) {
          console.log('Logout API call failed, continuing with local logout');
        }
      }

      // Clear secure storage
      await SecureStore.deleteItemAsync(this.TOKEN_KEY);
      await SecureStore.deleteItemAsync(this.USER_KEY);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Store token securely
  async setToken(token) {
    try {
      await SecureStore.setItemAsync(this.TOKEN_KEY, token);
      console.log('Token stored securely');
    } catch (error) {
      console.error('Error storing token:', error);
      throw error;
    }
  }

  // Get token securely
  async getToken() {
    try {
      return await SecureStore.getItemAsync(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Store user data securely
  async setUser(user) {
    try {
      await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user));
      console.log('User data stored securely');
    } catch (error) {
      console.error('Error storing user:', error);
      throw error;
    }
  }

  // Get user data securely
  async getUser() {
    try {
      const userData = await SecureStore.getItemAsync(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }

  // Validate token with backend
  async validateToken() {
    try {
      const token = await this.getToken();
      if (!token) return false;

      // Try to get user profile to validate token
      const response = await apiMethods.getProfile();
      return !!response;
    } catch (error) {
      console.log('Token validation failed:', error.message);
      // If token is invalid, clear it
      await this.clearAuthData();
      return false;
    }
  }

  // Clear all auth data
  async clearAuthData() {
    try {
      await SecureStore.deleteItemAsync(this.TOKEN_KEY);
      await SecureStore.deleteItemAsync(this.USER_KEY);
      console.log('Auth data cleared');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  // Get authorization header
  async getAuthHeader() {
    const token = await this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export default new AuthService();
