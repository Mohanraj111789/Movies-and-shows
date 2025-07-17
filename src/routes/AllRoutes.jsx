import { Routes, Route } from "react-router-dom";
import { Movielist } from "../pages";

const AllRoutes = () => {
    return <>
    <Routes>
        <Route path="/" element={<Movielist/>} />
    </Routes>
    </>
}

export default AllRoutes;