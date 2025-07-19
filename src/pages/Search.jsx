import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../components/Card";
import useFetch from "../hooks/useFetch";
import "../styles/Card.css";

const Search = ({ apiPath }) => {
  const [searchParams] = useSearchParams();
  const queryTerm = searchParams.get("q");
  const [searchResults, setSearchResults] = useState([]);

  const { data: movies, loading, error } = useFetch(apiPath, queryTerm);

  useEffect(() => {
    if (movies) {
      setSearchResults(movies);
    }
    document.title = `Movie Hunt - Search Results for "${queryTerm}"`;
  }, [movies, queryTerm]);

  if (!queryTerm)
    return <div className="no-search">Please enter a search term</div>;
  if (loading) return <div className="loading">Searching...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <main className="search-results">

        <h1 className="search-title">
          {searchResults?.length > 0
            ? `Found ${searchResults.length} results for "${queryTerm}"`
            : `No results found for "${queryTerm}"`}
        </h1>
        <div className="card-grid">
          {searchResults?.map((movie) => (
            <Card key={movie.id} movie={movie} />
          ))}
        </div>
    </main>
  );
};

export default Search;
