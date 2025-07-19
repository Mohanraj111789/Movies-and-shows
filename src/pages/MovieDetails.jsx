import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const MovieDetails = ({ title }) => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = "61db8a0327aff8a8e4b9fe5b53623000";
  const API_URL = `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`;

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Movie not found");
        }
        const data = await response.json();
        setMovie(data);
        // Set document title after getting movie data
        document.title = `Movie Hunt - ${data.title}`;
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id, API_URL]); // Added API_URL to dependency array

  const formatRuntime = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!movie) return <div className="no-data">No movie data available</div>;

  return (
    <main className="movie-details container mt-4">
      <h1 className="text-center mb-4">{movie.title}</h1>
      <div className="row">
        <div className="col-md-4">
          <img 
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="img-fluid rounded shadow"
          />
        </div>
        <div className="col-md-8">
          <div className="movie-info">
            <h3>Overview</h3>
            <p>{movie.overview}</p>
            <div className="movie-meta">
              <p><strong>Release Date:</strong> {movie.release_date || 'N/A'}</p>
              <p><strong>Rating:</strong> {movie.vote_average ? `${movie.vote_average}/10` : 'N/A'}</p>
              <p><strong>Runtime:</strong> {formatRuntime(movie.runtime)}</p>
              <p><strong>Genres:</strong> {movie.genres?.length ? movie.genres.map(genre => genre.name).join(", ") : 'N/A'}</p>
              <a
                href={`/movie/${movie.id}`}
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MovieDetails;
