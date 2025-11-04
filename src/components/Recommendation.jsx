import React, { useState, useEffect } from "react";
import "../styles/Recommendation.css";

const Recommendation = ({ userName }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newRecommendation, setNewRecommendation] = useState({
    movieId: "",
    movieTitle: "",
    posterPath: "",
    recommendationReason: ""
  });

  // Fetch recommendations by username
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/recommendations/user/${userName}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setRecommendations(data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (userName) {
      fetchRecommendations();
    }
  }, [userName]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecommendation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to add recommendations');
        return;
      }
      
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newRecommendation,
          userName
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add recommendation');
      }
      
      const data = await response.json();
      
      // Add new recommendation to the list
      setRecommendations(prev => [data.data, ...prev]);
      
      // Reset form
      setNewRecommendation({
        movieId: "",
        movieTitle: "",
        posterPath: "",
        recommendationReason: ""
      });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="recommendation-loading">Loading recommendations...</div>;
  if (error) return <div className="recommendation-error">Error: {error}</div>;

  return (
    <div className="recommendation-container">
      <h2>Recommendations for {userName}</h2>
      
      {/* Add Recommendation Form */}
      <div className="recommendation-form-container">
        <h3>Add a Recommendation</h3>
        <form onSubmit={handleSubmit} className="recommendation-form">
          <div className="form-group">
            <label htmlFor="movieId">Movie ID:</label>
            <input
              type="number"
              id="movieId"
              name="movieId"
              value={newRecommendation.movieId}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="movieTitle">Movie Title:</label>
            <input
              type="text"
              id="movieTitle"
              name="movieTitle"
              value={newRecommendation.movieTitle}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="posterPath">Poster Path:</label>
            <input
              type="text"
              id="posterPath"
              name="posterPath"
              value={newRecommendation.posterPath}
              onChange={handleInputChange}
              placeholder="/path/to/poster.jpg"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="recommendationReason">Why do you recommend this movie?</label>
            <textarea
              id="recommendationReason"
              name="recommendationReason"
              value={newRecommendation.recommendationReason}
              onChange={handleInputChange}
              required
              rows="4"
            ></textarea>
          </div>
          
          <button type="submit" className="recommendation-submit-btn">Add Recommendation</button>
        </form>
      </div>
      
      {/* Recommendations List */}
      <div className="recommendations-list">
        <h3>All Recommendations</h3>
        
        {recommendations.length === 0 ? (
          <p>No recommendations yet. Be the first to recommend a movie!</p>
        ) : (
          recommendations.map(rec => (
            <div key={rec._id} className="recommendation-card">
              {rec.posterPath && (
                <img 
                  src={`https://image.tmdb.org/t/p/w200${rec.posterPath}`} 
                  alt={rec.movieTitle} 
                  className="recommendation-poster"
                />
              )}
              
              <div className="recommendation-details">
                <h4>{rec.movieTitle}</h4>
                <p className="recommendation-reason">"{rec.recommendationReason}"</p>
                <p className="recommendation-date">
                  Recommended on {new Date(rec.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Recommendation;