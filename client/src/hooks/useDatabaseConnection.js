import { useState, useEffect } from 'react';
import { getDatabaseStatus, subscribeToStatusChanges } from '../utils/databaseMonitor';

/**
 * React hook for monitoring database connection status
 * 
 * @param {Object} options - Hook options
 * @param {boolean} options.pollInterval - Interval in ms to poll for status updates (0 to disable polling)
 * @returns {Object} Database connection status and utilities
 */
const useDatabaseConnection = (options = {}) => {
  const { pollInterval = 0 } = options;
  
  const [status, setStatus] = useState({
    loading: true,
    connected: false,
    stateDescription: 'unknown',
    error: null
  });

  // Function to refresh the status
  const refreshStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      const dbStatus = await getDatabaseStatus(true); // Force refresh
      
      setStatus({
        loading: false,
        connected: dbStatus.connected,
        stateDescription: dbStatus.stateDescription,
        host: dbStatus.host,
        database: dbStatus.database,
        tips: dbStatus.tips,
        error: null
      });
      
      return dbStatus;
    } catch (error) {
      const errorStatus = {
        loading: false,
        connected: false,
        stateDescription: 'error',
        error: error.message || 'Failed to fetch database status'
      };
      
      setStatus(errorStatus);
      return errorStatus;
    }
  };

  useEffect(() => {
    // Initial status check
    refreshStatus();
    
    // Subscribe to status changes
    const unsubscribe = subscribeToStatusChanges((newStatus) => {
      setStatus({
        loading: false,
        connected: newStatus.connected,
        stateDescription: newStatus.stateDescription,
        host: newStatus.host,
        database: newStatus.database,
        tips: newStatus.tips,
        error: null
      });
    });
    
    // Set up polling if enabled
    let intervalId = null;
    if (pollInterval > 0) {
      intervalId = setInterval(refreshStatus, pollInterval);
    }
    
    // Cleanup
    return () => {
      unsubscribe();
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [pollInterval]);

  return {
    ...status,
    refresh: refreshStatus,
    isLoading: status.loading
  };
};

export default useDatabaseConnection;