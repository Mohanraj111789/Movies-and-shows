import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return <footer>
    <div className = "text-center">
      <p>&copy; {new Date().getFullYear()} Movie Hunt. All rights reserved.</p>
    </div>
  </footer>;
};

export default Footer;
