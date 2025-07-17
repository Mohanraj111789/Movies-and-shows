import React, { useState } from "react";
import "../styles/Header.css"; // Assuming you have a CSS file for styling

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className="navbar">
      <div className="logo">🌟 ColorNav</div>

      <div className="hamburger" onClick={toggleMenu}>
        &#9776;
      </div>

      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Services</a></li>
        <li><a href="#">Portfolio</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
        <div className="search-container">
            <input type="text" placeholder="Search..." />
            <button type="submit">Search</button>
        </div>
      
    </header>
  );
};

export default Header;
