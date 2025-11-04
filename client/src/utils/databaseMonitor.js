/**
 * Database connection monitoring utility for client-side applications
 * Provides functions to check database status and handle connection issues
 */

import axios from 'axios';

// Cache the status to avoid excessive API calls
let cachedStatus = null;
let lastChecked = null;
let statusListeners = [];

// Maximum age of cached status in milliseconds (30 seconds)
const MAX_CACHE_AGE = 30000;

/**
 * Check if the database is connected
 * @param {boolean} forceRefresh - Whether to force a refresh of the status
 * @returns {Promise<boolean>} - Whether the database is connected
 */
export const isDatabaseConnected = async (forceRefresh = false) => {
  const status = await getDatabaseStatus(forceRefresh);
  return status.connected;
};

/**
 * Get detailed database status information
 * @param {boolean} forceRefresh - Whether to force a refresh of the status
 * @returns {Promise<Object>} - Database status object
 */
export const getDatabaseStatus = async (forceRefresh = false) => {
  // Use cached status if available and not expired
  const now = Date.now();
  if (
    !forceRefresh &&
    cachedStatus &&
    lastChecked &&
    now - lastChecked < MAX_CACHE_AGE
  ) {
    return cachedStatus;
  }

  try {
    const response = await axios.get('/api/db-status');
    cachedStatus = response.data;
    lastChecked = now;
    
    // Notify all listeners of the status change
    notifyStatusListeners(cachedStatus);
    
    return cachedStatus;
  } catch (error) {
    const errorStatus = {
      connected: false,
      stateDescription: 'error',
      error: error.message || 'Failed to fetch database status'
    };
    
    cachedStatus = errorStatus;
    lastChecked = now;
    
    // Notify all listeners of the status change
    notifyStatusListeners(cachedStatus);
    
    return errorStatus;
  }
};

/**
 * Subscribe to database status changes
 * @param {Function} listener - Function to call when status changes
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToStatusChanges = (listener) => {
  statusListeners.push(listener);
  
  // Return unsubscribe function
  return () => {
    statusListeners = statusListeners.filter(l => l !== listener);
  };
};

/**
 * Notify all listeners of a status change
 * @param {Object} status - The new status
 */
const notifyStatusListeners = (status) => {
  statusListeners.forEach(listener => {
    try {
      listener(status);
    } catch (error) {
      console.error('Error in database status listener:', error);
    }
  });
};

/**
 * Start polling for database status changes
 * @param {number} intervalMs - Polling interval in milliseconds
 * @returns {Function} - Function to stop polling
 */
export const startStatusPolling = (intervalMs = 30000) => {
  const intervalId = setInterval(() => {
    getDatabaseStatus(true).catch(error => {
      console.error('Error polling database status:', error);
    });
  }, intervalMs);
  
  return () => clearInterval(intervalId);
};

/**
 * Handle API errors related to database connection
 * @param {Error} error - The error object
 * @returns {Object} - Formatted error object with user-friendly message
 */
export const handleDatabaseConnectionError = (error) => {
  // Check if it's a database connection error
  const isConnectionError = 
    error.response?.status === 503 || 
    error.response?.data?.error === 'Database connection unavailable';
  
  if (isConnectionError) {
    return {
      message: 'Database connection is currently unavailable. Please try again later.',
      isConnectionError: true,
      originalError: error
    };
  }
  
  // Not a database connection error
  return {
    message: error.response?.data?.message || error.message || 'An error occurred',
    isConnectionError: false,
    originalError: error
  };
};

export default {
  isDatabaseConnected,
  getDatabaseStatus,
  subscribeToStatusChanges,
  startStatusPolling,
  handleDatabaseConnectionError
};