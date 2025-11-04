# Database Connection Monitoring System

This document provides an overview of the database connection monitoring system implemented in the MovieHunt application.

## Overview

The database connection monitoring system provides robust handling of MongoDB connection issues, ensuring that:

1. The application can start and operate with limited functionality even when the database is unavailable
2. Users receive appropriate feedback when database-dependent features are unavailable
3. The application automatically attempts to reconnect when the database connection is lost
4. Developers have tools to monitor and troubleshoot connection issues

## Server-Side Components

### Middleware

#### `database.js`

Location: `server/middleware/database.js`

This middleware provides core database connection monitoring functionality:

- Tracks the current connection status
- Provides a middleware to require database connection for routes
- Offers utilities to check connection status
- Sets up event listeners for connection state changes

#### `requireDbConnection.js`

Location: `server/middleware/requireDbConnection.js`

This middleware can be applied to routes that require database access:

- Returns a 503 Service Unavailable response if the database is not connected
- Can be configured to allow non-critical routes to proceed with a flag
- Optionally provides detailed error information

### Utilities

#### `dbReconnect.js`

Location: `server/utils/dbReconnect.js`

Provides automatic reconnection functionality:

- Implements exponential backoff for reconnection attempts
- Limits the number of reconnection attempts
- Provides utilities to reset reconnection attempts

### API Endpoints

#### Health Check Endpoint

`GET /api/health`

Provides basic server health information including database status:

- Returns `OK` status if database is connected
- Returns `DEGRADED` status if database is disconnected
- Includes basic database connection information

#### Database Status Endpoint

`GET /api/db-status`

Provides detailed database connection information:

- Current connection state
- Masked connection string (for security)
- Host and database name (if connected)
- Troubleshooting tips for connection issues

## Client-Side Components

### React Components

#### `DatabaseStatus.jsx`

Location: `client/src/components/DatabaseStatus.jsx`

A React component that displays the current database connection status:

- Shows a visual indicator of connection status
- Can display detailed connection information
- Automatically refreshes status periodically
- Provides a manual refresh button

#### `withDatabaseConnection.jsx`

Location: `client/src/components/withDatabaseConnection.jsx`

A Higher-Order Component (HOC) that provides database connection status to wrapped components:

- Can require database connection for critical components
- Provides a fallback UI when database is disconnected
- Passes connection status as a prop to the wrapped component

### React Hooks

#### `useDatabaseConnection.js`

Location: `client/src/hooks/useDatabaseConnection.js`

A React hook for monitoring database connection status:

- Provides connection status and detailed information
- Automatically refreshes status periodically
- Offers a manual refresh function

### Utilities

#### `databaseMonitor.js`

Location: `client/src/utils/databaseMonitor.js`

Utilities for monitoring database connection status on the client side:

- Caches status to avoid excessive API calls
- Provides subscription mechanism for status changes
- Offers utilities to handle database connection errors

## Usage Examples

### Requiring Database Connection for Routes

```javascript
// Apply to routes that require database access
router.post('/data', requireDbConnection(), async (req, res) => {
  // This route will return 503 if database is not connected
  // Your route handler here
});

// For non-critical routes
router.get('/info', requireDbConnection({ critical: false }), (req, res) => {
  // This route will proceed even if database is not connected
  // You can check req.dbAvailable to know if database is available
  if (!req.dbAvailable) {
    // Provide limited functionality
  }
});
```

### Using the DatabaseStatus Component

```jsx
// Basic usage
<DatabaseStatus />

// With detailed information
<DatabaseStatus showDetails={true} />
```

### Using the withDatabaseConnection HOC

```jsx
// Wrap a component that requires database connection
const MyComponent = ({ databaseConnected, ...props }) => {
  // Use databaseConnected prop to conditionally render
  return (
    <div>
      {databaseConnected ? 'Connected' : 'Disconnected'}
      {/* Component content */}
    </div>
  );
};

// Export the wrapped component
export default withDatabaseConnection(MyComponent, {
  requireConnection: true,
  FallbackComponent: MyFallbackUI
});
```

### Using the useDatabaseConnection Hook

```jsx
const MyComponent = () => {
  const { connected, stateDescription, refresh, isLoading } = useDatabaseConnection({
    pollInterval: 30000 // Poll every 30 seconds
  });

  return (
    <div>
      <p>Status: {isLoading ? 'Loading...' : (connected ? 'Connected' : 'Disconnected')}</p>
      <p>State: {stateDescription}</p>
      <button onClick={refresh} disabled={isLoading}>Refresh</button>
      
      {connected ? (
        <div>Database-dependent content</div>
      ) : (
        <div>Limited functionality content</div>
      )}
    </div>
  );
};
```

## Troubleshooting

If you encounter database connection issues:

1. Check the `/api/db-status` endpoint for detailed connection information
2. Verify your MongoDB connection string in the `.env` file
3. Ensure your MongoDB Atlas cluster is running and accessible
4. Check that your IP address is whitelisted in MongoDB Atlas
5. Verify that your database user has the correct permissions

See `CONNECTION_INSTRUCTIONS.md` for more detailed troubleshooting steps.