import { useState, useEffect } from 'react';

const API_KEY = '61db8a0327aff8a8e4b9fe5b53623000'; // Replace with your TMDB API key
const BASE_URL = 'https://api.themoviedb.org/3';

const useFetch = (apiPath) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/${apiPath}?api_key=${API_KEY}&language=en-US&page=1`
        );
        if (!response.ok) throw new Error('Network response was not ok');
        
        const json = await response.json();
        setData(json.results || json);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (apiPath) fetchData();
  }, [apiPath]);

  return { data, loading, error };
};

export default useFetch;