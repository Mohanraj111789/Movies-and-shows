import React, { useState } from "react";
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

  return (
    <>
      <header className="navbar">
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
