import React from "react";
import "../styles/GenreFilter.css";

const GenreFilter = ({ genres, selectedGenre, onGenreSelect, loading }) => {
  if (loading || !genres || genres.length === 0) {
    return <div className="genre-filter-loading">Loading genres...</div>;
  }

  return (
    <div className="genre-filter-container">
      <h3 className="genre-filter-title">Filter by Genre</h3>
      <div className="genre-buttons">
        <button
          className={`genre-button ${!selectedGenre ? 'active' : ''}`}
          onClick={() => onGenreSelect(null)}
        >
          All Genres
        </button>
        {genres.map((genre) => (
          <button
            key={genre.id}
            className={`genre-button ${selectedGenre === genre.id ? 'active' : ''}`}
            onClick={() => onGenreSelect(genre.id)}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenreFilter; 