/**
 * Middleware to require database connection for specific routes
 * This middleware will return a 503 Service Unavailable response if the database is not connected
 */

import mongoose from 'mongoose';

/**
 * Middleware to check if database is connected
 * Use this on routes that require database access
 * 
 * @param {Object} options - Middleware options
 * @param {boolean} options.critical - Whether the route is critical and should fail if DB is disconnected
 * @param {boolean} options.sendDetailedError - Whether to send detailed error information
 * @returns {Function} Express middleware function
 */
const requireDbConnection = (options = {}) => {
  const {
    critical = true,
    sendDetailedError = false
  } = options;
  
  return (req, res, next) => {
    // Check if mongoose is connected (readyState 1 = connected)
    const isConnected = mongoose.connection.readyState === 1;
    
    if (isConnected) {
      // Database is connected, proceed to the next middleware/route handler
      return next();
    }
    
    // If the route is not critical, we can proceed even without a DB connection
    if (!critical) {
      // Add a flag to the request object to indicate DB is not available
      req.dbAvailable = false;
      return next();
    }
    
    // For critical routes, return a 503 Service Unavailable response
    const response = {
      error: 'Database connection unavailable',
      message: 'The server is unable to process your request because the database is currently unavailable. Please try again later.'
    };
    
    // Add detailed error information if enabled
    if (sendDetailedError) {
      response.details = {
        readyState: mongoose.connection.readyState,
        readyStateDescription: getConnectionStateDescription(mongoose.connection.readyState),
        timestamp: new Date().toISOString()
      };
    }
    
    return res.status(503).json(response);
  };
};

/**
 * Get a human-readable description of the connection state
 * @param {number} state - Mongoose connection state
 * @returns {string} Human-readable state description
 */
const getConnectionStateDescription = (state) => {
  switch (state) {
    case 0: return 'disconnected';
    case 1: return 'connected';
    case 2: return 'connecting';
    case 3: return 'disconnecting';
    default: return 'unknown';
  }
};

export default requireDbConnection;