/**
 * Centralized Configuration for MuktsarNGO App
 * 
 * This file contains all configuration settings for the application.
 * Change the BASE_URL here to switch between development, staging, and production environments.
 */

// Backend API Configuration
export const BASE_URL = "https://muktsar-api.onrender.com/api";

// Alternative configurations for different environments
export const API_CONFIG = {
  // Production environment (Live Backend)
  PRODUCTION: "https://muktsar-api.onrender.com/api",
  
  // Staging environment
  STAGING: "https://muktsar-api.onrender.com/api",
  
  // Local development
  DEVELOPMENT: "http://localhost:3001/api",
  
  // Local network (for testing on physical devices)
  LOCAL_NETWORK: "http://192.168.31.250:3001/api",
};

// Current environment - change this to switch environments
export const CURRENT_ENV = 'PRODUCTION';

// Get the base URL based on current environment
export const getBaseURL = () => {
  switch (CURRENT_ENV) {
    case 'PRODUCTION':
      return API_CONFIG.PRODUCTION;
    case 'STAGING':
      return API_CONFIG.STAGING;
    case 'LOCAL_NETWORK':
      return API_CONFIG.LOCAL_NETWORK;
    case 'DEVELOPMENT':
    default:
      return API_CONFIG.DEVELOPMENT;
  }
};

// App Configuration
export const APP_CONFIG = {
  // App metadata
  APP_NAME: "MuktsarNGO",
  VERSION: "1.0.0",
  
  // API settings
  API_TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  
  // Authentication settings
  TOKEN_STORAGE_KEY: "access_token",
  USER_STORAGE_KEY: "user_data",
  
  // Donation settings
  DONATION_COOLDOWN_MONTHS: 3,
  
  // Alert settings
  ALERT_POLL_INTERVAL: 30000, // 30 seconds
  
  // UI settings
  THEME_MODE: "light", // "light" | "dark" | "auto"
  
  // Admin settings
  ADMIN_ROLES: ["admin", "ADMIN", "super_admin", "SUPER_ADMIN"],
  
  // Blood groups
  BLOOD_GROUPS: [
    "A_POSITIVE", "A_NEGATIVE",
    "B_POSITIVE", "B_NEGATIVE",
    "AB_POSITIVE", "AB_NEGATIVE",
    "O_POSITIVE", "O_NEGATIVE"
  ],
  
  UI_BLOOD_GROUPS: [
    { label: "A+", value: "A_POSITIVE" },
    { label: "A-", value: "A_NEGATIVE" },
    { label: "B+", value: "B_POSITIVE" },
    { label: "B-", value: "B_NEGATIVE" },
    { label: "AB+", value: "AB_POSITIVE" },
    { label: "AB-", value: "AB_NEGATIVE" },
    { label: "O+", value: "O_POSITIVE" },
    { label: "O-", value: "O_NEGATIVE" },
  ],
  
  // Gender options
  GENDERS: ["MALE", "FEMALE", "OTHER"],
  
  // Alert urgency levels
  URGENCY_LEVELS: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
};

// Feature flags
export const FEATURES = {
  // Enable/disable features
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_ANALYTICS: false,
  ENABLE_CRASH_REPORTING: false,
  
  // Admin features
  ENABLE_ADMIN_MODE_TOGGLE: true,
  ENABLE_DONOR_MANAGEMENT: true,
  ENABLE_REPORTS: true,
  ENABLE_ALERT_CREATION: true,
  
  // Donor features
  ENABLE_PROFILE_EDITING: true,
  ENABLE_DONATION_HISTORY: true,
  ENABLE_ALERT_VIEWING: true,
};

// API Endpoints
export const ENDPOINTS = {
  // Authentication
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  PROFILE: "/auth/profile",
  
  // Donors
  DONORS: "/donors",
  DONOR_PROFILE: "/donors/me",
  DONOR_STATISTICS: "/donors/statistics",
  
  // Alerts
  ALERTS: "/alerts",
  ACTIVE_ALERTS: "/alerts/active",
  
  // Reports
  REPORTS_SUMMARY: "/reports/summary",
  REPORTS_DONORS: "/reports/donors",
  REPORTS_ALERTS: "/reports/alerts",
  
  // Notifications
  FCM_REGISTER: "/notifications/register-token",
  FCM_UNREGISTER: "/notifications/unregister-token",
};

// Helper functions
export const isAdmin = (user) => {
  if (!user || !user.role) return false;
  return APP_CONFIG.ADMIN_ROLES.includes(user.role);
};

export const isDonor = (user) => {
  if (!user || !user.role) return false;
  return user.role === "DONOR" || user.role === "donor";
};

export const getFullURL = (endpoint) => {
  const baseURL = getBaseURL();
  return `${baseURL}${endpoint}`;
};

// Environment detection
export const isDevelopment = () => CURRENT_ENV === 'DEVELOPMENT';
export const isProduction = () => CURRENT_ENV === 'PRODUCTION';

// Export default configuration
export default {
  BASE_URL: getBaseURL(),
  APP_CONFIG,
  FEATURES,
  ENDPOINTS,
  isAdmin,
  isDonor,
  getFullURL,
  isDevelopment,
  isProduction,
};
