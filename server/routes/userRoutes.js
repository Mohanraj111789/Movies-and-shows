import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import requireDbConnection from '../middleware/requireDbConnection.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d'
  });
};

// Validation middleware
const validateSignup = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),
  body('userName')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Username must be between 2 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @route   POST /api/users/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', validateSignup, requireDbConnection(), async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { fullName, userName, email, password } = req.body;

    // Check if user already exists with email
    const existingUserEmail = await User.findByEmail(email);
    if (existingUserEmail) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Check if username is already taken
    const existingUserName = await User.findOne({ userName });
    if (existingUserName) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    // Create new user
    const user = new User({
      fullName,
      userName,
      email,
      password,
      isGuest: false
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Update last login
    await user.updateLastLogin();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          isGuest: user.isGuest,
          createdAt: user.createdAt
        },
        token
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: error.message
    });
  }
});

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user by email and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is a guest
    if (user.isGuest) {
      return res.status(401).json({
        success: false,
        message: 'Guest users cannot login with email/password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Update last login
    await user.updateLastLogin();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          isGuest: user.isGuest,
          lastLogin: user.lastLogin
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// @route   POST /api/users/guest
// @desc    Create or get guest user
// @access  Public
router.post('/guest', async (req, res) => {
  try {
    // Create a guest user
    const guestUser = new User({
      fullName: 'Guest',
      email: `guest_${Date.now()}@moviehunt.guest`,
      password: 'guest_password_' + Math.random().toString(36).substr(2, 9),
      isGuest: true
    });

    await guestUser.save();

    // Generate JWT token
    const token = generateToken(guestUser._id);

    res.status(201).json({
      success: true,
      message: 'Guest access granted',
      data: {
        user: {
          id: guestUser._id,
          fullName: guestUser.fullName,
          isGuest: guestUser.isGuest,
          createdAt: guestUser.createdAt
        },
        token
      }
    });

  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during guest access',
      error: error.message
    });
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile (protected route)
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          isGuest: user.isGuest,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          preferences: user.preferences
        }
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: error.message
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', async (req, res) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Find and update user
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          isGuest: user.isGuest,
          preferences: user.preferences
        }
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: error.message
    });
  }
});

export default router;