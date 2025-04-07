// src/components/ShopPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types"; // Optional: for type checking

const API_URL = "http://localhost:8000";

const FilterPanel = ({ filters, genres, onFilterChange }) => (
  <div className="w-1/4 p-6 bg-white shadow-md">
    <h2 className="text-xl font-bold mb-4">Filters</h2>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Genre</label>
        <select
          name="genre_name"
          value={filters.genre_name}
          onChange={onFilterChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.name}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Author</label>
        <input
          type="text"
          name="author_name"
          value={filters.author_name}
          onChange={onFilterChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Search by author name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Year</label>
        <input
          type="number"
          name="year"
          value={filters.year}
          onChange={onFilterChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter year"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          name="title"
          value={filters.title}
          onChange={onFilterChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Search by title"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Sort By</label>
        <select
          name="sort_by"
          value={filters.sort_by}
          onChange={onFilterChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="date">Date</option>
          <option value="popularity">Popularity</option>
        </select>
      </div>
    </div>
  </div>
);

const BookCard = ({ book, token, onAddToFavorites, onRemoveFromFavorites }) => (
  <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <img
      src={`${API_URL}${book.img}`}
      alt={`${book.title} cover`}
      className="w-full h-48 object-cover rounded-md mb-4"
      onError={(e) => {
        console.error(`Failed to load image for ${book.title}: ${book.img}`);
        e.target.src = "https://via.placeholder.com/150?text=No+Cover";
      }}
    />
    <h3 className="text-lg font-semibold">{book.title}</h3>
    <p className="text-sm text-gray-500">{book.author_name}</p>
    {token && (
      <button
        onClick={() => (book.is_favorite ? onRemoveFromFavorites(book.id) : onAddToFavorites(book.id))}
        className={`mt-2 w-full p-2 rounded text-white font-medium ${
          book.is_favorite ? "bg-red-500 hover:bg-red-600" : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {book.is_favorite ? "Remove from Favorites" : "Add to Favorites"}
      </button>
    )}
  </div>
);

const ShopPage = () => {
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState({
    genre_name: "",
    author_name: "",
    year: "",
    title: "",
    sort_by: "date",
  });
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.entries(filters).filter(([, value]) => value !== "")
      ).toString();
      const response = await axios.get(`${API_URL}/shop/?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setBooks(response.data);
      setError("");
    } catch (err) {
      setError("Failed to load books. Please try again.");
      console.error("Fetch books error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, token]);

  const fetchGenresAndAuthors = useCallback(async () => {
    try {
      const [genreResponse, authorResponse] = await Promise.all([
        axios.get(`${API_URL}/shop/genres/`),
        axios.get(`${API_URL}/shop/authors/`),
      ]);
      setGenres(genreResponse.data);
      setAuthors(authorResponse.data);
    } catch (err) {
      setError("Failed to load genres or authors.");
      console.error("Fetch genres/authors error:", err);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    fetchGenresAndAuthors();
  }, [fetchGenresAndAuthors]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const addToFavorites = async (bookId) => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await axios.post(`${API_URL}/shop/favorites/${bookId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBooks();
    } catch (err) {
      setError(`Failed to add to favorites: ${err.response?.data?.detail || err.message}`);
      console.error("Add to favorites error:", err);
    }
  };

  const removeFromFavorites = async (bookId) => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await axios.delete(`${API_URL}/shop/favorites/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBooks();
    } catch (err) {
      setError(`Failed to remove from favorites: ${err.response?.data?.detail || err.message}`);
      console.error("Remove from favorites error:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <FilterPanel filters={filters} genres={genres} onFilterChange={handleFilterChange} />
      <div className="w-3/4 p-6">
        <h1 className="text-2xl font-bold mb-4">Book Shop</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : books.length === 0 ? (
          <p className="text-gray-600">No books found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                token={token}
                onAddToFavorites={addToFavorites}
                onRemoveFromFavorites={removeFromFavorites}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Optional: PropTypes for type checking
FilterPanel.propTypes = {
  filters: PropTypes.shape({
    genre_name: PropTypes.string,
    author_name: PropTypes.string,
    year: PropTypes.string,
    title: PropTypes.string,
    sort_by: PropTypes.string,
  }).isRequired,
  genres: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    })
  ).isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

BookCard.propTypes = {
  book: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    img: PropTypes.string.isRequired,
    author_name: PropTypes.string.isRequired,
    is_favorite: PropTypes.bool,
  }).isRequired,
  token: PropTypes.string,
  onAddToFavorites: PropTypes.func.isRequired,
  onRemoveFromFavorites: PropTypes.func.isRequired,
};

export default ShopPage;