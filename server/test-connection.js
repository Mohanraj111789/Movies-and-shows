import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config();

console.log('\n🔍 MongoDB Connection Test');
console.log('============================');

// Check if MONGODB_URI is defined
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  console.log('\n📝 Please check your .env file and ensure MONGODB_URI is correctly set');
  console.log('\n💡 See CONNECTION_INSTRUCTIONS.md for more details');
  process.exit(1);
}

// Log the connection string (with password masked)
const connectionString = process.env.MONGODB_URI;
const maskedConnectionString = connectionString.replace(/(\/\/[^:]+:)[^@]+(@)/, '$1*****$2');
console.log(`\n🔌 Attempting to connect to: ${maskedConnectionString}`);

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`\n✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`\n📊 Database Name: ${conn.connection.name}`);
    console.log('\n🎉 Connection test successful!');
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    
    // Provide more specific error messages based on error code
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n🔍 This could be due to:');
      console.log('  - Incorrect password');
      console.log('  - IP address not whitelisted in MongoDB Atlas');
      console.log('  - MongoDB Atlas cluster is not running');
      console.log('  - Network connectivity issues');
    }
    
    console.log('\n📝 Please check CONNECTION_INSTRUCTIONS.md for troubleshooting steps');
    process.exit(1);
  } finally {
    // Close the connection after testing
    setTimeout(() => {
      mongoose.connection.close();
      console.log('\n👋 Connection closed');
      process.exit(0);
    }, 1000);
  }
};

connectDB();