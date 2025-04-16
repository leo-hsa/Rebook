import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'; // Закрашенное сердце
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline'; // Контур сердца
import { ShoppingCartIcon } from '@heroicons/react/24/outline'; // Иконка корзины (опционально)

const API_URL = "http://localhost:8000";

const BookCard = ({ book, token, onAddToFavorites, onRemoveFromFavorites, onAddToCart }) => (
    // Обертка Link остается
    <Link to={`/book/${book.id}`} className="block group h-full">
        {/* Добавляем relative для позиционирования иконки сердца */}
        <div className="relative bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow w-full flex flex-col items-center text-center h-full">

            {/* Иконка сердца (только для залогиненных пользователей) */}
            {token && (
                <button
                    onClick={(e) => {
                        e.preventDefault(); // Предотвращаем переход по ссылке
                        e.stopPropagation(); // Останавливаем всплытие события до Link
                        book.is_favorite ? onRemoveFromFavorites(book.id) : onAddToFavorites(book.id);
                    }}
                    // Позиционируем в правом верхнем углу
                    className="absolute top-2 right-2 p-1 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 z-10" // z-10 на всякий случай
                    aria-label={book.is_favorite ? `Remove ${book.title} from favorites` : `Add ${book.title} to favorites`}
                    title={book.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'} // Всплывающая подсказка
                >
                    {book.is_favorite ? (
                        <HeartIconSolid className="h-6 w-6 text-red-500" /> // Закрашенное красное
                    ) : (
                        <HeartIconOutline className="h-6 w-6 text-gray-500 group-hover:text-red-400" /> // Контурное, при ховере на карточку - намек на красный
                    )}
                </button>
            )}

            {/* Изображение книги */}
            <img
                src={book.img ? `${API_URL}${book.img}` : "https://via.placeholder.com/144x192?text=No+Cover"}
                alt={`${book.title} cover`}
                // Уменьшим отступ сверху, чтобы иконка сердца не перекрывала сильно
                className="w-36 h-48 object-contain rounded-md mt-4 mb-4 mx-auto flex-shrink-0"
                onError={(e) => {
                    console.error(`Failed to load image for ${book.title}: ${book.img}`);
                    e.target.src = "https://via.placeholder.com/144x192?text=No+Cover";
                }}
                loading="lazy"
            />

            {/* Текстовая информация и кнопка "В корзину" */}
            <div className="flex-grow flex flex-col justify-between w-full mt-2">
                {/* Название и автор */}
                <div className="mb-3"> {/* Увеличили нижний отступ */}
                    <h3 className="text-lg font-semibold line-clamp-2" title={book.title}>{book.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1 mt-1" title={book.author_name}>{book.author_name}</p>
                </div>

                {/* Кнопка "В корзину" (только для залогиненных пользователей) */}
                {token && (
                    <button
                        onClick={(e) => {
                            e.preventDefault(); // Предотвращаем переход по ссылке
                            e.stopPropagation(); // Останавливаем всплытие события до Link
                            onAddToCart(book.id); // Вызываем новую функцию
                        }}
                        aria-label={`Add ${book.title} to cart`}
                        className="mt-auto w-full max-w-[180px] mx-auto p-2 rounded bg-indigo-600 text-white font-medium text-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center space-x-2" // Добавил flex для иконки
                    >
                        <ShoppingCartIcon className="h-4 w-4" /> {/* Опциональная иконка */}
                        <span>В корзину</span>
                    </button>
                )}
            </div>
        </div>
    </Link>
);

// Обновляем PropTypes для BookCard
BookCard.propTypes = {
    book: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        img: PropTypes.string,
        author_name: PropTypes.string.isRequired,
        is_favorite: PropTypes.bool,
    }).isRequired,
    token: PropTypes.string,
    onAddToFavorites: PropTypes.func.isRequired,
    onRemoveFromFavorites: PropTypes.func.isRequired,
    onAddToCart: PropTypes.func.isRequired, // Добавляем новый prop
};

export default BookCard; // Если BookCard в отдельном файле 