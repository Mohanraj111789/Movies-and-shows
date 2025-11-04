import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import VoiceSearch from "./VoiceSearch";
import VoiceIndicator from "./VoiceIndicator";
import "../styles/Header.css";
import "../index.css";

const Header = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Check login status from localStorage
    const loginStatus = localStorage.getItem("isLoggedIn");
    const user = localStorage.getItem("userName");
    const userData = localStorage.getItem("userData");
    
    setIsLoggedIn(loginStatus === "true");
    setUserName(userData ? JSON.parse(userData).userName : (user || "Guest"));

    // Listen for storage changes (when login/logout happens in other components)
    const handleStorageChange = () => {
      const newLoginStatus = localStorage.getItem("isLoggedIn");
      const newUser = localStorage.getItem("userName");
      const userData = localStorage.getItem("userData");
      
      setIsLoggedIn(newLoginStatus === "true");
      setUserName(userData ? JSON.parse(userData).userName : (newUser || "Guest"));
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events
    window.addEventListener('loginStatusChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginStatusChanged', handleStorageChange);
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
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

  const handleLogin = () => {
    // Navigate to login page
    navigate('/login');
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("userName");
    localStorage.removeItem("isLoggedIn");
    
    // Update state
    setIsLoggedIn(false);
    setUserName("Guest");
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('loginStatusChanged'));
    
    // Redirect to home page
    navigate("/");
  };

  return (
    <>
      <header className="navbar">
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
      <VoiceIndicator isListening={isListening} />
    </>
  );
};

export default Header;
