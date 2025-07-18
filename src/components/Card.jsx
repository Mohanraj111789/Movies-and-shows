import React from "react";
import "../styles/Card.css";

const Card = ({ movie }) => {
  const posterUrl = `https://image.tmdb.org/t/p/original${movie.poster_path}`;

  return (
    <div className="card" title={movie.title}>
      <div className="card-content">
        <img src={posterUrl} alt={movie.title} className="card-img" />
        <h3 className="text-overflow1">{movie.title}</h3>
        <p>Release Date: {movie.release_date}</p>
        <p>Genre: {/* Add genre data if available */}</p>
        <p className="text-overflow">{movie.overview}</p>
        <p>Rating: {movie.vote_average}</p>
        <p>Popularity: {movie.popularity}</p>

        {/* Styled <a> as a button */}
        <a
          href={`/movie/${movie.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
        >
          Watch Now
        </a>
      </div>
    </div>
  );
};

export default Card;
