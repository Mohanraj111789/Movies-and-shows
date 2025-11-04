# MongoDB Connection Instructions

## Important: Fix Your Connection String

To properly connect to MongoDB, you need to replace the placeholder `<db_password>` in your `.env` file with your actual MongoDB Atlas password.

1. Open the `.env` file in the server directory
2. Find the line that starts with `MONGODB_URI=`
3. Replace `<db_password>` with your actual MongoDB Atlas password

Example:
```
# Before
MONGODB_URI=mongodb+srv://mohantsk381:<db_password>@cluster0.qorjl8u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# After (example)
MONGODB_URI=mongodb+srv://mohantsk381:your_actual_password_here@cluster0.qorjl8u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

## Testing Your Connection

### Using the Test Script

A test script has been provided to verify your MongoDB connection. To use it:

1. Make sure you've updated your `.env` file with the correct password
2. Run the following command in the server directory:

```bash
node test-connection.js
```

If successful, you'll see a message confirming the connection.

### Using the API Endpoints

The server now includes dedicated endpoints for checking database connection status:

1. **Health Check**: `http://localhost:5000/api/health`
   - Provides overall server health including database status
   - Returns `OK` status if database is connected, `DEGRADED` if not

2. **Database Status**: `http://localhost:5000/api/db-status`
   - Provides detailed information about the database connection
   - Includes troubleshooting tips for common issues
   - Shows a masked version of your connection string for security

## Automatic Reconnection

The server now includes automatic reconnection functionality:

- If the database connection is lost, the server will automatically attempt to reconnect
- Reconnection attempts use exponential backoff (increasing delays between attempts)
- The server will make up to 5 reconnection attempts before giving up
- You can still use the application with limited functionality while reconnection attempts are in progress

## Troubleshooting Connection Issues

### Using the Database Status Endpoint

The `/api/db-status` endpoint provides real-time information about your database connection status. Access it at:

```
http://localhost:5000/api/db-status
```

This endpoint will show:
- Current connection state
- A masked version of your connection string
- Host and database name (if connected)
- Troubleshooting tips specific to your connection issue

### Common Issues and Solutions

If you're still having trouble connecting to MongoDB, check the following:

1. **Password Correctness**: Ensure your password is correct and properly URL-encoded if it contains special characters
   - Special characters in passwords may need to be URL-encoded
   - If you see `bad auth` errors, this is likely the issue

2. **IP Whitelist**: Make sure your IP address is whitelisted in MongoDB Atlas
   - Go to MongoDB Atlas → Network Access → Add IP Address → Add Current IP Address
   - If your IP address changes frequently, consider allowing access from anywhere (0.0.0.0/0) for development

3. **Network Access**: Check that your network allows connections to MongoDB Atlas
   - Some corporate networks, schools, or public WiFi may block MongoDB connections
   - Try connecting from a different network or using a VPN
   - MongoDB Atlas uses port 27017, which may be blocked by firewalls

4. **MongoDB Atlas Status**: Verify that your MongoDB Atlas cluster is running
   - Check the MongoDB Atlas status page for any outages
   - Ensure your cluster hasn't been paused due to inactivity

5. **Database User**: Ensure the database user has the correct permissions
   - The user should have at least read/write permissions for your database
   - Check Database Access in MongoDB Atlas

6. **Connection String Format**: Verify your connection string follows the correct format
   - It should start with `mongodb+srv://` for Atlas clusters
   - Check for typos in the hostname or options

## Security Note

Never commit your actual password to version control. The `.env` file should be included in your `.gitignore` file to prevent accidentally exposing sensitive credentials.