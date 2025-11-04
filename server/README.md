# Movies and Shows API Server

This is the backend server for the Movies and Shows application.

## Setup Instructions

### Environment Variables

Create a `.env` file in the server directory with the following variables:

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

### Important Notes on MongoDB Connection

1. **Security Warning**: Never commit your actual MongoDB password to version control.

2. **Connection String Format**: Make sure your MongoDB connection string follows this format:
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
   ```

3. **Troubleshooting Connection Issues**:
   - Ensure your IP address is whitelisted in MongoDB Atlas
   - Verify username and password are correct
   - Check that your cluster is running

## API Endpoints

### User Routes
- `POST /api/users/signup` - Register a new user
- `POST /api/users/login` - Login a user

### Recommendation Routes
- `GET /api/recommendations` - Get all recommendations
- `GET /api/recommendations/user/:userName` - Get recommendations by username
- `GET /api/recommendations/:id` - Get recommendation by ID
- `POST /api/recommendations` - Create a new recommendation
- `DELETE /api/recommendations/:id` - Delete a recommendation

## Running the Server

```bash
# Install dependencies
npm install

# Start the server
npm start

# Start in development mode with nodemon (if available)
npm run dev
```

## Database Models

### User Model
- `fullName`: String
- `userName`: String
- `email`: String
- `password`: String (hashed)
- `lastLogin`: Date

### Recommendation Model
- `title`: String
- `description`: String
- `type`: String (movie/show)
- `genre`: String
- `rating`: Number
- `createdBy`: ObjectId (reference to User)