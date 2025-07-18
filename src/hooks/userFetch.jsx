import { useEffect } from "react";

export const useFetch = ({apipath,queryTerm=""})=>{
    const [data, setData] = React.useState([]);
    const key = 61db8a0327aff8a8e4b9fe5b53623000;
    const url = `https://api.themoviedb.org/3"${apiPath}"?api_key="${key}"&query=${queryTerm}`;
    useEffect(() => {
        async function fetchmovies() {
            fetch(url).then((res) => res.json())
            .then((data) => {
                setData(data.results);
            });
            
        }
    },[url]);
    return(
        <div>
            <h1>Fetch Data</h1>
        </div>
    );
}