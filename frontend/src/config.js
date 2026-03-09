// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Environment flags
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Export for easy use
export default {
  API_URL,
  isDevelopment,
  isProduction
};
