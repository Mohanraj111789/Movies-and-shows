# Movies and Shows Application

A full-stack application for browsing movies and shows, with user recommendations feature and robust database connection monitoring.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [Features](#features)
- [Project Structure](#project-structure)
- [Database Connection Monitoring](#database-connection-monitoring)
  - [Key Features](#key-features)
  - [Documentation](#documentation)
  - [Testing the Monitoring System](#testing-the-monitoring-system)


## Technologies Used

- **Frontend**: React + Vite
- **Backend**: Express.js, Node.js
- **Database**: MongoDB Atlas
- **Monitoring**: Custom database connection monitoring system

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- MongoDB Atlas account

### Environment Setup

1. **Backend Configuration**
   - Navigate to the server directory: `cd server`
   - Create a `.env` file with the following variables:
   ```
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
   
   # JWT Secret
   JWT_SECRET=your_jwt_secret_key_here
   
   # Server Port
   PORT=5000
   
   # Environment
   NODE_ENV=development
   ```
   - Replace `<username>`, `<password>`, and `<cluster-url>` with your MongoDB Atlas credentials

2. **Frontend Configuration**
   - In the root directory, create a `.env` file if needed for frontend environment variables

### Installation

1. **Install backend dependencies**
   ```
   cd server
   npm install
   ```

2. **Install frontend dependencies**
   ```
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```
   cd server
   npm start
   ```

2. **Start the frontend development server**
   ```
   npm run dev
   ```

## Features

- Browse movies and shows
- User authentication
- Personal recommendations
- Search functionality
- Robust database connection monitoring and auto-reconnection

## Project Structure

- `/src` - Frontend React application
  - `/components` - React components including database status UI
  - `/hooks` - Custom React hooks including database connection hook
  - `/utils` - Utility functions including database monitoring
- `/server` - Backend Express API
  - `/models` - MongoDB schemas
  - `/routes` - API endpoints
  - `/middleware` - Express middleware including database connection monitoring
  - `/utils` - Utility functions including database reconnection
- `/docs` - Documentation including database monitoring guide

## Database Connection Monitoring

This application includes a robust database connection monitoring system that ensures the application can function even when the database is temporarily unavailable.

### Key Features

- **Auto-reconnection**: Automatically attempts to reconnect to MongoDB when connection is lost
- **Graceful degradation**: Application continues to run with limited functionality when database is unavailable
- **Real-time status monitoring**: Frontend components to display database connection status
- **API endpoints**: `/api/health` and `/api/db-status` endpoints for monitoring
- **Connection middleware**: Routes can require database connection or function with limited capabilities

### Documentation

For detailed information about the database monitoring system, see the [Database Monitoring Documentation](./docs/DATABASE_MONITORING.md).

### Testing the Monitoring System

1. **Check connection status**:
   - Visit `/api/health` endpoint to see overall health including database status
   - Visit `/api/db-status` endpoint for detailed database connection information

2. **Test reconnection**:
   - Temporarily disable your network connection or change MongoDB credentials
   - Observe the automatic reconnection attempts in server logs
   - Re-enable connection and verify the system reconnects automatically

3. **Use the React components**:
   - Import the `DatabaseStatus` component to display connection status in your UI
   - Use the `useDatabaseConnection` hook to react to connection changes in your components
   - Wrap critical components with `withDatabaseConnection` HOC for graceful degradation

4. **Run the test script**:
   ```
   cd server
   npm run test:db
   ```
   Or directly:
   ```
   cd server
   node test-monitoring.js
   ```
   This script will:
   - Test initial connection status
   - Simulate connection loss
   - Test reconnection functionality
   - Verify connection event handling
