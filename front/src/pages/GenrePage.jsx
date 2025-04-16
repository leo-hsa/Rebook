// src/pages/GenrePage.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { TagIcon, ArrowPathIcon } from '@heroicons/react/24/outline';


const API_URL = "http://localhost:8000";
const GENRE_IMG_PREFIX = "/static/images/genres/"; // <-- Убедитесь, что путь верный

const GenrePage = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGenres = async () => {
      setLoading(true); setError(""); console.log("%c[GenrePage] Fetching genres...", "color: blue;");
      try {
        const response = await axios.get(`${API_URL}/genres/`); console.log("%c[GenrePage] API Response:", "color: green;", response);
        if (Array.isArray(response.data)) {
           const sortedGenres = response.data.sort((a, b) => (a.name || "").localeCompare(b.name || "")); console.log("%c[GenrePage] Processed genres data:", "color: purple;", sortedGenres); setGenres(sortedGenres);
        } else { console.error("[GenrePage] API /genres/ did not return an array:", response.data); setError("Failed to load genres: Invalid data format."); toast.error("Received invalid data for genres."); setGenres([]); }
      } catch (err) { console.error("[GenrePage] Ошибка при загрузке жанров:", err.response?.data || err.message, err); const errorMsg = err.response?.data?.detail || "Failed to load genres."; setError(errorMsg); toast.error(errorMsg); setGenres([]);
      } finally { console.log("%c[GenrePage] Setting loading to false", "color: orange;"); setLoading(false); }
    };
    fetchGenres();
  }, []);

  const handleGenreClick = (genreName) => {
    navigate(`/?genre_name=${encodeURIComponent(genreName)}`);
    console.log(`[GenrePage] Navigating to shop with genre: ${genreName}`);
  };

  console.log("%c[GenrePage] Rendering component. State:", "color: brown;", { loading, error, genresLength: genres?.length });

  return (
    <div className="flex flex-col min-h-screen">

        <main className="flex-grow bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-8 flex items-center justify-center"> <TagIcon className="h-8 w-8 mr-3 text-indigo-600" /> Explore Genres </h1>
                {loading ? ( /* ... spinner ... */ <div className="text-center py-20"> <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> <p className="text-gray-500 text-sm mt-4">Loading genres...</p> </div>
                ) : error ? ( /* ... error message ... */ <div className="text-center py-16 bg-white rounded-lg shadow border border-red-200 p-6 max-w-md mx-auto"> <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Genres</h2> <p className="text-red-500 mb-6">{error}</p> </div>
                ) : genres.length === 0 ? ( /* ... no genres ... */ <div className="text-center py-16 bg-white rounded-lg shadow p-6"> <TagIcon className="mx-auto h-16 w-16 text-gray-300" /> <p className="mt-5 text-xl font-semibold text-gray-700">No genres found</p> <p className="mt-2 text-sm text-gray-500">We couldn't find any genres at the moment.</p> </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {genres.map((genre, index) => {
                             console.log(`%c[GenrePage] Processing genre index ${index}:`, "color: darkcyan;", genre);
                             if (!genre || typeof genre.id === 'undefined' || !genre.name) { console.warn(`[GenrePage] Skipping genre at index ${index} due to missing id or name. Data:`, genre); return null; }

                             const placeholderUrl = "https://placehold.co/300x200/EFEFEF/AAAAAA?text=No+Image";
                             let imgSrc = placeholderUrl;
                             if (genre.img) { if (genre.img.startsWith('http')) { imgSrc = genre.img; } else if (genre.img.startsWith('/')) { imgSrc = `${API_URL}${genre.img}`; } else { imgSrc = `${API_URL}${GENRE_IMG_PREFIX}${genre.img}`; } }
                             console.log(`%c[GenrePage] > Calculated imgSrc for ${genre.name}: ${imgSrc}`, "color: lightgray;");

                              return (
                                <div
                                    key={genre.id}
                                    className="relative aspect-video sm:aspect-square cursor-pointer overflow-hidden rounded-lg shadow-md group transition-transform duration-300 ease-in-out hover:scale-105 bg-gray-200" // Добавил светлый фон по умолчанию
                                    onClick={() => handleGenreClick(genre.name)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyPress={(e) => e.key === 'Enter' && handleGenreClick(genre.name)}
                                    // style={{ backgroundColor: '#333' }} // <-- УДАЛЕНО
                                >
                                    <img
                                        src={imgSrc}
                                        alt={genre.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-60"
                                        onError={(e) => { console.error(`[GenrePage] Ошибка загрузки изображения для ${genre.name}: ${imgSrc}`, e); e.target.src = placeholderUrl; e.target.style.opacity = '0.5'; e.target.alt = `${genre.name} (Image not found)`; }}
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:bg-black/40 transition-colors duration-300 flex items-end justify-center p-2"> {/* Изменил оверлей на градиент снизу */}
                                        <h2 className="text-white text-sm md:text-base font-semibold text-center pb-1"> {genre.name} </h2> {/* Убрал тень, т.к. есть фон */}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
   
    </div>
  );
}

export default GenrePage;