// src/pages/AuthorInfoPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Import useParams
import { toast } from 'react-toastify';
import { ArrowLeftIcon, UserCircleIcon, BookOpenIcon } from '@heroicons/react/24/outline'; // Icons

// Import Header and Footer
import Header from '../components/Header';
import Footer from '../components/Footer';

// URL вашего API
const API_URL = "http://localhost:8000";

const AuthorInfoPage = () => {
    // useParams для получения ID автора из URL
    const { authorId } = useParams();
    const navigate = useNavigate();

    // Состояния для данных автора, загрузки и ошибок
    const [authorData, setAuthorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Функция для загрузки данных автора
    const fetchAuthorDetails = useCallback(async () => {
        if (!authorId) {
            setError('Author ID is missing.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            // Запрос к НОВОМУ эндпоинту для получения деталей автора
            const response = await axios.get(`${API_URL}/authors/${authorId}`);

            // Проверяем, есть ли данные
            if (response.data) {
                setAuthorData(response.data);
                 // Логируем полученные книги для отладки
                 console.log("Books for author:", response.data.books);
            } else {
                throw new Error('Author data not found in response.');
            }
        } catch (err) {
            console.error("Error fetching author details:", err.response?.data || err.message);
            const errorMsg = err.response?.status === 404
                ? 'Author not found.'
                : (err.response?.data?.detail || 'Failed to load author details.');
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [authorId]); // Зависимость от authorId

    // Вызов fetchAuthorDetails при монтировании или изменении authorId
    useEffect(() => {
        fetchAuthorDetails();
    }, [fetchAuthorDetails]);

    // --- JSX Рендеринг ---
    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-grow bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-4xl"> {/* Ограничиваем ширину */}

                    {/* Кнопка Назад */}
                    <div className="mb-6">
                        <Link
                            to="/authors" // Ссылка назад на список авторов
                            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 group"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2 text-gray-400 group-hover:text-indigo-500" />
                            Back to Authors List
                        </Link>
                    </div>

                    {/* Состояния Загрузка / Ошибка / Данные */}
                    {loading ? (
                         <div className="text-center py-20">
                             {/* Спиннер */}
                             <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                             <p className="text-gray-500 text-sm mt-4">Loading author details...</p>
                         </div>
                    ) : error ? (
                        <div className="text-center py-16 bg-white rounded-lg shadow border border-red-200 p-6">
                            <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
                            <p className="text-red-500 mb-6">{error}</p>
                             <button
                                 onClick={fetchAuthorDetails} // Повторить попытку
                                 className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                             >
                                Retry
                            </button>
                        </div>
                    ) : !authorData ? (
                         <div className="text-center py-16 bg-white rounded-lg shadow p-6">
                             <p className="text-lg text-gray-500">Author not found.</p>
                         </div>
                    ) : (
                        // Отображение информации об авторе
                        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                             {/* Можно добавить шапку с изображением автора, если оно есть */}
                             {/* <div className="h-40 bg-gray-200 flex items-center justify-center">
                                 <UserCircleIcon className="h-24 w-24 text-gray-400" />
                             </div> */}

                            <div className="p-6 md:p-8">
                                <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
                                    {/* <UserCircleIcon className="h-8 w-8 mr-3 text-indigo-500" /> */}
                                    {authorData.name}
                                </h1>

                                {/* Отображение информации/биографии */}
                                {authorData.info ? (
                                    <div className="prose prose-indigo max-w-none text-gray-700 mb-8">
                                        {/* Используем dangerouslySetInnerHTML если info содержит HTML,
                                            иначе просто выводим как текст.
                                            ВНИМАНИЕ: Использование dangerouslySetInnerHTML небезопасно,
                                            если HTML приходит из недоверенного источника!
                                            Предпочтительнее хранить info как Markdown или простой текст.
                                        */}
                                         {/* <p dangerouslySetInnerHTML={{ __html: authorData.info }} /> */}
                                         {/* Безопасный вариант для простого текста с переносами строк: */}
                                         {authorData.info.split('\n').map((paragraph, index) => (
                                             <p key={index}>{paragraph || <> </>}</p> // Отображаем параграфы, сохраняя пустые строки
                                         ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic mb-8">No biography available for this author.</p>
                                )}

                                {/* Секция книг автора */}
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center">
                                        <BookOpenIcon className="h-6 w-6 mr-2 text-indigo-500" />
                                        Books by {authorData.name}
                                    </h2>
                                    {/* Проверяем наличие и непустоту массива книг */}
                                    {authorData.books && authorData.books.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {authorData.books.map((book) => (
                                                // Простая карточка книги
                                                book && book.id ? ( // Убедимся что есть ID
                                                    <Link
                                                        key={book.id}
                                                        to={`/book/${book.id}`}
                                                        className="block group text-center p-2 rounded-md hover:bg-gray-50 transition-colors"
                                                    >
                                                        {/* Изображение книги */}
                                                        <div className="w-full aspect-[2/3] bg-gray-100 rounded mb-2 overflow-hidden flex items-center justify-center">
                                                            <img
                                                                src={book.img ? (book.img.startsWith('http') ? book.img : `${API_URL}${book.img}`) : "https://via.placeholder.com/100x150?text=N/A"}
                                                                alt={`${book.title} cover`}
                                                                className="w-full h-full object-contain"
                                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/100x150?text=N/A'; }}
                                                                loading="lazy"
                                                            />
                                                        </div>
                                                         {/* Название книги */}
                                                        <p className="text-xs font-medium text-gray-700 group-hover:text-indigo-600 line-clamp-2" title={book.title}>
                                                            {book.title || "Untitled Book"}
                                                        </p>
                                                    </Link>
                                                ) : null
                                            ))}
                                        </div>
                                    ) : (
                                         <p className="text-gray-500 italic">No books found for this author in our records.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AuthorInfoPage;