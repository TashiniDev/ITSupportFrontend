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
  REQUEST_TYPES_BY_CATEGORY: '/lookups/request-types', // Base endpoint for category-specific request types
  ISSUE_TYPES_BY_CATEGORY: '/lookups/issue-types', // Base endpoint for category-specific issue types
  
  // Users by category endpoint
  USERS_BY_CATEGORY: '/user/category'
  ,
  // Tickets
  TICKETS: '/tickets'
};

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    // Start with any options the caller passed (method, body, etc.)
    ...options,
    headers: {
      // default to JSON but allow callers to override
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // If caller provided a FormData body, the browser will set the correct
  // multipart/form-data boundary header automatically. If we leave
  // 'Content-Type' set to 'application/json' the request will be wrong.
  if (config.body instanceof FormData) {
    // remove Content-Type so fetch can set the proper multipart boundary
    try {
      delete config.headers['Content-Type'];
    } catch (e) {
      // ignore
    }
  }

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    console.log(`[apiCall] Request -> ${config.method || 'GET'} ${url}`);
    const response = await fetch(url, config);
    let data = null;
    try {
      data = await response.json();
    } catch (jsonErr) {
      // No JSON body
      data = null;
    }

    console.log(`[apiCall] Response <- ${response.status} ${url}`, data);

    if (!response.ok) {
      // Log full error for easier debugging in the browser console
      console.error('API call failed', { url, status: response.status, body: data });

      // If unauthorized, clear token and redirect to login so user can re-authenticate
      if (response.status === 401) {
        try {
          localStorage.removeItem('authToken');
        } catch (e) {
          // ignore
        }
        // Redirect to login page (will reload the app)
        try { window.location.href = '/login'; } catch (e) { /* ignore in non-browser env */ }
        throw new Error((data && data.message) || 'Unauthorized');
      }

      throw new Error((data && data.message) || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`[apiCall] Error calling ${url}:`, error);
    throw error;
  }
};