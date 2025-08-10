import { Routes, Route } from "react-router-dom";
import { Movielist, MovieDetails, Search, PageNotFound } from "../pages";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

const AllRoutes = () => {
    return <>
    <Routes>
        <Route path="/" element={<Movielist title="Home" apiPath="movie/now_playing"/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/movie/:id" element={<MovieDetails apiPath="movie"/>} />
        <Route path="/movies/popular" element={<Movielist title="Popular" apiPath="movie/popular"/>} />
        <Route path="/movies/top" element={<Movielist title="Top Rated" apiPath="movie/top_rated"/>} />
        <Route path="/movies/upcoming" element={<Movielist title="Upcoming" apiPath="movie/upcoming"/>} />
        <Route path="/search" element={<Search apiPath="search/movie"/>} />
        <Route path="*" element={<PageNotFound title="Page Not Found"/>} />
    </Routes>
    </>
}

export default AllRoutes;