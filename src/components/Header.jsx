import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import VoiceSearch from "./VoiceSearch";
import VoiceIndicator from "./VoiceIndicator";
import axios from "axios";
import "../styles/Header.css";
import "../index.css";

const Header = () => {
  const navigate = useNavigate();

  // ✅ State
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Guest");

  // ✅ Axios instance with token
  const API = axios.create({
    baseURL: "http://localhost:5000/api",
  });
  API.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // ✅ Fetch user data when logged in
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

  // ✅ On component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("userData");

    if (token) {
      // If we have user data, use it immediately
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserName(user.name || user.userName || "User");
        setIsLoggedIn(true);
      }
      // Then fetch fresh data from DB
      fetchUserData();
    } else {
      setUserName("Guest");
      setIsLoggedIn(false);
    }

    // Listen for login/logout events
    const handleStorageChange = () => {
      const newLoginStatus = localStorage.getItem("isLoggedIn") === "true";
      const newUserData = localStorage.getItem("userData");
      setIsLoggedIn(newLoginStatus);

      if (newUserData) {
        const parsedUser = JSON.parse(newUserData);
        setUserName(parsedUser.name || parsedUser.userName || "User");
      } else {
        setUserName("Guest");
      }
    };

    window.addEventListener("loginStatusChanged", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("loginStatusChanged", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // ✅ Handle search form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMenuOpen(false);
    }
  };

  const handleVoiceInput = (transcript) => {
    setSearchQuery(transcript);
    if (transcript.trim()) {
      navigate(`/search?q=${encodeURIComponent(transcript.trim())}`);
      setMenuOpen(false);
    }
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // ✅ Login / Logout handlers
  const handleLogin = () => navigate("/login");

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setUserName("Guest");

    window.dispatchEvent(new Event("loginStatusChanged"));
    navigate("/");
  };

  return (
    <>
      <header className="navbar">
        {/* ✅ Login/Logout Button */}
        {isLoggedIn ? (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button className="login-btn" onClick={handleLogin}>
            Login
          </button>
        )}

        <Link to="/" className="logo">
          🎬 Movie Hunt
        </Link>

        <div className="hamburger" onClick={toggleMenu}>
          &#9776;
        </div>

        <nav>
          <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/movies/top">Top Rated</Link></li>
            <li><Link to="/movies/popular">Popular</Link></li>
            <li><Link to="/movies/upcoming">Upcoming</Link></li>
            {isLoggedIn && (
              <li><Link to={`/recommendations/${userName}`}>My Recommendations</Link></li>
            )}
          </ul>
        </nav>

        {/* ✅ Search Bar with Voice */}
        <div className="search-container">
          <form onSubmit={handleSubmit}>
            <input
              type="search"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
            <VoiceSearch
              onVoiceInput={handleVoiceInput}
              isListening={isListening}
              setIsListening={setIsListening}
            />
          </form>
        </div>
      </header>

      {/* ✅ Display User Name */}
      <div className="user-info">
        <p className="welcome-text">
          Welcome, <strong>{userName}</strong> 👋
        </p>
      </div>

      <VoiceIndicator isListening={isListening} />
    </>
  );
};

export default Header;
