import React, { useEffect, useState } from "react";
import "../styles/Movielist.css";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import useFetch from "../hooks/useFetch"; // Make sure this import exists

const Movielist = ({ title, apiPath }) => {
  const { data: movies, loading, error } = useFetch(apiPath); // Removed curly braces from apiPath

  const [userName, setUserName] = useState(localStorage.getItem("userName") || "Guest");
  const [greeting, setGreeting] = useState("");

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
  }, [title]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main>
      <div className="movie-container">
        {title === "Home" && (
          <div className="greeting-section">
            <h1 className="greeting-text">
              {greeting}, {userName}! 👋
            </h1>
            <p className="welcome-text">
              {userName === "Guest"
                ? "Sign in to personalize your movie experience"
                : "Welcome back to your movie journey"}
            </p>
            <button
              className="gradient-button"
              onClick={() => {
                navigator("/movies/upcoming");
              }}
            >
              Explore now
            </button>
          </div>
        )}

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
