const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Recommendation API calls
export const recommendationAPI = {
  // Get all recommendations
  getRecommendations: async () => {
    return await apiRequest('/recommendations');
  },

  // Get recommendations by username
  getUserRecommendations: async (userName) => {
    return await apiRequest(`/recommendations/user/${userName}`);
  },

  // Get recommendation by ID
  getRecommendationById: async (id) => {
    return await apiRequest(`/recommendations/${id}`);
  },

  // Create a new recommendation
  createRecommendation: async (recommendationData) => {
    return await apiRequest('/recommendations', {
      method: 'POST',
      body: JSON.stringify(recommendationData)
    });
  },

  // Delete a recommendation
  deleteRecommendation: async (id) => {
    return await apiRequest(`/recommendations/${id}`, {
      method: 'DELETE'
    });
  }
};

// Helper function to set auth token in localStorage
const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Helper function to remove auth token from localStorage
const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

// Helper function to get user data from localStorage
const getUserData = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

// Helper function to set user data in localStorage
const setUserData = (userData) => {
  localStorage.setItem('userData', JSON.stringify(userData));
};

// Helper function to remove user data from localStorage
const removeUserData = () => {
  localStorage.removeItem('userData');
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Add auth token to headers if available
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// User authentication API calls
export const authAPI = {
  // Sign up a new user
  signup: async (userData) => {
    const response = await apiRequest('/users/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    if (response.success) {
      setAuthToken(response.data.token);
      setUserData(response.data.user);
    }

    return response;
  },

  // Login existing user
  login: async (credentials) => {
    const response = await apiRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (response.success) {
      setAuthToken(response.data.token);
      setUserData(response.data.user);
    }

    return response;
  },

  // Guest login
  guestLogin: async () => {
    const response = await apiRequest('/users/guest', {
      method: 'POST'
    });

    if (response.success) {
      setAuthToken(response.data.token);
      setUserData(response.data.user);
    }

    return response;
  },

  // Get user profile
  getProfile: async () => {
    return await apiRequest('/users/profile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Logout (clear local storage)
  logout: () => {
    removeAuthToken();
    removeUserData();
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('loginStatusChanged'));
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = getAuthToken();
    const userData = getUserData();
    return !!(token && userData);
  },

  // Get current user data
  getCurrentUser: () => {
    return getUserData();
  },

  // Get current auth token
  getCurrentToken: () => {
    return getAuthToken();
  }
};

// Health check API call
export const healthCheck = async () => {
  return await apiRequest('/health');
};

export default {
  authAPI,
  healthCheck,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getUserData,
  setUserData,
  removeUserData
};