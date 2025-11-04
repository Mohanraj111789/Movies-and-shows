import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import { setupConnectionMonitoring, getDatabaseStatus } from './middleware/database.js';
import { setupAutoReconnect } from './utils/dbReconnect.js';

// Load environment variables first
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      console.error('❌ MongoDB URI is not defined in environment variables');
      console.error('Please add MONGODB_URI to your .env file');
      return false;
    }
    
    // Check if the connection string contains placeholder values
    if (process.env.MONGODB_URI.includes('<db_password>')) {
      console.error('❌ MongoDB connection string contains placeholder <db_password>');
      console.error('Please replace <db_password> with your actual MongoDB password in the .env file');
      return false;
    }
    
    // Check for common connection string format issues
    if (!process.env.MONGODB_URI.startsWith('mongodb://') && !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
      console.error('❌ Invalid MongoDB connection string format');
      console.error('Connection string should start with mongodb:// or mongodb+srv://');
      return false;
    }

    // Attempt connection with timeout
    const connectionPromise = mongoose.connect(process.env.MONGODB_URI);
    
    // Set a timeout for the connection attempt
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout - check network or firewall settings')), 10000);
    });
    
    await Promise.race([connectionPromise, timeoutPromise]);
    
    console.log('✅ Connected to MongoDB successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Provide more specific error messages for common issues
    if (error.message.includes('ENOTFOUND')) {
      console.error('Host not found. Check your connection string and internet connection.');
    } else if (error.message.includes('ETIMEDOUT')) {
      console.error('Connection timed out. Check your network settings or MongoDB Atlas IP whitelist.');
    } else if (error.message.includes('bad auth')) {
      console.error('Authentication failed. Check your username and password in the connection string.');
    } else if (error.message.includes('Connection timeout')) {
      console.error('Connection timed out. Your network may be blocking the connection or MongoDB server is unreachable.');
    } else {
      console.error('Please check:');
      console.error('  1. Your MongoDB password is correct');
      console.error('  2. Your IP address is whitelisted in MongoDB Atlas');
      console.error('  3. Your MongoDB Atlas cluster is running');
    }
    
    console.error('See CONNECTION_INSTRUCTIONS.md for troubleshooting tips');
    return false;
  }
};

// Setup database connection monitoring and auto-reconnect
setupConnectionMonitoring();
setupAutoReconnect();

// Attempt to connect to MongoDB but continue even if connection fails
connectDB().then(connected => {
  if (!connected) {
    console.warn('⚠️ Server starting without database connection. Some features may not work.');
  }
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  
  res.json({ 
    status: dbStatus.connected ? 'OK' : 'DEGRADED', 
    message: dbStatus.connected ? 'Movie Hunt Server is running' : 'Movie Hunt Server is running with limited functionality',
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.connected,
      state: dbStatus.stateDescription,
      host: dbStatus.host,
      name: dbStatus.name
    }
  });
});

// Database connection status endpoint
app.get('/api/db-status', (req, res) => {
  const dbStatus = getDatabaseStatus();
  const connectionString = process.env.MONGODB_URI || 'Not configured';
  
  // Mask password in connection string if present
  const maskedConnectionString = connectionString.replace(
    /(mongodb(\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/,
    '$1*****$4'
  );
  
  res.json({
    connected: dbStatus.connected,
    state: dbStatus.state,
    stateDescription: dbStatus.stateDescription,
    connectionString: maskedConnectionString,
    host: dbStatus.host,
    database: dbStatus.name,
    timestamp: new Date().toISOString(),
    tips: [
      'If connection fails, check your MONGODB_URI in .env file',
      'Ensure you have replaced <db_password> with your actual password',
      'Check if your IP address is whitelisted in MongoDB Atlas',
      'Verify that your MongoDB user has the correct permissions',
      'See CONNECTION_INSTRUCTIONS.md for more troubleshooting tips'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend should connect to: http://localhost:${PORT}`);
});