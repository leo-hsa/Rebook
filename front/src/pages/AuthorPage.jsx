// src/pages/AuthorPage.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserGroupIcon, ArrowPathIcon, UserCircleIcon } from '@heroicons/react/24/outline'; // Добавил UserCircleIcon



const API_URL = "http://localhost:8000"; // Ваш URL API

const AuthorPage = () => {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const fetchAuthors = async () => {
        setLoading(true);
        setError("");
        try {
            // Запрос к API для получения списка авторов (ожидаем [{id:..., name:...}, ...])
            const response = await axios.get(`${API_URL}/authors/`);
            if (Array.isArray(response.data)) {
                // Фильтруем, чтобы убедиться в наличии id и name
                const validAuthors = response.data.filter(author => author && typeof author.id !== 'undefined' && author.name);
                // Сортируем по имени
                const sortedAuthors = validAuthors.sort((a, b) =>
                    (a.name || "").localeCompare(b.name || "")
                );
                setAuthors(sortedAuthors);
            } else {
                console.error("API /authors/ did not return a valid array:", response.data);
                throw new Error("Invalid data format received for authors.");
            }
        } catch (err) {
            console.error("Error fetching authors:", err.response?.data || err.message);
            const errorMsg = err.response?.data?.detail || "Failed to load authors list.";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuthors();
    }, []); // Пустой массив зависимостей - выполнить один раз

    // Обработчик клика - навигация на страницу деталей автора
    const handleAuthorClick = (authorId) => {
        if (authorId !== null && typeof authorId !== 'undefined') {
            navigate(`/author/${authorId}`); // Переход по ID
        } else {
            console.warn("Attempted to navigate with invalid author ID:", authorId);
            toast.warn("Could not navigate: Author ID is missing.");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            

            <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 flex items-center justify-center">
                        <UserGroupIcon className="h-8 w-8 mr-3 text-indigo-600" />
                        Our Authors
                    </h1>

                    {/* --- Отображение состояний --- */}
                    {loading ? (
                         <div className="text-center py-20">
                             <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> {/* ... spinner ... */} <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
                             <p className="text-gray-500 text-sm mt-4">Loading authors...</p>
                         </div>
                    ) : error ? (
                        <div className="text-center py-16 bg-white rounded-lg shadow border border-red-200 p-6 max-w-md mx-auto">
                            <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Authors</h2> <p className="text-red-500 mb-6">{error}</p>
                            <button onClick={fetchAuthors} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"> <ArrowPathIcon className="h-4 w-4 mr-2" /> Try Again </button>
                        </div>
                    ) : authors.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-lg shadow p-6">
                            <UserGroupIcon className="mx-auto h-16 w-16 text-gray-300" /> <p className="mt-5 text-xl font-semibold text-gray-700">No authors found</p> <p className="mt-2 text-sm text-gray-500">We couldn't find any authors at the moment.</p>
                        </div>
                    ) : (
                         // --- Сетка Авторов ---
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                            {authors.map((author) => (
                                // Карточка автора
                                <div
                                    key={author.id} // Используем ID автора как ключ
                                    onClick={() => handleAuthorClick(author.id)} // Передаем ID
                                    className="bg-white p-4 py-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all duration-200 cursor-pointer text-center group flex flex-col items-center justify-center"
                                    role="button"
                                    tabIndex={0}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAuthorClick(author.id)}
                                >
                                    {/* Иконка автора */}
                                     <UserCircleIcon className="h-10 w-10 text-gray-300 group-hover:text-indigo-400 mb-3 transition-colors" />
                                    {/* Имя автора */}
                                    <p className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 line-clamp-2" title={author.name}>
                                        {author.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* --- Конец сетки --- */}
                </div>
            </main>

        </div>
    );
};

export default AuthorPage;