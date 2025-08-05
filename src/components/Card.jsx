import React from "react";
import "../styles/Card.css";

const Card = ({ movie }) => {
  const posterUrl = `https://image.tmdb.org/t/p/original${movie.poster_path}`;

  return (
    <div className="card" title={movie.title}>
      <div className="card-content">
        <img src={posterUrl} alt="../public/img.jpg" className="card-img" />

        <h3 className="text-overflow1">{movie.title}</h3>
        <p>Release Date: {movie.release_date}</p>
        
        {movie.genre_ids && movie.genre_ids.length > 0 && movie.genres && (
          <div className="movie-genres">
            <span className="genre-label">Genres:</span>
            <div className="genre-tags">
              {movie.genre_ids.slice(0, 2).map((genreId) => {
                const genre = movie.genres.find(g => g.id === genreId);
                return genre ? (
                  <span key={genreId} className="genre-tag">{genre.name}</span>
                ) : null;
              })}
            </div>
          </div>
        )}
    
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
