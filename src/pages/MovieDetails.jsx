import React, { useEffect, useState } from "react";

const MovieDetails = () => {
  const [data, setData] = useState(null);

  const url = "https://api.themoviedb.org/3/movie/12345?61db8a0327aff8a8e4b9fe5b53623000"; // Replace with actual movie ID/API key

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    }

    fetchMovies();
  }, [url]);

  return (
    <main className="movie-details">
      <h5>{MovieDetails.title}</h5>
      {data ? (
        <div className="movie-details-content">
          <img
            src={`https://image.tmdb.org/t/p/original${data.poster_path}`}
            alt={data.title}
            className="movie-details-img"
          />
          <h3>{data.title}</h3>
          <p>Release Date: {data.release_date}</p>
          <p>Genre: {/* Add genre data if available */}</p>
          <p className="text-overflow">{data.overview}</p>
          <p>Rating: {data.vote_average}</p>
          <p>Popularity: {data.popularity}</p>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </main>
  );
};

export default MovieDetails;
