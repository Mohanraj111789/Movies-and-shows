import React, { useEffect, useState } from "react";
import "../styles/Movielist.css";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import GenreFilter from "../components/GenreFilter";
import useMoviesWithGenres from "../hooks/useMoviesWithGenres";
import axios from "axios"; // ✅ Missing import added

const Movielist = ({ title, apiPath }) => {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const { data: movies, loading, error, genres } = useMoviesWithGenres(apiPath, "", selectedGenre);

  const [userName, setUserName] = useState("Guest");
  const [greeting, setGreeting] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  // ✅ Create axios instance with auth token
  const API = axios.create({
    baseURL: "http://localhost:5000/api",
  });
  API.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // ✅ Greeting logic
  useEffect(() => {
    document.title = `Movie Hunt - ${title}`;

    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Good Morning");
    else if (hour >= 12 && hour < 17) setGreeting("Good Afternoon");
    else if (hour >= 17 && hour < 21) setGreeting("Good Evening");
    else setGreeting("Good Night");
  }, [title]);

  // ✅ Fetch user info from localStorage and MongoDB
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const res = await API.get("/auth/me");
      if (res.data && res.data.success && res.data.user) {
        const user = res.data.user;
        setUserName(user.name || user.userName || "User");
        setIsLoggedIn(true);

        // Update localStorage for reuse
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userData", JSON.stringify(user));
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      // Only clear auth if token is invalid (401/403), not on network errors
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userData");
        setIsLoggedIn(false);
        setUserName("Guest");
      }
      // Otherwise keep the user logged in (network might be temporarily down)
    }
  };

  // ✅ Main mount logic (runs once)
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("userData");

    if (token) {
      // Use cached user if available
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserName(user.name || user.userName || "User");
        setIsLoggedIn(true);
      }
      // Fetch fresh data from DB
      fetchUserData();
    } else {
      // No token, set to guest
      setUserName("Guest");
      setIsLoggedIn(false);
    }

    // ✅ Listen for login/logout events
    const handleAuthChange = () => {
      const newToken = localStorage.getItem("authToken");
      const newUserData = localStorage.getItem("userData");
      
      if (newToken && newUserData) {
        const user = JSON.parse(newUserData);
        setUserName(user.name || user.userName || "User");
        setIsLoggedIn(true);
      } else {
        setUserName("Guest");
        setIsLoggedIn(false);
      }
    };

    window.addEventListener("loginStatusChanged", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("loginStatusChanged", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  // ✅ Handle login navigation
  const handleLogin = () => {
    navigate("/login");
  };

  // ✅ Loading state
  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading movies...</div>
      </div>
    );

  // ✅ Error state
  if (error)
    return (
      <div className="error-container">
        <div className="error-message">Error: {error}</div>
        <button className="retry-button" onClick={() => window.location.reload()}>
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
                onClick={() => navigate("/movies/upcoming")}
              >
                Explore now
              </button>
              {!isLoggedIn && (
                <button className="login-button" onClick={handleLogin}>
                  Login
                </button>
              )}
            </div>
          </div>
        )}

        {/* ✅ Genre Filter Section */}
        <GenreFilter
          genres={genres || []}
          selectedGenre={selectedGenre}
          onGenreSelect={setSelectedGenre}
          loading={loading}
        />

        {/* ✅ Movies Grid */}
        <div className="card-grid">
          {movies && movies.map((movie) => <Card key={movie.id} movie={movie} />)}
        </div>
      </div>
    </main>
  );
};

export default Movielist;
