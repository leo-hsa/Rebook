// src/pages/AdminPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { BookOpenIcon, TagIcon, UserIcon, PlusCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const API_URL = "http://localhost:8000/admin";

const AdminPage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // --- Проверка токена ---
    useEffect(() => {
        if (!token) {
            toast.warn("Authentication required to access admin panel.");
            navigate("/login");
        }
    }, [token, navigate]);

    // --- Состояния форм ---
    const [bookForm, setBookForm] = useState({ id: '', title: '', description: '', author_name: '', genre_name: '', release_date: '', price: '', img: null });
    const [genreForm, setGenreForm] = useState({ name: '', img: null });
    const [authorForm, setAuthorForm] = useState({ name: '', info: '' });

    // --- Состояния загрузки ---
    const [isBookSubmitting, setIsBookSubmitting] = useState(false);
    const [isGenreSubmitting, setIsGenreSubmitting] = useState(false);
    const [isAuthorSubmitting, setIsAuthorSubmitting] = useState(false);

    // --- Обработчики изменений ---
    const handleInputChange = (e, formSetter) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            formSetter(prev => ({ ...prev, [name]: files ? files[0] : null }));
        } else {
            formSetter(prev => ({ ...prev, [name]: value }));
        }
    };

    // --- Обработчики отправки (без изменений в логике axios) ---
    const handleBookSubmit = async (e) => {
        e.preventDefault(); if (!token) return; setIsBookSubmitting(true);
        const formData = new FormData();
        Object.entries(bookForm).forEach(([key, value]) => { if (value !== null && value !== '') { if (key === 'img' && value instanceof File) { formData.append(key, value); } else if (key !== 'img') { formData.append(key, value); } } });
        if (!formData.has('price')) { toast.error("Price is required..."); setIsBookSubmitting(false); return; }
        try { const response = await axios.post(`${API_URL}/books/`, formData, { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }, }); toast.success(`Book "${response.data.title}" created!`); setBookForm({ id: '', title: '', description: '', author_name: '', genre_name: '', release_date: '', price:'', img: null }); e.target.querySelector('input[type="file"]').value = null; } catch (error) { const errorMsg = error.response?.data?.detail || 'Failed create.'; console.error(`Err Book:`, error.response || error.message); toast.error(`Error: ${errorMsg}`); } finally { setIsBookSubmitting(false); }
    };
    const handleGenreSubmit = async (e) => {
        e.preventDefault(); if (!token) return; setIsGenreSubmitting(true);
        const formData = new FormData(); formData.append('name', genreForm.name); if (genreForm.img instanceof File) { formData.append('img', genreForm.img); }
        try { const response = await axios.post(`${API_URL}/genres/`, formData, { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }, }); toast.success(`Genre "${response.data.name}" created!`); setGenreForm({ name: '', img: null }); e.target.querySelector('input[type="file"]').value = null; } catch (error) { const errorMsg = error.response?.data?.detail || 'Failed create.'; console.error(`Err Genre:`, error.response || error.message); toast.error(`Error: ${errorMsg}`); } finally { setIsGenreSubmitting(false); }
    };
    const handleAuthorSubmit = async (e) => {
        e.preventDefault(); if (!token) return; setIsAuthorSubmitting(true);
        const formData = new FormData(); formData.append('name', authorForm.name); if (authorForm.info) { formData.append('info', authorForm.info); }
        try { const response = await axios.post(`${API_URL}/authors/`, formData, { headers: { 'Authorization': `Bearer ${token}` }, }); toast.success(`Author "${response.data.name}" created!`); setAuthorForm({ name: '', info: '' }); } catch (error) { const errorMsg = error.response?.data?.detail || 'Failed create.'; console.error(`Err Author:`, error.response || error.message); toast.error(`Error: ${errorMsg}`); } finally { setIsAuthorSubmitting(false); }
    };


    // --- Стили Tailwind (переносим прямо в className для ясности или используем @apply) ---
    const inputStyle = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
    const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
    const formSectionStyle = "bg-white p-6 rounded-lg shadow mb-8";
    const h2Style = "text-xl font-semibold text-gray-800 mb-5 flex items-center";
    const fileInputStyle = `${inputStyle} p-0 file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-semibold`; // Базовый стиль для файла

    // --- Базовые стили кнопки (общие для всех) ---
    const baseButtonClasses = "inline-flex items-center justify-center w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-150";
    const loadingButtonClasses = "bg-gray-400 cursor-not-allowed"; // Для состояния загрузки/disabled

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-3xl">
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-10">Admin Panel</h1>

                {/* --- Форма Книги --- */}
                <section className={formSectionStyle}>
                    <h2 className={h2Style}> <BookOpenIcon className="h-6 w-6 mr-2 text-indigo-600" /> Create Book </h2>
                    <form onSubmit={handleBookSubmit} className="space-y-4">
                        {/* ... поля id, title, description ... */}
                        <div> <label htmlFor="book-id" className={labelStyle}>Book ID (ISBN or unique identifier)</label> <input type="text" name="id" id="book-id" value={bookForm.id} onChange={(e) => handleInputChange(e, setBookForm)} required className={inputStyle} placeholder="e.g., 978-3-16-148410-0"/> </div>
                        <div> <label htmlFor="book-title" className={labelStyle}>Title</label> <input type="text" name="title" id="book-title" value={bookForm.title} onChange={(e) => handleInputChange(e, setBookForm)} required className={inputStyle} placeholder="Book Title"/> </div>
                        <div> <label htmlFor="book-description" className={labelStyle}>Description</label> <textarea name="description" id="book-description" value={bookForm.description} onChange={(e) => handleInputChange(e, setBookForm)} required rows="4" className={inputStyle} placeholder="Book summary..." /> </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* ... поля author_name, genre_name ... */}
                            <div> <label htmlFor="book-author" className={labelStyle}>Author Name</label> <input type="text" name="author_name" id="book-author" value={bookForm.author_name} onChange={(e) => handleInputChange(e, setBookForm)} required className={inputStyle} placeholder="Author's Full Name"/> </div>
                            <div> <label htmlFor="book-genre" className={labelStyle}>Genre Name (optional)</label> <input type="text" name="genre_name" id="book-genre" value={bookForm.genre_name} onChange={(e) => handleInputChange(e, setBookForm)} className={inputStyle} placeholder="e.g., Fiction"/> </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {/* ... поля release_date, price ... */}
                            <div> <label htmlFor="book-release-date" className={labelStyle}>Release Date (optional)</label> <input type="date" name="release_date" id="book-release-date" value={bookForm.release_date} onChange={(e) => handleInputChange(e, setBookForm)} className={inputStyle}/> </div>
                            <div> <label htmlFor="book-price" className={labelStyle}>Price</label> <input type="number" name="price" id="book-price" value={bookForm.price} onChange={(e) => handleInputChange(e, setBookForm)} required min="0" step="0.01" className={inputStyle} placeholder="e.g., 19.99"/> </div>
                        </div>
                         {/* Поле Image */}
                        <div>
                            <label htmlFor="book-img" className={labelStyle}>Cover Image (optional)</label>
                            <input type="file" name="img" id="book-img" onChange={(e) => handleInputChange(e, setBookForm)} accept="image/png, image/jpeg, image/webp" className={`${fileInputStyle} file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100`}/>
                        </div>
                         {/* Кнопка Submit */}
                        <div className="pt-2 text-right">
                            <button type="submit" disabled={isBookSubmitting} className={`${baseButtonClasses} ${isBookSubmitting ? loadingButtonClasses : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'}`}>
                                {isBookSubmitting && <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />} Create Book
                            </button>
                        </div>
                    </form>
                </section>

                {/* --- Формы Жанра и Автора в 2 колонки --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* --- Форма Жанра --- */}
                    <section className={formSectionStyle}>
                        <h2 className={h2Style}> <TagIcon className="h-6 w-6 mr-2 text-teal-600" /> Create Genre </h2>
                        <form onSubmit={handleGenreSubmit} className="space-y-4">
                            {/* ... поля genre name, genre image ... */}
                            <div> <label htmlFor="genre-name" className={labelStyle}>Genre Name</label> <input type="text" name="name" id="genre-name" value={genreForm.name} onChange={(e) => handleInputChange(e, setGenreForm)} required className={inputStyle} placeholder="e.g., Science Fiction"/> </div>
                            <div> <label htmlFor="genre-img" className={labelStyle}>Genre Image (optional)</label> <input type="file" name="img" id="genre-img" onChange={(e) => handleInputChange(e, setGenreForm)} accept="image/png, image/jpeg, image/webp" className={`${fileInputStyle} file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100`}/> </div>
                            {/* Кнопка Submit Genre */}
                            <div className="pt-2 text-right">
                               <button type="submit" disabled={isGenreSubmitting} className={`${baseButtonClasses} ${isGenreSubmitting ? loadingButtonClasses : 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500'}`}>
                                 {isGenreSubmitting && <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />} Create Genre
                               </button>
                            </div>
                        </form>
                    </section>

                     {/* --- Форма Автора --- */}
                    <section className={formSectionStyle}>
                         <h2 className={h2Style}> <UserIcon className="h-6 w-6 mr-2 text-orange-600" /> Create Author </h2>
                         <form onSubmit={handleAuthorSubmit} className="space-y-4">
                              {/* ... поля author name, author info ... */}
                              <div> <label htmlFor="author-name" className={labelStyle}>Author Name</label> <input type="text" name="name" id="author-name" value={authorForm.name} onChange={(e) => handleInputChange(e, setAuthorForm)} required className={inputStyle} placeholder="Author's Full Name"/> </div>
                              <div> <label htmlFor="author-info" className={labelStyle}>Biography / Info (optional)</label> <textarea name="info" id="author-info" value={authorForm.info} onChange={(e) => handleInputChange(e, setAuthorForm)} rows="5" className={inputStyle} placeholder="Short bio..."/> </div>
                              {/* Кнопка Submit Author */}
                              <div className="pt-2 text-right">
                               <button type="submit" disabled={isAuthorSubmitting} className={`${baseButtonClasses} ${isAuthorSubmitting ? loadingButtonClasses : 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'}`}>
                                 {isAuthorSubmitting && <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />} Create Author
                               </button>
                             </div>
                         </form>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;