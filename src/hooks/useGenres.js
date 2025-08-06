import { useState, useEffect } from 'react';

const useGenres = () => {
  const [genres, setGenres] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = "61db8a0327aff8a8e4b9fe5b53623000";
  const BASE_URL = "https://api.themoviedb.org/3";

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch genres');
        }

        const data = await response.json();
        const genresMap = {};
        
        data.genres.forEach(genre => {
          genresMap[genre.id] = genre.name;
        });
        
        setGenres(genresMap);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  const getGenreNames = (genreIds) => {
    if (!genreIds || !Array.isArray(genreIds)) return [];
    return genreIds
      .map(id => genres[id])
      .filter(name => name) // Remove undefined values
      .slice(0, 3); // Limit to 3 genres to avoid overcrowding
  };

  return { genres, loading, error, getGenreNames };
};

export default useGenres; 