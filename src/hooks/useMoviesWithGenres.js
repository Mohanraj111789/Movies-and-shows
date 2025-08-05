import { useState, useEffect, useRef } from 'react';

const useMoviesWithGenres = (apiPath, query = "", selectedGenre = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genres, setGenres] = useState([]);
  const [genresLoaded, setGenresLoaded] = useState(false);
  const genresRef = useRef([]);

  const API_KEY = "61db8a0327aff8a8e4b9fe5b53623000";
  const BASE_URL = "https://api.themoviedb.org/3";

  // Fetch genres only once
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const url = `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`;
        const response = await fetch(url);
        if (response.ok) {
          const json = await response.json();
          setGenres(json.genres);
          genresRef.current = json.genres;
          setGenresLoaded(true);
        } else {
          throw new Error('Failed to fetch genres');
        }
      } catch (err) {
        console.error('Failed to fetch genres:', err);
        setError('Failed to load genres');
        setGenresLoaded(true); // Continue without genres
      }
    };

    if (!genresLoaded) {
      fetchGenres();
    }
  }, [genresLoaded]);

  // Fetch movies when dependencies change
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url;
        
        if (query) {
          // Search movies
          url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`;
        } else if (selectedGenre) {
          // Filter by genre
          url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_genres=${selectedGenre}`;
        } else {
          // Regular movie list
          url = `${BASE_URL}/${apiPath}?api_key=${API_KEY}&language=en-US&page=1`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch movies');
        }

        const json = await response.json();
        
        // Add genres to each movie using the ref to avoid dependency issues
        const moviesWithGenres = json.results.map(movie => ({
          ...movie,
          genres: genresRef.current
        }));
        
        setData(moviesWithGenres);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    // Only fetch movies if we have an apiPath or if we're searching/filtering
    if (apiPath || query || selectedGenre !== null) {
      fetchMovies();
    } else {
      setLoading(false);
    }
  }, [apiPath, query, selectedGenre]);

  return { data, loading, error, genres };
};

export default useMoviesWithGenres; 