// src/components/FavoritesPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchFavorites();
  }, [token, navigate]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/shop/favorites/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching favorites:", err.response?.data || err.message);
      setError("Failed to load favorites. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (bookId) => {
    try {
      await axios.delete(`${API_URL}/shop/favorites/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFavorites(); 
    } catch (err) {
      console.error("Error removing from favorites:", err.response?.data || err.message);
      setError(`Failed to remove book ${bookId} from favorites: ${err.response?.data?.detail || err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Favorites</h1>
        <a href="/shop" className="text-indigo-600 hover:underline">
          Back to Shop
        </a>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : favorites.length === 0 ? (
        <p className="text-gray-600">You haven't added any books to favorites yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((book) => (
            <div
              key={book.id}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold">{book.title}</h3>
              <p className="text-sm text-gray-500">Genre ID: {book.genre_id}</p>
              <p className="text-sm text-gray-500">Author ID: {book.author_id}</p>
              <p className="text-sm text-gray-500">Release Date: {book.release_date}</p>
              <p className="text-sm text-gray-500">Favorites: {book.favorites_count}</p>
              <button
                onClick={() => removeFromFavorites(book.id)}
                className="mt-2 w-full p-2 rounded text-white font-medium bg-red-500 hover:bg-red-600"
              >
                Remove from Favorites
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;