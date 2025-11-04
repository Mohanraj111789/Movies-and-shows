/**
 * Database reconnection utility
 * Provides functionality to automatically reconnect to MongoDB when connection is lost
 */

import mongoose from 'mongoose';

// Configuration
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY_MS = 1000; // 1 second
const MAX_RECONNECT_DELAY_MS = 30000; // 30 seconds

// Tracking variables
let reconnectAttempts = 0;
let reconnectTimer = null;

/**
 * Attempt to reconnect to MongoDB with exponential backoff
 */
export const attemptReconnect = async () => {
  // Clear any existing reconnect timer
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  // If we've exceeded max attempts, stop trying
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(`❌ Failed to reconnect to MongoDB after ${MAX_RECONNECT_ATTEMPTS} attempts`);
    console.error('Please check your connection settings and restart the server');
    return false;
  }

  // Calculate delay with exponential backoff
  const delay = Math.min(
    INITIAL_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempts),
    MAX_RECONNECT_DELAY_MS
  );

  reconnectAttempts++;

  console.log(`⏳ Attempting to reconnect to MongoDB (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${delay/1000} seconds...`);

  // Set timer for next reconnect attempt
  reconnectTimer = setTimeout(async () => {
    try {
      if (mongoose.connection.readyState !== 0) { // Not disconnected
        await mongoose.connection.close();
      }

      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Successfully reconnected to MongoDB');
      reconnectAttempts = 0; // Reset counter on successful reconnection
      return true;
    } catch (error) {
      console.error(`❌ Reconnection attempt ${reconnectAttempts} failed:`, error.message);
      return attemptReconnect(); // Try again with increased delay
    }
  }, delay);
};

/**
 * Setup automatic reconnection when connection is lost
 */
export const setupAutoReconnect = () => {
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB connection lost, attempting to reconnect...');
    attemptReconnect();
  });
};

/**
 * Reset reconnection attempts counter
 */
export const resetReconnectAttempts = () => {
  reconnectAttempts = 0;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
};

export default {
  attemptReconnect,
  setupAutoReconnect,
  resetReconnectAttempts
};