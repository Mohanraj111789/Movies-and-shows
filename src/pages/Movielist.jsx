import React, { useEffect, useState } from "react";
import "../styles/Movielist.css";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import GenreFilter from "../components/GenreFilter";
import useMoviesWithGenres from "../hooks/useMoviesWithGenres";

const Movielist = ({ title, apiPath }) => {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const { data: movies, loading, error, genres } = useMoviesWithGenres(apiPath, "", selectedGenre);

  const [userName, setUserName] = useState(localStorage.getItem("userName") || "Guest");
  const [greeting, setGreeting] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigator = useNavigate();

  useEffect(() => {
    document.title = `Movie Hunt - ${title}`;
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good Afternoon");
    } else if (hour >= 17 && hour < 21) {
      setGreeting("Good Evening");
    } else {
      setGreeting("Good Night");
    }

    // Check login status
    const loginStatus = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loginStatus === "true");
  }, [title]);

  const handleLogin = () => {
    // Navigate to login page
    navigator('/login');
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner">Loading movies...</div>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <div className="error-message">Error: {error}</div>
      <button 
        className="retry-button"
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  );

  return (
    <main>
      <div className="movie-container">
        {title === "Home" && (
          <div className="greeting-section">
            <h1 className="greeting-text">
              {greeting}, {userName}! 👋
            </h1>
            <p className="welcome-text">
              {isLoggedIn
                ? "Welcome back to your movie journey"
                : "Sign in to personalize your movie experience"}
            </p>
            <div className="button-group">
              <button
                className="gradient-button"
                onClick={() => {
                  navigator("/movies/upcoming");
                }}
              >
                Explore now
              </button>
              {!isLoggedIn && (
                <button
                  className="login-button"
                  onClick={handleLogin}
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}

        {/* Genre Filter Section */}
        <GenreFilter
          genres={genres || []}
          selectedGenre={selectedGenre}
          onGenreSelect={setSelectedGenre}
          loading={loading}
        />

        <div className="card-grid">
          {movies && movies.map((movie) => (
            <Card key={movie.id} movie={movie} /> // Added movie prop
          ))}
        </div>
      </div>
    </main>
  );
};

export default Movielist;
