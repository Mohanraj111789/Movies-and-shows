import { useState, useEffect } from 'react';

const useFetch = (apiPath, query = "") => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = "61db8a0327aff8a8e4b9fe5b53623000";
  const BASE_URL = "https://api.themoviedb.org/3";

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const url = query
          ? `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
          : `${BASE_URL}/${apiPath}?api_key=${API_KEY}&language=en-US&page=1`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch movies');
        }

        const json = await response.json();
        setData(json.results);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (apiPath) {
      fetchMovies();
    }
  }, [apiPath, query]);

  return { data, loading, error };
};

export default useFetch;