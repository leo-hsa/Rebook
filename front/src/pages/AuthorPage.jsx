import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

const genreBackgrounds = {
    "Fiction": "/img/fiction.jpg",
    "Science Fiction & Fantasy": "/img/scifi.jpg",
    "Detective & Thriller": "/img/detectiv.jpg",
    "Adventure": "/img/adventure.jpg",
    "Art & Culture": "/img/art.jpg",
    "Business & Economics" : "/img/business.jpg",
    "Children’s Books": "img/child.jpg",
    "Classic Literature": "/img/classic.jpg",
    
}

export default function GenrePage(){
    const [genres, setGenres] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:8000/genres")
        .then((response) => setGenres(response.data))
        .catch((error) => console.error("Error fetchimg genres:", error))
    }, []);

    const handleGenreClick = (genreName) => {
        navigate(`/shop`);
    };
    return (

      
          <div className="min-h-screen bg-gray-100 py-12 px-6">
           
        <h1 className="text-center text-3xl font-bold text-gray-900 mb-8">
          Genres
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 ">
          {genres.map((genre) => (
            <div
              key={genre.id}
              className="relative cursor-pointer overflow-hidden rounded-lg hover:grayscale"
              onClick={() => handleGenreClick(genre.name)}
            >
              <img
                src={genreBackgrounds[genre.name] || "/img/fiction.jpg"}
                alt={genre.name}
                className="w-full h-40  "
              />
              <div className="absolute inset-0  flex items-center justify-center">
                <h2 className="text-white text-lg font-semibold text-center">{genre.name}</h2>
              </div>
            </div>
          ))}
        </div>

        
      </div>
      
    );
};
