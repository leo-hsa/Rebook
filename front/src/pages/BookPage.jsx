import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:8000";

const BookPage = () => {
  const { book_id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/shop/book/${book_id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setBook(response.data);
      } catch (err) {
        toast.error("Failed to load book details. Please try again.", {
          position: "bottom-right",
        });
        console.error("Fetch book error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [book_id, token]);

  const addToFavorites = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await axios.post(
        `${API_URL}/shop/favorites/${book_id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBook((prev) => ({ ...prev, is_favorite: true }));
      toast.success("Added to favorites!", { position: "bottom-right" });
    } catch (err) {
      toast.error(
        `Failed to add to favorites: ${err.response?.data?.detail || err.message}`,
        { position: "bottom-right" }
      );
      console.error("Add to favorites error:", err);
    }
  };

  const removeFromFavorites = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await axios.delete(`${API_URL}/shop/favorites/${book_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBook((prev) => ({ ...prev, is_favorite: false }));
      toast.success("Removed from favorites!", { position: "bottom-right" });
    } catch (err) {
      toast.error(
        `Failed to remove from favorites: ${err.response?.data?.detail || err.message}`,
        { position: "bottom-right" }
      );
      console.error("Remove from favorites error:", err);
    }
  };

  const addToBasket = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await axios.post(
        `${API_URL}/shop/basket/${book_id}`,
        { quantity: 1 },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Added to basket!", { position: "bottom-right" });
    } catch (err) {
      toast.error(
        `Failed to add to basket: ${err.response?.data?.detail || err.message}`,
        { position: "bottom-right" }
      );
      console.error("Add to basket error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Book not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden flex">
        {/* Image Section */}
        <div className="w-1/2 p-8 flex items-center justify-center bg-gray-50">
          <img
            src={`${API_URL}${book.img}`}
            alt={`${book.title} cover`}
            className="max-w-full max-h-[500px] object-contain rounded-lg"
            onError={(e) => {
              console.error(`Failed to load image for ${book.title}: ${book.img}`);
              e.target.src = "https://via.placeholder.com/300?text=No+Cover";
            }}
          />
        </div>

        {/* Details Section */}
        <div className="w-1/2 p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {book.title}
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              by {book.author_name}
            </p>
            <p className="text-gray-700 mb-6 leading-relaxed">
              {book.description || "No description available."}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Release Date: {book.release_date || "Unknown"}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Genre: {book.genre_name}
            </p>
            <p className="text-lg font-semibold text-indigo-600 mb-6">
              Price: {book.price.toFixed(2)} ₸
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={addToBasket}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Add to Basket
            </button>
            {token && (
              <button
                onClick={book.is_favorite ? removeFromFavorites : addToFavorites}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  book.is_favorite
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {book.is_favorite ? "Remove from Favorites" : "Add to Favorites"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookPage;