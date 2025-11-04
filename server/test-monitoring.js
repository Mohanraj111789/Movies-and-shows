/**
 * Database Connection Monitoring Test Script
 * 
 * This script tests the database connection monitoring system by:
 * 1. Attempting to connect to MongoDB
 * 2. Monitoring connection events
 * 3. Simulating connection loss and reconnection
 * 
 * Usage: node test-monitoring.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { setupConnectionMonitoring, getDatabaseStatus } from './middleware/database.js';
import { setupAutoReconnect, attemptReconnect } from './utils/dbReconnect.js';

// Load environment variables
dotenv.config();

// Setup connection monitoring
setupConnectionMonitoring();
setupAutoReconnect();

// Check if MONGODB_URI is defined
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  console.error('Please add MONGODB_URI to your .env file');
  process.exit(1);
}

// Check if the placeholder is still in the connection string
if (process.env.MONGODB_URI.includes('<db_password>')) {
  console.error('❌ Please replace <db_password> in your MONGODB_URI with your actual database password');
  console.error('Edit your .env file and update the MONGODB_URI value');
  process.exit(1);
}

// Mask password in connection string for logging
const maskedUri = process.env.MONGODB_URI.replace(
  /(mongodb(\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/,
  '$1*****$4'
);

console.log(`🔄 Attempting to connect to MongoDB: ${maskedUri}`);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    runTests();
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Cannot run tests without a database connection');
    process.exit(1);
  });

/**
 * Run the monitoring system tests
 */
async function runTests() {
  console.log('\n🧪 Running database connection monitoring tests...\n');
  
  // Test 1: Check initial connection status
  console.log('Test 1: Checking initial connection status');
  const initialStatus = getDatabaseStatus();
  console.log('Connection status:', initialStatus);
  console.log('Test 1 result:', initialStatus.connected ? '✅ PASS' : '❌ FAIL');
  
  // Test 2: Simulate connection loss
  console.log('\nTest 2: Simulating connection loss');
  console.log('Closing connection...');
  
  try {
    await mongoose.connection.close();
    console.log('Connection closed manually');
    
    // Wait a moment for events to propagate
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const disconnectedStatus = getDatabaseStatus();
    console.log('Connection status after disconnect:', disconnectedStatus);
    console.log('Test 2 result:', !disconnectedStatus.connected ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.error('Error during connection close:', error);
    console.log('Test 2 result: ❌ FAIL');
  }
  
  // Test 3: Test reconnection
  console.log('\nTest 3: Testing reconnection');
  console.log('Attempting to reconnect...');
  
  try {
    const reconnected = await attemptReconnect();
    
    // Wait a moment for connection to establish
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const reconnectedStatus = getDatabaseStatus();
    console.log('Connection status after reconnect attempt:', reconnectedStatus);
    console.log('Test 3 result:', reconnectedStatus.connected ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.error('Error during reconnection:', error);
    console.log('Test 3 result: ❌ FAIL');
  }
  
  // Test 4: Check connection events
  console.log('\nTest 4: Checking connection event handling');
  console.log('Closing and reopening connection to trigger events...');
  
  try {
    // Close connection
    await mongoose.connection.close();
    console.log('Connection closed for event test');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reconnect
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connection reopened for event test');
    
    // Wait a moment for events to propagate
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const finalStatus = getDatabaseStatus();
    console.log('Final connection status:', finalStatus);
    console.log('Test 4 result:', finalStatus.connected ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.error('Error during event test:', error);
    console.log('Test 4 result: ❌ FAIL');
  }
  
  // Summary
  console.log('\n📋 Test Summary');
  console.log('The database connection monitoring system has been tested.');
  console.log('Check the logs above to see if all tests passed.');
  
  // Clean up and exit
  console.log('\n🧹 Cleaning up...');
  await mongoose.connection.close();
  console.log('Connection closed. Tests complete.');
  process.exit(0);
}