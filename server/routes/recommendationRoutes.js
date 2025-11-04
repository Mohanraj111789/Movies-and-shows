import express from 'express';
import { body, validationResult } from 'express-validator';
import Recommendation from '../models/Recommendation.js';
import User from '../models/User.js';
import { authenticateUser } from '../middleware/auth.js';
import requireDbConnection from '../middleware/requireDbConnection.js';

const router = express.Router();

// Validation middleware
const validateRecommendation = [
  body('userName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('User name must be between 2 and 50 characters'),
  body('movieId')
    .isNumeric()
    .withMessage('Movie ID must be a number'),
  body('movieTitle')
    .trim()
    .notEmpty()
    .withMessage('Movie title is required'),
  body('recommendationReason')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Recommendation reason must be at least 5 characters')
];

// @route   POST /api/recommendations
// @desc    Create a new recommendation
// @access  Private
router.post('/', authenticateUser, validateRecommendation, requireDbConnection(), async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { userName, movieId, movieTitle, posterPath, recommendationReason } = req.body;

    // Create new recommendation
    const recommendation = new Recommendation({
      userName,
      userId: req.user._id,
      movieId,
      movieTitle,
      posterPath,
      recommendationReason
    });

    await recommendation.save();

    res.status(201).json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('Error creating recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/recommendations
// @desc    Get all recommendations
// @access  Public
router.get('/', async (req, res) => {
  try {
    const recommendations = await Recommendation.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'userName fullName');

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/recommendations/user/:userName
// @desc    Get recommendations by username
// @access  Public
router.get('/user/:userName', async (req, res) => {
  try {
    const { userName } = req.params;
    
    const recommendations = await Recommendation.find({ userName })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error('Error fetching user recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/recommendations/:id
// @desc    Get recommendation by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id)
      .populate('userId', 'userName fullName');

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    res.json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('Error fetching recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/recommendations/:id
// @desc    Delete a recommendation
// @access  Private (only the creator)
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id);

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    // Check if user is the creator of the recommendation
    if (recommendation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this recommendation'
      });
    }

    await recommendation.remove();

    res.json({
      success: true,
      message: 'Recommendation removed'
    });
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

export default router;