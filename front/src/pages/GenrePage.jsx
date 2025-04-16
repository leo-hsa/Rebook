import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

const API_URL = "http://localhost:8000";

export default function GenrePage() {
  const [genres, setGenres] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_URL}/genres`)
      .then((response) => setGenres(response.data))
      .catch((error) => console.error("Ошибка при загрузке жанров:", error));
  }, []);

  const handleGenreClick = (genreName) => {
    navigate(`/shop?genre_name=${encodeURIComponent(genreName)}`);
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
              src={
                genre.img
                  ? `${API_URL}/static/images/genres/${genre.img}`
                  : "https://via.placeholder.com/150?text=No+Image"
              }
              alt={genre.name}
              className="w-full h-40 object-cover"
              onError={(e) => {
                console.error(`Ошибка загрузки изображения для ${genre.name}`);
                e.target.src = "https://via.placeholder.com/150?text=No+Image";
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-white text-lg font-semibold text-center">
                {genre.name}
              </h2>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}