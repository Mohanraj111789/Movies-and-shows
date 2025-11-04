import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Recommendation from "../components/Recommendation";
import "../styles/UserRecommendations.css";

const UserRecommendations = () => {
  const { userName } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // You can create an API endpoint to fetch user data by username if needed
        // For now, we'll just use the username from params
        setUser({ userName });
        setLoading(false);
      } catch (err) {
        setError("Failed to load user data");
        setLoading(false);
      }
    };

    if (userName) {
      fetchUserData();
    }
  }, [userName]);

  if (loading) return <div className="loading-container">Loading user data...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;
  if (!user) return <div className="error-container">User not found</div>;

  return (
    <div className="user-recommendations-page">
      <div className="user-recommendations-header">
        <Link to="/" className="back-button">
          ← Back to Home
        </Link>
        <h1>{user.userName}'s Movie Recommendations</h1>
        <p>Discover movies recommended by {user.userName}</p>
      </div>

      <div className="user-recommendations-content">
        <Recommendation userName={user.userName} />
      </div>
    </div>
  );
};

export default UserRecommendations;