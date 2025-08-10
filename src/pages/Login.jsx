import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../utils/api";
import "../styles/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      // Call the login API
      const response = await authAPI.login(formData);
      
      if (response.success) {
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('loginStatusChanged'));
        
        // Redirect to home page
        navigate("/");
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
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
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Link to="/" className="back-button">
            ← Back to Home
          </Link>
          <h1>Welcome Back</h1>
          <p>Sign in to your Movie Hunt account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

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

          <div className="form-options">
            <label className="checkbox-container">
              <input type="checkbox" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
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

          <div className="signup-link">
            Don't have an account?{" "}
            <Link to="/signup" className="signup-text">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 