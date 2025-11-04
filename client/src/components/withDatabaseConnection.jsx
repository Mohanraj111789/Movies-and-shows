import React, { useState, useEffect } from 'react';
import { isDatabaseConnected, subscribeToStatusChanges } from '../utils/databaseMonitor';

/**
 * Higher-Order Component that provides database connection status to wrapped components
 * and can optionally show a fallback UI when the database is disconnected
 * 
 * @param {React.Component} WrappedComponent - The component to wrap
 * @param {Object} options - Configuration options
 * @param {boolean} options.requireConnection - Whether the component requires a database connection
 * @param {React.Component} options.FallbackComponent - Component to show when database is disconnected
 * @returns {React.Component} - The wrapped component with database connection handling
 */
const withDatabaseConnection = (WrappedComponent, options = {}) => {
  const {
    requireConnection = false,
    FallbackComponent = null
  } = options;

  // Create a new component that wraps the original
  const WithDatabaseConnection = (props) => {
    const [isConnected, setIsConnected] = useState(null); // null = loading
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      // Check initial connection status
      const checkConnection = async () => {
        try {
          setIsChecking(true);
          const connected = await isDatabaseConnected();
          setIsConnected(connected);
        } catch (error) {
          console.error('Error checking database connection:', error);
          setIsConnected(false);
        } finally {
          setIsChecking(false);
        }
      };

      checkConnection();

      // Subscribe to status changes
      const unsubscribe = subscribeToStatusChanges((status) => {
        setIsConnected(status.connected);
      });

      return () => {
        unsubscribe();
      };
    }, []);

    // Show loading state while checking connection
    if (isChecking) {
      return (
        <div className="database-connection-loading">
          <p>Checking database connection...</p>
        </div>
      );
    }

    // If connection is required but not available, show fallback
    if (requireConnection && !isConnected) {
      if (FallbackComponent) {
        return <FallbackComponent {...props} />;
      }

      // Default fallback UI
      return (
        <div className="database-connection-error">
          <h3>Database Connection Unavailable</h3>
          <p>This feature requires a database connection, which is currently unavailable.</p>
          <p>Please try again later or contact support if the issue persists.</p>
        </div>
      );
    }

    // Render the wrapped component with an additional prop
    return <WrappedComponent {...props} databaseConnected={isConnected} />;
  };

  // Set display name for debugging
  const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithDatabaseConnection.displayName = `withDatabaseConnection(${wrappedComponentName})`;

  return WithDatabaseConnection;
};

export default withDatabaseConnection;