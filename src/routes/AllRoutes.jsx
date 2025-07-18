import { Routes, Route } from "react-router-dom";
import { Movielist, MovieDetails, Search, PageNotFound } from "../pages";

const AllRoutes = () => {
    return <>
    <Routes>
        <Route path="/" element={<Movielist title="Home" apiPath="movie/now_playing"/>} />
        <Route path="/movie/:id" element={<MovieDetails title="Movie Detail" apiPath={`movie/{id}`}/>} />
        <Route path="/movies/popular" element={<Movielist title="Popular" apiPath="movie/popular"/>} />
        <Route path="/movies/top" element={<Movielist title="Top Rated" apiPath="movie/top_rated"/>} />
        <Route path="/movies/upcoming" element={<Movielist title="Upcoming" apiPath="movie/upcoming"/>} />
        <Route path="/search" element={<Search title="Search Results"/>} />
        <Route path="*" element={<PageNotFound title="Page Not Found"/>} />
    </Routes>
    </>
} 

export default AllRoutes;