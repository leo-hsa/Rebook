// src/pages/AuthorPage.jsx

import React, { useState, useEffect } from "react"; // Импортируем React и хуки
import axios from "axios"; // Для HTTP-запросов
import { useNavigate } from "react-router-dom"; // Для навигации
import { toast } from "react-toastify"; // Для уведомлений
import { UserGroupIcon, ArrowPathIcon } from '@heroicons/react/24/outline'; // Иконки


// URL вашего API
const API_URL = "http://localhost:8000";

const AuthorPage = () => {
    // Состояние для хранения списка авторов
    const [authors, setAuthors] = useState([]);
    // Состояние для отслеживания загрузки
    const [loading, setLoading] = useState(true);
    // Состояние для хранения ошибки
    const [error, setError] = useState("");
    // Хук для навигации
    const navigate = useNavigate();

    // Функция для загрузки авторов с API
    const fetchAuthors = async () => {
        setLoading(true); // Начинаем загрузку
        setError(""); // Сбрасываем предыдущие ошибки
        try {
            const response = await axios.get(`${API_URL}/authors/`); // Запрос к эндпоинту авторов
            // Проверяем, что получили массив
            if (Array.isArray(response.data)) {
                // Сортируем авторов по имени (опционально, но удобно)
                const sortedAuthors = response.data.sort((a, b) =>
                    (a.name || "").localeCompare(b.name || "")
                );
                setAuthors(sortedAuthors);
            } else {
                console.error("API /authors/ did not return an array:", response.data);
                setError("Failed to load authors: Invalid data format.");
                toast.error("Received invalid data for authors.");
            }
        } catch (err) {
            console.error("Error fetching authors:", err.response?.data || err.message);
            const errorMsg = err.response?.data?.detail || "Failed to load authors list.";
            setError(errorMsg);
            toast.error(errorMsg); // Показываем ошибку пользователю
        } finally {
            setLoading(false); // Завершаем загрузку в любом случае
        }
    };

    // Используем useEffect для вызова fetchAuthors при монтировании компонента
    useEffect(() => {
        fetchAuthors();
        // Пустой массив зависимостей означает, что эффект выполнится один раз
    }, []);

    // Обработчик клика по карточке автора
    const handleAuthorClick = (authorName) => {
        // Переходим на страницу магазина (/shop) и добавляем параметр author_name в URL
        navigate(`/shop?author_name=${encodeURIComponent(authorName)}`);
    };

    return (
        <div className="flex flex-col min-h-screen"> {/* Обертка для прижатия футера */}
     

            {/* Основной контент страницы */}
            <main className="flex-grow bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    {/* Заголовок страницы */}
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 flex items-center justify-center">
                        <UserGroupIcon className="h-8 w-8 mr-3 text-indigo-600" />
                        Our Authors
                    </h1>

                    {/* Отображение состояния Загрузка / Ошибка / Список */}
                    {loading ? (
                         <div className="text-center py-20">
                             {/* Спиннер загрузки */}
                             <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                             <p className="text-gray-500 text-sm mt-4">Loading authors...</p>
                         </div>
                    ) : error ? (
                        <div className="text-center py-16 bg-white rounded-lg shadow border border-red-200 p-6 max-w-md mx-auto">
                             <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Authors</h2>
                            <p className="text-red-500 mb-6">{error}</p>
                            <button
                                onClick={fetchAuthors} // Кнопка для повторной попытки
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <ArrowPathIcon className="h-4 w-4 mr-2" />
                                Try Again
                            </button>
                        </div>
                    ) : authors.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-lg shadow p-6">
                            <UserGroupIcon className="mx-auto h-16 w-16 text-gray-300" />
                            <p className="mt-5 text-xl font-semibold text-gray-700">No authors found</p>
                            <p className="mt-2 text-sm text-gray-500">We couldn't find any authors at the moment.</p>
                        </div>
                    ) : (
                        // Сетка для отображения авторов
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                            {authors.map((author) => (
                                // Проверяем наличие имени автора перед рендерингом
                                author && author.name ? (
                                    // Карточка автора - делаем ее кликабельной
                                    <div
                                        key={author.name} // Используем имя как ключ, если ID не гарантирован схемой AuthorBase
                                        onClick={() => handleAuthorClick(author.name)}
                                        className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 cursor-pointer text-center group"
                                        role="button" // Для доступности
                                        tabIndex={0} // Для доступности с клавиатуры
                                        onKeyPress={(e) => e.key === 'Enter' && handleAuthorClick(author.name)} // Для доступности с клавиатуры
                                    >
                                        {/* Можно добавить иконку автора */}
                                        {/* <UserCircleIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" /> */}
                                        <p className="text-base font-semibold text-gray-800 group-hover:text-indigo-600 truncate" title={author.name}>
                                            {author.name}
                                        </p>
                                        {/* Можно добавить author.info, если оно есть */}
                                        {/* {author.info && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{author.info}</p>} */}
                                    </div>
                                ) : null // Пропускаем рендеринг, если нет имени
                            ))}
                        </div>
                    )}
                </div>
            </main>

            
        </div>
    );
};

export default AuthorPage;

// Рекомендуется добавить PropTypes для лучшей проверки
// import PropTypes from 'prop-types';
// AuthorPage.propTypes = {
//    // Определите пропсы, если они будут
// };