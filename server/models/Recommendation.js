import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'User name is required'],
    trim: true,
    minlength: [2, 'User name must be at least 2 characters long'],
    maxlength: [50, 'User name cannot exceed 50 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movieId: {
    type: Number,
    required: true
  },
  movieTitle: {
    type: String,
    required: true
  },
  posterPath: {
    type: String
  },
  recommendationReason: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

export default Recommendation;