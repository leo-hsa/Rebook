// src/pages/AuthorInfoPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeftIcon, UserCircleIcon, BookOpenIcon } from '@heroicons/react/24/outline';

// Импорт Header и Footer (раскомментируйте, если они есть)
// import Header from '../components/Header';
// import Footer from '../components/Footer';

const API_URL = "http://localhost:8000"; // Ваш URL API
// --- ДОБАВИМ ПУТЬ К СТАТИКЕ ---
const STATIC_PATH_PREFIX = "/static/images/books/"; // Путь, по которому FastAPI раздает картинки книг

const AuthorInfoPage = () => {
    const { authorId } = useParams();
    const navigate = useNavigate();
    const [authorData, setAuthorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Функция загрузки деталей автора (без изменений)
    const fetchAuthorDetails = useCallback(async () => {
        console.log(`%c[AuthorInfoPage] Attempting to fetch details for authorId: ${authorId}`, "color: blue;");
        if (!authorId) { /* ... */ setError('Author ID is missing from URL.'); setLoading(false); toast.error('Author ID is missing.'); return; }
        setLoading(true); setError(''); setAuthorData(null);
        try { /* ... */ const response = await axios.get(`${API_URL}/authors/${authorId}`); console.log("%c[AuthorInfoPage] API Response Received:", "color: green;", response);
             if (response.status === 200 && response.data) { setAuthorData(response.data); console.log("%c[AuthorInfoPage] Set authorData:", "color: purple;", response.data); /* ... доп. логи книг ... */ if (response.data.books) { console.log(`%c[AuthorInfoPage] Found ${response.data.books.length} books in response.`, "color: purple;"); if (response.data.books.length > 0) { console.log("%c[AuthorInfoPage] First book raw data:", "color: purple;", response.data.books[0]); console.log("%c[AuthorInfoPage] First book img value:", "color: purple;", response.data.books[0]?.img); } } else { console.warn("[AuthorInfoPage] 'books' array is missing in the API response."); }
             } else { /* ... */ console.error("[AuthorInfoPage] Received status 200 but no data or invalid data:", response.data); throw new Error('Author data not found or invalid in API response.'); }
        } catch (err) { /* ... */ console.error("[AuthorInfoPage] Error fetching author details:", { message: err.message, responseStatus: err.response?.status, responseData: err.response?.data, requestURL: err.config?.url, errorObject: err }); const errorMsg = err.response?.status === 404 ? 'Author not found.' : (err.response?.data?.detail || 'Failed to load author details. Check connection or API.'); setError(errorMsg); toast.error(`Error: ${errorMsg}`);
        } finally { /* ... */ console.log("%c[AuthorInfoPage] Setting loading to false", "color: orange;"); setLoading(false); }
    }, [authorId]);

    useEffect(() => { fetchAuthorDetails(); }, [fetchAuthorDetails]);

    console.log("%c[AuthorInfoPage] Rendering component. State:", "color: brown;", { loading, error, authorData });

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* <Header /> */}

            <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-4xl">
                    {/* Кнопка Назад */}
                    <div className="mb-6"> {/* ... Link Назад ... */} <Link to="/authors" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 group"> <ArrowLeftIcon className="h-4 w-4 mr-2 text-gray-400 group-hover:text-indigo-500" /> Back to Authors List </Link> </div>

                    {/* --- Отображение состояний --- */}
                    {loading ? ( /* ... spinner ... */ <div className="text-center py-20"> <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> <p className="text-gray-500 text-sm mt-4">Loading author details...</p> </div>
                    ) : error ? ( /* ... error message ... */ <div className="text-center py-16 bg-white rounded-lg shadow border border-red-200 p-6 max-w-md mx-auto"> <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2> <p className="text-red-500 mb-6">{error}</p> <button onClick={fetchAuthorDetails} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"> Retry </button> </div>
                    ) : !authorData ? ( /* ... no data ... */ <div className="text-center py-16 bg-white rounded-lg shadow p-6"> <p className="text-lg text-gray-500">Author data could not be loaded or is unavailable.</p> </div>
                    ) : (
                        // --- Отображение Деталей Автора ---
                        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                            <div className="p-6 md:p-8">
                                {/* Имя автора */}
                                <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">{authorData.name}</h1>
                                {/* Биография */}
                                {authorData.info ? ( <div className="prose prose-sm sm:prose-base max-w-none text-gray-600 mb-8"> {authorData.info.split('\n').map((paragraph, index) => ( <p key={index} className={paragraph ? '' : 'h-4'}>{paragraph || <> </>}</p> ))} </div> ) : ( <p className="text-gray-500 italic mb-8">No detailed information available for this author.</p> )}

                                {/* --- Книги Автора --- */}
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center"> <BookOpenIcon className="h-6 w-6 mr-2 text-indigo-500" /> Books by {authorData.name} </h2>
                                    {authorData.books && authorData.books.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
                                            {authorData.books.map((book, index) => {
                                                 console.log(`%c[AuthorInfoPage] Processing book index ${index}:`, "color: darkcyan;", book);
                                                 if (!book || typeof book.id === 'undefined' || !book.title) { console.warn(`[AuthorInfoPage] Skipping book at index ${index} due to missing id or title. Data:`, book); return null; }

                                                 const placeholderUrl = "https://placehold.co/100x150/EFEFEF/AAAAAA?text=No+Image";
                                                 // --- ИСПРАВЛЕННАЯ ЛОГИКА ФОРМИРОВАНИЯ URL ---
                                                 let imgSrc = placeholderUrl; // По умолчанию плейсхолдер
                                                 if (book.img) {
                                                     if (book.img.startsWith('http')) {
                                                         // Если это уже полный URL, используем его
                                                         imgSrc = book.img;
                                                     } else if (book.img.startsWith('/')) {
                                                         // Если начинается со слеша (например, /static/...), добавляем только API_URL
                                                         imgSrc = `${API_URL}${book.img}`;
                                                     } else {
                                                         // Иначе считаем, что это просто имя файла и добавляем префикс статики
                                                         imgSrc = `${API_URL}${STATIC_PATH_PREFIX}${book.img}`;
                                                     }
                                                 }
                                                 // --- КОНЕЦ ИСПРАВЛЕННОЙ ЛОГИКИ ---
                                                 console.log(`%c[AuthorInfoPage] > Calculated imgSrc for ${book.title}: ${imgSrc}`, "color: lightgray;");

                                                 return (
                                                    <Link key={book.id} to={`/book/${book.id}`} className="block group text-center rounded-md transition-colors duration-200">
                                                        <div className="w-full aspect-[2/3] bg-gray-100 rounded-md mb-2 overflow-hidden shadow group-hover:shadow-lg transition-shadow">
                                                            <img
                                                                src={imgSrc}
                                                                alt={`${book.title} cover`}
                                                                className="w-full h-full object-contain"
                                                                onError={(e) => { console.error(`[AuthorInfoPage] Failed to load image: ${imgSrc} for book ${book.title}`); e.target.src = placeholderUrl; e.target.alt = `${book.title} cover (unavailable)`; }}
                                                                loading="lazy"
                                                            />
                                                        </div>
                                                        <p className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-indigo-600 line-clamp-2" title={book.title}> {book.title} </p>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    ) : ( <p className="text-gray-500 italic">No books found for this author in our records.</p> )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* <Footer /> */}
        </div>
    );
};

export default AuthorInfoPage;