import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../utils/api";
import "../styles/Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      // Validate password length
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        setIsLoading(false);
        return;
      }

      // Call the signup API
      const response = await authAPI.signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      
      if (response.success) {
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('loginStatusChanged'));
        
        // Redirect to home page
        navigate("/");
      } else {
        setError(response.message || "Signup failed");
      }
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setIsLoading(true);
      
      // Call the guest login API
      const response = await authAPI.guestLogin();
      
      if (response.success) {
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('loginStatusChanged'));
        
        // Redirect to home page
        navigate("/");
      } else {
        setError(response.message || "Guest login failed");
      }
    } catch (err) {
      setError(err.message || "Guest login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <Link to="/" className="back-button">
            ← Back to Home
          </Link>
          <h1>Create Account</h1>
          <p>Join Movie Hunt and start your movie journey</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                className="form-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
                className="form-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input type="checkbox" required />
              <span className="checkmark"></span>
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>

          <button
            type="submit"
            className="signup-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="guest-login-btn"
            onClick={handleGuestLogin}
            disabled={isLoading}
          >
            Continue as Guest
          </button>

          <div className="login-link">
            Already have an account?{" "}
            <Link to="/login" className="login-text">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup; 