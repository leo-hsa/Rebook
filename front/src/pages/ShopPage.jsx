// src/components/ShopPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000";

const ShopPage = () => {
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState({
    genre_id: "",
    author_id: "",
    year: "",
    title: "",
    sort_by: "date",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token"); // Получаем токен из localStorage
  const navigate = useNavigate();

  // Загрузка книг при изменении фильтров
  useEffect(() => {
    fetchBooks();
  }, [filters]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        )
      ).toString();
      const response = await axios.get(`${API_URL}/shop/?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setBooks(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching books:", err);
      setError("Failed to load books. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Обработка изменения фильтров
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Добавление в избранное
  const addToFavorites = async (bookId) => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await axios.post(`${API_URL}/shop/favorites/${bookId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBooks(); // Обновляем список
    } catch (err) {
      console.error("Error adding to favorites:", err);
      setError("Failed to add to favorites.");
    }
  };

  // Удаление из избранного
  const removeFromFavorites = async (bookId) => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await axios.delete(`${API_URL}/shop/favorites/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBooks(); // Обновляем список
    } catch (err) {
      console.error("Error removing from favorites:", err);
      setError("Failed to remove from favorites.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Фильтры слева */}
      <div className="w-1/4 p-6 bg-white shadow-md">
        <h2 className="text-xl font-bold mb-4">Filters</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Genre ID</label>
            <input
              type="number"
              name="genre_id"
              value={filters.genre_id}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter genre ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Author ID</label>
            <input
              type="number"
              name="author_id"
              value={filters.author_id}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter author ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <input
              type="number"
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
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
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search by title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sort By</label>
            <select
              name="sort_by"
              value={filters.sort_by}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="date">Date</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Список книг справа */}
      <div className="w-3/4 p-6">
        <h1 className="text-2xl font-bold mb-4">Book Shop</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold">{book.title}</h3>
                <p className="text-gray-600">{book.description || "No description"}</p>
                <p className="text-sm text-gray-500">Genre ID: {book.genre_id}</p>
                <p className="text-sm text-gray-500">Author ID: {book.author_id}</p>
                <p className="text-sm text-gray-500">Release Date: {book.release_date}</p>
                <p className="text-sm text-gray-500">Favorites: {book.favorites_count}</p>
                {token && (
                  <button
                    onClick={() =>
                      book.is_favorite ? removeFromFavorites(book.id) : addToFavorites(book.id)
                    }
                    className={`mt-2 w-full p-2 rounded text-white font-medium ${
                      book.is_favorite
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {book.is_favorite ? "Remove from Favorites" : "Add to Favorites"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;