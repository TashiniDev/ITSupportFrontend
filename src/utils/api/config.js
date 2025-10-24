// API configuration for Node.js backend
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// API endpoints
export const API_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  FORGOT_PASSWORD: '/auth/forgot-password',
  PROFILE: '/user/profile', // You'll need to create this endpoint for user profile
  
  // Lookup endpoints
  DEPARTMENTS: '/lookups/departments',
  COMPANIES: '/lookups/companies',
  CATEGORIES: '/lookups/categories',
  REQUEST_TYPES: '/lookups/request-types',
  ISSUE_TYPES: '/lookups/issue-types',
  
  // Users by category endpoint
  USERS_BY_CATEGORY: '/user/category'
};

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};