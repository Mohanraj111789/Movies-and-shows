/**
 * Database connection monitoring middleware
 * Provides utilities for checking database connection status
 */

import mongoose from 'mongoose';

// Track database connection status
let isConnected = false;

/**
 * Middleware to check if database is connected
 * Use this on routes that require database access
 */
export const requireDatabaseConnection = (req, res, next) => {
  if (!isConnected) {
    return res.status(503).json({
      error: 'Database connection unavailable',
      message: 'The server is unable to connect to the database. Please try again later.'
    });
  }
  next();
};

/**
 * Update the connection status based on mongoose connection state
 */
export const updateConnectionStatus = () => {
  isConnected = mongoose.connection.readyState === 1; // 1 = connected
  return isConnected;
};

/**
 * Get current database connection status
 */
export const getDatabaseStatus = () => {
  return {
    connected: isConnected,
    state: mongoose.connection.readyState,
    stateDescription: getConnectionStateDescription(mongoose.connection.readyState),
    host: isConnected ? mongoose.connection.host : null,
    name: isConnected ? mongoose.connection.name : null
  };
};

/**
 * Get a human-readable description of the connection state
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

/**
 * Setup connection event listeners
 */
export const setupConnectionMonitoring = () => {
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connection established');
    isConnected = true;
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
    isConnected = false;
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB connection lost');
    isConnected = false;
  });

  // Handle application termination
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('MongoDB connection closed due to application termination');
      process.exit(0);
    });
  });
};

export default {
  requireDatabaseConnection,
  updateConnectionStatus,
  getDatabaseStatus,
  setupConnectionMonitoring
};