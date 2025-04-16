// src/pages/ShopPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { ShoppingCartIcon, InboxIcon } from '@heroicons/react/24/outline';


const API_URL = "http://localhost:8000";
const BOOK_IMG_PREFIX = "/static/images/books/";
const GENRE_IMG_PREFIX = "/static/images/genres/";
const RELIABLE_PLACEHOLDER = "https://placehold.co/144x192/EFEFEF/AAAAAA?text=No+Cover";


const FilterPanel = ({ filters, genres, onFilterChange, isOpen, onClose }) => (
    <aside id="filter-panel" className={`fixed top-0 left-0 h-full w-3/4 max-w-xs bg-white shadow-xl z-50 p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:sticky md:top-[calc(4rem+1px)] md:h-[calc(100vh-4rem-1px)] md:translate-x-0 md:w-1/4 lg:w-1/5 xl:w-1/6 md:max-w-none md:shadow-md md:z-30 md:block md:overflow-y-auto`}>
        {isOpen && ( <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={onClose} aria-hidden="true"></div> )}
        <button type="button" className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 md:hidden" onClick={onClose} aria-label="Close filters"> <span className="sr-only">Close filters</span><XMarkIcon className="h-6 w-6" aria-hidden="true" /> </button>
        <h2 className="text-xl font-semibold text-gray-800 mb-5">Filters</h2>
        <form className="space-y-5">
             <div><label htmlFor="title-filter" className="block text-sm font-medium text-gray-700 mb-1">Title</label><input id="title-filter" type="text" name="title" value={filters.title} onChange={onFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Search by title" /></div>
             <div><label htmlFor="author-filter" className="block text-sm font-medium text-gray-700 mb-1">Author</label><input id="author-filter" type="text" name="author_name" value={filters.author_name} onChange={onFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Search by author name" /></div>
             <div>
                 <label htmlFor="genre-filter" className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                 <select id="genre-filter" name="genre_name" value={filters.genre_name} onChange={onFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                     <option value="">All Genres</option>
                     {Array.isArray(genres) && genres.length > 0 ? ( genres.map((genre) => ( genre && typeof genre.id !== 'undefined' && genre.name ? ( <option key={genre.id} value={genre.name}> {genre.name} </option> ) : null )) ) : ( <option disabled>Loading genres...</option> )}
                 </select>
             </div>
             <div><label htmlFor="year-filter" className="block text-sm font-medium text-gray-700 mb-1">Year</label><input id="year-filter" type="number" name="year" value={filters.year} onChange={onFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="Enter year" min="1000" max={new Date().getFullYear()} /></div>
             <div><label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label><select id="sort-filter" name="sort_by" value={filters.sort_by} onChange={onFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"><option value="date">Date</option><option value="popularity">Popularity</option></select></div>
        </form>
    </aside>
);


const BookCard = ({ book, token, onAddToFavorites, onRemoveFromFavorites, onAddToCart }) => { /* ... */
    const placeholderUrl = RELIABLE_PLACEHOLDER; let imgSrc = placeholderUrl; if (book.img) { if (book.img.startsWith('http')) { imgSrc = book.img; } else if (book.img.startsWith('/')) { imgSrc = `${API_URL}${book.img}`; } else { imgSrc = `${API_URL}${BOOK_IMG_PREFIX}${book.img}`; } }
    return ( <Link to={`/book/${book.id}`} className="block group h-full" aria-label={`View details for ${book.title}`}> <div className="relative bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow w-full flex flex-col text-center h-full"> {token && ( <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); book.is_favorite ? onRemoveFromFavorites(book.id) : onAddToFavorites(book.id); }} className="absolute top-2 right-2 p-1 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 z-10 transition-colors" aria-label={book.is_favorite ? `Remove ${book.title} from favs` : `Add ${book.title} to favs`} title={book.is_favorite ? 'Remove from Favs' : 'Add to Favs'}>{book.is_favorite ? (<HeartIconSolid className="h-5 w-5 text-red-500" />) : (<HeartIconOutline className="h-5 w-5" />)}</button> )} <div className="w-36 h-48 mx-auto mb-4 flex items-center justify-center flex-shrink-0"> <img src={imgSrc} alt={`${book.title} cover`} className="max-w-full max-h-full object-contain rounded-md" onError={(e) => { console.error(`[BookCard] Failed img load: ${imgSrc}`); e.target.src = placeholderUrl; e.target.alt = `${book.title} (cover unavailable)` }} loading="lazy" /></div> <div className="flex-grow flex flex-col justify-between w-full"> <div className="mb-3"><h3 className="text-base font-semibold text-gray-800 line-clamp-2 group-hover:text-indigo-600" title={book.title}>{book.title || "No Title"}</h3><p className="text-sm text-gray-500 line-clamp-1 mt-1" title={book.author_name}>{book.author_name || "Unknown Author"}</p></div> {token && ( <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(book.id); }} aria-label={`Add ${book.title} to cart`} className="mt-auto w-full max-w-[160px] mx-auto px-3 py-1.5 rounded bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center space-x-1.5 transition-colors"><ShoppingCartIcon className="h-4 w-4" /><span>Add to Cart</span></button> )} </div> </div> </Link> );
};


const ShopPage = () => {
  
    const [books, setBooks] = useState([]);
    const [filters, setFilters] = useState({ genre_name: "", author_name: "", year: "", title: "", sort_by: "date" });
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);


    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const location = useLocation();


    useEffect(() => {
        console.log("[ShopPage] useEffect[location.search] triggered. Current filters before update:", filters);
        const queryParams = new URLSearchParams(location.search);
        let filtersChanged = false;
       
        const defaultFilters = { genre_name: "", author_name: "", year: "", title: "", sort_by: "date" };
        const newFilters = { ...defaultFilters };

        const filterKeys = ['genre_name', 'author_name', 'year', 'sort_by']; 

        
        const searchParam = queryParams.get('search');
        const titleParam = queryParams.get('title');
        const titleValue = searchParam ?? titleParam; 

        if (titleValue !== null) {
            newFilters.title = titleValue;
             
             if (searchParam !== null) {
                 console.log("[ShopPage] Resetting other filters in newFilters due to 'search' param.");
                 newFilters.genre_name = "";
                 newFilters.author_name = "";
                 newFilters.year = "";
             }
        }


        // Обработка остальных ключей (если нет 'search')
        if (searchParam === null) { // Применяем остальные фильтры только если не было явного поиска
            filterKeys.forEach(key => {
                const valueFromUrl = queryParams.get(key);
                if (valueFromUrl !== null) {
                    newFilters[key] = valueFromUrl;
                }
            });
        }

        // Сравниваем newFilters с текущим состоянием filters
        // Преобразуем в строки для простого сравнения
        if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
            console.log("[ShopPage] Updating filters state from URL params:", newFilters);
            setFilters(newFilters); // Обновляем стейт, если есть разница
            filtersChanged = true; // Отмечаем изменение (хотя setFilters уже достаточно)
        } else {
             console.log("[ShopPage] Filters from URL match current state, no update needed.");
        }

    }, [location.search]); // Следим только за search частью URL


    // Функция загрузки книг (useCallback остается полезным)
    const fetchBooks = useCallback(async () => {
        // Эта функция теперь будет вызываться в useEffect ниже, когда filters ИЗМЕНЯТСЯ
        console.log("%c[ShopPage] Fetching books triggered. Filters:", "color: blue; font-weight: bold;", filters);
        setLoading(true);
        try {
            const params = new URLSearchParams( Object.entries(filters).filter(([, value]) => value !== "" && value !== null) ).toString();
            console.log(`%c[ShopPage] Requesting: ${API_URL}/shop/?${params}`, "color: gray;");
            const response = await axios.get(`${API_URL}/shop/?${params}`, { headers: token ? { Authorization: `Bearer ${token}` } : {}, });
            // ... (обработка ответа и setBooks без изменений) ...
            console.log("%c[ShopPage] Books API Response:", "color: green;", response);
            if (!Array.isArray(response.data)) { throw new Error("Invalid book data format"); }
            console.log(`%c[ShopPage] Received ${response.data.length} books.`, "color: green;");
            const processedBooks = response.data.map(bookData => { if (typeof bookData.is_favorite === 'undefined' || typeof bookData.id === 'undefined') { console.warn("Book data missing 'id' or 'is_favorite':", bookData); } let imagePath = null; if (bookData.img) { imagePath = bookData.img.startsWith('http') || bookData.img.startsWith('/') ? bookData.img : `${BOOK_IMG_PREFIX}${bookData.img}`; } return { id: bookData.id, title: bookData.title || "No Title", author_name: bookData.author_name || "Unknown Author", is_favorite: bookData.is_favorite ?? false, img: imagePath, }; }).filter(book => book.id);
            console.log("%c[ShopPage] Processed Books:", "color: purple;", processedBooks);
            setBooks(processedBooks);
        } catch (err) { /* ... обработка ошибок ... */ console.error("[ShopPage] Fetch books error details:", err.response || err.message || err); if (!axios.isCancel(err)) { toast.error("Failed to load books.", { position: "bottom-right" }); } setBooks([]);
        } finally {
            console.log("%c[ShopPage] Setting loading to false", "color: orange;");
            setLoading(false);
            if (!initialLoadComplete) setInitialLoadComplete(true);
        }
    // Зависим от filters и token.
    }, [filters, token, initialLoadComplete]); // Добавили initialLoadComplete в зависимости useCallback


    // Функция загрузки жанров (без изменений)
    const fetchGenres = useCallback(async () => { /* ... */ console.log("%c[ShopPage] Fetching genres...", "color: blue;"); try { const response = await axios.get(`${API_URL}/genres/`); console.log("%c[ShopPage] Genres API Response:", "color: green;", response); if (!Array.isArray(response.data)) { throw new Error("Invalid genre data format"); } const sortedGenres = response.data.sort((a, b) => (a.name || "").localeCompare(b.name || "")); console.log("%c[ShopPage] Processed Genres:", "color: purple;", sortedGenres); setGenres(sortedGenres); } catch (err) { console.error("[ShopPage] Fetch genres error details:", err.response || err.message || err); if (!axios.isCancel(err)) { toast.error("Failed to load genres.", { position: "bottom-right" }); } setGenres([]); } }, []);


    // --- ИЗМЕНЕННЫЙ useEffect для вызова fetchBooks ---
    useEffect(() => {
        // Вызываем fetchBooks каждый раз, когда filters или token меняются
        // Не зависим от fetchBooks (ссылки функции) напрямую
        console.log("%c[ShopPage] useEffect[filters, token] triggered. Calling fetchBooks.", "color: magenta;");
        fetchBooks();
    }, [filters, token, fetchBooks]); // <-- ЗАВИСИМОСТЬ ОТ filters И token (и fetchBooks для линтера)
    // --- КОНЕЦ ИЗМЕНЕНИЯ ---

    // useEffect для fetchGenres (без изменений)
    useEffect(() => { fetchGenres(); }, [fetchGenres]);


    // Обработчик изменения фильтров (обновляет URL)
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const searchParams = new URLSearchParams(location.search);
        if (value) { searchParams.set(name, value); }
        else { searchParams.delete(name); }
        // При изменении фильтра вручную, удаляем 'search' параметр? (Опционально)
        // searchParams.delete('search');
        navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
        // useEffect[location.search] обновит filters state
    };

    // Функции Избранного и Корзины (без изменений)
    const addToFavorites = async (bookId) => { /* ... */ if (!token) { toast.info("Please log in..."); navigate("/login"); return; } try { await axios.post(`${API_URL}/shop/favorites/${bookId}`, {}, { headers: { Authorization: `Bearer ${token}` } }); setBooks(prev => prev.map(b => b.id === bookId ? { ...b, is_favorite: true } : b)); toast.success("Added to favorites!", { autoClose: 1500 }); } catch (err) { toast.error(err.response?.data?.detail || "Failed add favorite"); console.error("AddFavErr:", err.response||err); } };
    const removeFromFavorites = async (bookId) => { /* ... */ if (!token) return; try { await axios.delete(`${API_URL}/shop/favorites/${bookId}`, { headers: { Authorization: `Bearer ${token}` } }); setBooks(prev => prev.map(b => b.id === bookId ? { ...b, is_favorite: false } : b)); toast.success("Removed favorite", { autoClose: 1500 }); } catch (err) { toast.error(err.response?.data?.detail || "Failed remove favorite"); console.error("RemFavErr:", err.response||err); } };
    const handleAddToCart = async (bookId) => { /* ... */ if (!token) { toast.info("Please log in..."); navigate("/login"); return; } try { const response = await axios.post(`${API_URL}/shop/basket/${bookId}`, { quantity: 1 }, { headers: { Authorization: `Bearer ${token}` } }); toast.success(response.data.message || "Added to cart!", { autoClose: 1500 }); } catch (err) { toast.error(err.response?.data?.detail || "Failed add to cart"); console.error("AddCartErr:", err.response||err); } };

    // --- JSX Разметка (без изменений) ---
    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            <FilterPanel filters={filters} genres={genres} onFilterChange={handleFilterChange} isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} />
            <main className="flex-1 p-4 md:p-6 bg-gray-100">
                 <div className="mb-4 text-right md:hidden"> <button type="button" onClick={() => setIsFilterPanelOpen(true)} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" aria-expanded={isFilterPanelOpen} aria-controls="filter-panel"> <FunnelIcon className="h-5 w-5 mr-2" aria-hidden="true" /> Filters </button> </div>
                 {loading ? ( <div className="flex justify-center items-center pt-16 h-[calc(100vh-10rem)]"> <svg className="animate-spin h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> </div>
                 ) : !books || books.length === 0 ? ( initialLoadComplete ? ( <div className="text-center py-16 px-4 flex flex-col items-center justify-center h-[calc(100vh-10rem)]"> <InboxIcon className="mx-auto h-16 w-16 text-gray-400" /> <h3 className="mt-2 text-lg font-medium text-gray-900">No Books Found</h3> <p className="mt-1 text-sm text-gray-500">No books matched filters. Try adjusting or reset.</p> <button onClick={() => { const defaultFilters = { genre_name: "", author_name: "", year: "", title: "", sort_by: "date" }; setFilters(defaultFilters); navigate(location.pathname, { replace: true }); }} className="mt-6 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" > Reset Filters </button> </div> ) : ( <div className="flex justify-center items-center pt-16 h-[calc(100vh-10rem)]"> <svg className="animate-spin h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> </div> )
                 ) : ( <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 md:gap-6"> {books.map((book) => ( book && book.id ? ( <BookCard key={book.id} book={book} token={token} onAddToFavorites={addToFavorites} onRemoveFromFavorites={removeFromFavorites} onAddToCart={handleAddToCart} /> ) : null ))} </div> )}
            </main>
        </div>
    );
};


FilterPanel.propTypes = {  filters: PropTypes.shape({ genre_name: PropTypes.string, author_name: PropTypes.string, year: PropTypes.string, title: PropTypes.string, sort_by: PropTypes.string, }).isRequired, genres: PropTypes.arrayOf( PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, name: PropTypes.string.isRequired, }) ).isRequired, onFilterChange: PropTypes.func.isRequired, isOpen: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired, };
BookCard.propTypes = { book: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, title: PropTypes.string.isRequired, img: PropTypes.string, author_name: PropTypes.string.isRequired, is_favorite: PropTypes.bool, }).isRequired, token: PropTypes.string, onAddToFavorites: PropTypes.func.isRequired, onRemoveFromFavorites: PropTypes.func.isRequired, onAddToCart: PropTypes.func.isRequired, };

export default ShopPage;