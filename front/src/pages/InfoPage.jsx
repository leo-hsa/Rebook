// src/components/HomePage.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const API_URL = "http://localhost:8000";

const FeaturedBookCard = ({ book, onAddToFavorites, token }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <img
      src={`${API_URL}${book.img}`}
      alt={`${book.title} cover`}
      className="w-full h-64 object-cover rounded-md mb-4"
      onError={(e) => {
        e.target.src = "https://via.placeholder.com/300?text=No+Cover";
      }}
    />
    <h3 className="text-xl font-semibold mb-2">{book.title}</h3>
    <p className="text-gray-600 mb-2">{book.author_name}</p>
    <p className="text-sm text-gray-500 line-clamp-3">{book.description}</p>
    {token && (
      <button
        onClick={() => onAddToFavorites(book.id)}
        className="mt-4 w-full p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
      >
        Add to Favorites
      </button>
    )}
  </div>
);

const CategorySection = ({ title, books }) => (
  <div className="mb-12">
    <h2 className="text-2xl font-bold mb-6">{title}</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book) => (
        <div key={book.id} className="bg-white p-4 rounded-lg shadow-md">
          <img
            src={`${API_URL}${book.img}`}
            alt={book.title}
            className="w-full h-40 object-cover rounded-md mb-2"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/150?text=No+Cover";
            }}
          />
          <h3 className="text-lg font-medium">{book.title}</h3>
          <p className="text-sm text-gray-600">{book.author_name}</p>
        </div>
      ))}
    </div>
  </div>
);

const HomePage = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchHomeData = useCallback(async () => {
    setLoading(true);
    try {
      const [featuredResponse, newResponse, popularResponse] = await Promise.all([
        axios.get(`${API_URL}/shop/featured/`),
        axios.get(`${API_URL}/shop/new-releases/`),
        axios.get(`${API_URL}/shop/popular/`),
      ]);
      setFeaturedBooks(featuredResponse.data);
      setNewReleases(newResponse.data);
      setPopularBooks(popularResponse.data);
      setError("");
    } catch (err) {
      setError("Failed to load books. Please try again.");
      console.error("Fetch home data error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const addToFavorites = async (bookId) => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await axios.post(
        `${API_URL}/shop/favorites/${bookId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchHomeData(); // Обновляем данные после добавления
    } catch (err) {
      setError(`Failed to add to favorites: ${err.response?.data?.detail || err.message}`);
      console.error("Add to favorites error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="bg-indigo-600 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Welcome to Our Book Store</h1>
          <p className="text-lg">Discover your next favorite read today!</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : (
          <>
            {/* Featured Books */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Featured Books</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredBooks.map((book) => (
                  <FeaturedBookCard
                    key={book.id}
                    book={book}
                    token={token}
                    onAddToFavorites={addToFavorites}
                  />
                ))}
              </div>
            </section>

            {/* New Releases */}
            <CategorySection title="New Releases" books={newReleases} />

            {/* Popular Books */}
            <CategorySection title="Popular Books" books={popularBooks} />
          </>
        )}
      </div>
    </div>
  );
};

// PropTypes
FeaturedBookCard.propTypes = {
  book: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    img: PropTypes.string.isRequired,
    author_name: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
  token: PropTypes.string,
  onAddToFavorites: PropTypes.func.isRequired,
};

CategorySection.propTypes = {
  title: PropTypes.string.isRequired,
  books: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      img: PropTypes.string.isRequired,
      author_name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default HomePage;