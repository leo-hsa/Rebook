// src/components/FavoritesPage.jsx
import React, { useState, useEffect, useCallback } from "react"; // Добавили useCallback
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // Добавили Link
import { toast } from "react-toastify"; // Добавили toast
import { TrashIcon, HeartIcon, ArrowLeftIcon, BookOpenIcon } from '@heroicons/react/24/outline'; // Иконки

// URL вашего API
const API_URL = "http://localhost:8000";
// Убираем COVER_API_URL, будем использовать путь из API

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true); // Начинаем с true
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Функция для загрузки избранного
  const fetchFavorites = useCallback(async () => {
    // Не устанавливаем loading здесь, чтобы избежать мигания при удалении
    setError(""); // Сбрасываем ошибку
    try {
      const response = await axios.get(`${API_URL}/shop/favorites/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) {
        setFavorites(response.data);
      } else {
        console.error("API /shop/favorites/ did not return an array:", response.data);
        setFavorites([]);
        setError("Failed to load favorites: Invalid data format.");
      }
    } catch (err) {
      console.error("Error fetching favorites:", err.response?.data || err.message);
      setError("Failed to load favorites. Please try again later.");
      setFavorites([]);
    } finally {
      setLoading(false); // Убираем индикатор загрузки
    }
  }, [token]); // Зависим от token

  // Загрузка избранного при монтировании
  useEffect(() => {
    if (!token) {
      toast.info("Please log in to view your favorites.");
      navigate("/login");
      return;
    }
    fetchFavorites();
    // Добавляем fetchFavorites в зависимости
  }, [token, navigate, fetchFavorites]);

  // Функция удаления из избранного
  const removeFromFavorites = async (bookId) => {
    if (!token) return;
    // Сохраняем текущее состояние на случай ошибки
    const previousFavorites = [...favorites];
    // Оптимистичное обновление UI
    setFavorites(prev => prev.filter(book => book.id !== bookId));
    try {
      await axios.delete(`${API_URL}/shop/favorites/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Removed from favorites.", { autoClose: 2000 });
      // Не вызываем fetchFavorites(), так как UI уже обновлен
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Failed to remove from favorites.";
      console.error("Error removing from favorites:", err.response?.data || err.message);
      setError(errorMsg); // Показываем ошибку
      toast.error(errorMsg);
      // Откатываем изменение UI при ошибке
      setFavorites(previousFavorites);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="container mx-auto max-w-4xl"> {/* Ограничиваем ширину */}

        {/* Заголовок и кнопка "Назад" */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <HeartIcon className="h-8 w-8 mr-3 text-red-500" /> {/* Иконка избранного */}
            My Favorites
          </h1>
          {/* Используем Link вместо <a> */}
          <Link
             to="/" // Или /shop
             className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
             <ArrowLeftIcon className="h-4 w-4 mr-2" />
             Back to Shop
          </Link>
        </div>

        {/* Сообщение об ошибке (стилизованное) */}
        {error && (
           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
                {/* Кнопка закрытия сообщения об ошибке */}
                <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError("")}>
                    <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </span>
            </div>
        )}

        {/* Состояние загрузки */}
        {loading ? (
          <div className="text-center py-10">
             <p className="text-gray-600 text-lg animate-pulse">Loading your favorites...</p>
          </div>
        // Сообщение о пустом избранном
        ) : favorites.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow">
             <BookOpenIcon className="mx-auto h-16 w-16 text-gray-400" /> {/* Иконка книги */}
             <p className="mt-4 text-lg text-gray-600">No favorite books yet.</p>
             <p className="text-sm text-gray-500">Add some books you love from the shop!</p>
             <Link
               to="/"
               className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
             >
               Browse Books
             </Link>
           </div>
        // Отображение списка избранных книг
        ) : (
          // Используем grid, как в оригинале, но с улучшенными карточками
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((book) => (
              // Карточка избранной книги
              <div
                key={book.id} // Ключ обязателен
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col" // flex flex-col для управления высотой
              >
                {/* Используем Link для перехода на страницу книги */}
                <Link to={`/book/${book.id}`} className="block group">
                  {/* Изображение */}
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      // Используем img из ответа API и API_URL
                      src={book.img ? (book.img.startsWith('http') ? book.img : `${API_URL}${book.img}`) : "https://via.placeholder.com/150?text=No+Cover"}
                      alt={`${book.title} cover`}
                      className="w-auto h-full object-contain group-hover:scale-105 transition-transform duration-300" // object-contain и hover-эффект
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Cover'; }}
                      loading="lazy"
                    />
                  </div>
                  {/* Текстовая информация */}
                  <div className="p-4 flex-grow"> {/* flex-grow чтобы текст занимал доступное место */}
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 line-clamp-2 mb-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-1 mb-1">
                      by {book.author_name || "Unknown Author"}
                    </p>
                    <p className="text-xs text-gray-400 line-clamp-1">
                      Genre: {book.genre_name || "N/A"}
                    </p>
                    {/* Убираем лишние детали (description, favorites_count, release_date) */}
                  </div>
                </Link>
                {/* Кнопка удаления (вне Link) */}
                <div className="p-4 pt-0 mt-auto"> {/* mt-auto прижимает кнопку вниз */}
                   <button
                        onClick={() => removeFromFavorites(book.id)}
                        className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        aria-label={`Remove ${book.title} from favorites`}
                    >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Remove
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;