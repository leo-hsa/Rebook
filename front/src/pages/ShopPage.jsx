import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

// URL вашего API
const API_URL = "http://localhost:8000";

// --- Компонент FilterPanel (код без изменений, как в предыдущем ответе) ---
const FilterPanel = ({ filters, genres, onFilterChange, isOpen, onClose }) => (
    <>
        {/* Оверлей для мобильных */}
        {isOpen && ( <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={onClose} aria-hidden="true"></div> )}
        {/* Панель фильтров */}
        <div className={`fixed top-0 left-0 h-full w-3/4 max-w-xs bg-white shadow-xl z-50 p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:w-1/4 md:max-w-none md:h-auto md:shadow-md md:z-auto md:block md:overflow-y-visible`}>
             {/* Кнопка закрытия */}
            <button type="button" className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 md:hidden" onClick={onClose} aria-label="Close filters">
                <span className="sr-only">Close filters</span><XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            <div className="space-y-4">
                 {/* Поля ввода */}
                 <div><label htmlFor="title-filter" className="block text-sm font-medium text-gray-700">Title</label><input id="title-filter" type="text" name="title" value={filters.title} onChange={onFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Search by title" /></div>
                 <div><label htmlFor="author-filter" className="block text-sm font-medium text-gray-700">Author</label><input id="author-filter" type="text" name="author_name" value={filters.author_name} onChange={onFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Search by author name" /></div>
                 <div><label htmlFor="genre-filter" className="block text-sm font-medium text-gray-700">Genre</label><select id="genre-filter" name="genre_name" value={filters.genre_name} onChange={onFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"><option value="">All Genres</option>{Array.isArray(genres) && genres.map((genre) => (<option key={genre.id || genre.name} value={genre.name}>{genre.name}</option>))}</select></div>
                 <div><label htmlFor="year-filter" className="block text-sm font-medium text-gray-700">Year</label><input id="year-filter" type="number" name="year" value={filters.year} onChange={onFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Enter year" min="1000" max={new Date().getFullYear()} /></div>
                 <div><label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700">Sort By</label><select id="sort-filter" name="sort_by" value={filters.sort_by} onChange={onFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"><option value="date">Date</option><option value="popularity">Popularity</option></select></div>
            </div>
        </div>
    </>
);

// --- Компонент BookCard (код без изменений, как в предыдущем ответе) ---
const BookCard = ({ book, token, onAddToFavorites, onRemoveFromFavorites, onAddToCart }) => {
    // ДОБАВИМ ЛОГ ПРЯМО ЗДЕСЬ
    // console.log("Rendering BookCard for:", book?.title, "Props:", { book, token });
    return (
        <Link to={`/book/${book.id}`} className="block group h-full" aria-label={`View details for ${book.title}`}>
            <div className="relative bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow w-full flex flex-col items-center text-center h-full">
                {/* Иконка сердца */}
                {token && ( <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); book.is_favorite ? onRemoveFromFavorites(book.id) : onAddToFavorites(book.id); }} className="absolute top-2 right-2 p-1 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 z-10" aria-label={book.is_favorite ? `Remove ${book.title} from favorites` : `Add ${book.title} to favorites`} title={book.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}>{book.is_favorite ? (<HeartIconSolid className="h-6 w-6 text-red-500" aria-hidden="true" />) : (<HeartIconOutline className="h-6 w-6 text-gray-500 group-hover:text-red-400" aria-hidden="true" />)}</button> )}
                 {/* Изображение книги */}
                <div className="w-36 h-48 flex items-center justify-center mb-4 mt-4"> <img src={book.img ? (book.img.startsWith('http') ? book.img : `${API_URL}${book.img}`) : "https://via.placeholder.com/144x192?text=No+Cover"} alt={`${book.title} cover`} className="max-w-full max-h-full object-contain rounded-md flex-shrink-0" onError={(e) => { console.error(`Failed to load image for ${book.title}: ${book.img}`); e.target.src = "https://via.placeholder.com/144x192?text=No+Cover"; }} loading="lazy" /></div>
                {/* Текст и кнопка */}
                <div className="flex-grow flex flex-col justify-between w-full mt-2">
                    <div className="mb-3"><h3 className="text-lg font-semibold line-clamp-2 hover:text-indigo-600 transition-colors duration-200" title={book.title}>{book.title}</h3><p className="text-sm text-gray-500 line-clamp-1 mt-1" title={book.author_name}>{book.author_name}</p></div>
                    {token && ( <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(book.id); }} aria-label={`Add ${book.title} to cart`} className="mt-auto w-full max-w-[180px] mx-auto p-2 rounded bg-indigo-600 text-white font-medium text-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center space-x-2"><ShoppingCartIcon className="h-4 w-4" aria-hidden="true" /><span>В корзину</span></button> )}
                </div>
            </div>
        </Link>
    );
};


// --- Компонент ShopPage с ДОПОЛНИТЕЛЬНЫМИ ЛОГАМИ ---
const ShopPage = () => {
    // Состояния, хуки (без изменений)
    const [books, setBooks] = useState([]);
    const [filters, setFilters] = useState({ genre_name: "", author_name: "", year: "", title: "", sort_by: "date" });
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true); // Начинаем с true, пока не загрузим данные
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const location = useLocation();

    // Эффект для поиска (без изменений)
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const searchQuery = queryParams.get("search");
        if (searchQuery && searchQuery !== filters.title) {
            console.log("Applying search query from URL:", searchQuery);
            setFilters((prev) => ({ genre_name: "", author_name: "", year: "", sort_by: "date", title: searchQuery }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    // --- Функция fetchBooks с ДОПОЛНИТЕЛЬНЫМИ ЛОГАМИ ---
    const fetchBooks = useCallback(async () => {
        console.log("%cFetching books with filters:", "color: blue; font-weight: bold;", filters);
        setLoading(true); // Устанавливаем загрузку перед запросом
        setBooks([]); // Очищаем предыдущие книги перед новым запросом (опционально, но помогает)
        try {
            const params = new URLSearchParams(
                Object.entries(filters).filter(([, value]) => value !== "" && value !== null)
            ).toString();
            console.log(`%cRequesting: ${API_URL}/shop/?${params}`, "color: gray;");

            const response = await axios.get(`${API_URL}/shop/?${params}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            console.log("%cAPI Response Received:", "color: green;", response);

            // Более строгая проверка данных
            if (!response || !response.data || !Array.isArray(response.data)) {
                console.error("API did not return a valid array:", response?.data);
                toast.error("Received invalid data from server.", { position: "bottom-right" });
                setBooks([]); // Убедимся, что книги пустые
                throw new Error("Invalid data format received from API");
            }

            console.log(`%cReceived ${response.data.length} books from API.`, "color: green;");

            // Обработка данных и обновление состояния
            const processedBooks = response.data.map(bookData => {
                if (typeof bookData.is_favorite === 'undefined' || typeof bookData.id === 'undefined') {
                    console.warn("Book data missing 'id' or 'is_favorite':", bookData);
                }
                 let imagePath = null;
                 if (bookData.img) {
                     imagePath = bookData.img.startsWith('http') || bookData.img.startsWith('/')
                         ? bookData.img
                         : `/static/images/books/${bookData.img}`;
                 }
                // Возвращаем объект, даже если есть предупреждения
                return {
                    id: bookData.id, // ID обязателен для ключа
                    title: bookData.title || "No Title",
                    author_name: bookData.author_name || "Unknown Author",
                    is_favorite: bookData.is_favorite ?? false, // Используем ?? для дефолта false, если null/undefined
                    img: imagePath,
                };
            }).filter(book => book.id); // Дополнительно отфильтруем книги без ID

            console.log("%cProcessed Books:", "color: purple;", processedBooks);
            setBooks(processedBooks); // Обновляем состояние

        } catch (err) {
             // Логируем ошибку перед показом toast
             console.error("Fetch books error details:", err.response || err.message || err);
             if (!axios.isCancel(err)) { // Не показываем ошибку, если запрос был отменен
                 toast.error("Failed to load books. Please check connection or filters.", { position: "bottom-right" });
             }
             setBooks([]); // Гарантированно очищаем книги при любой ошибке
        } finally {
            console.log("%cSetting loading to false", "color: orange;");
            setLoading(false); // В любом случае убираем загрузку
        }
    }, [filters, token]); // Зависимости

    // --- Функция fetchGenres с логами ---
    const fetchGenres = useCallback(async () => {
        console.log("%cFetching genres...", "color: blue;");
        try {
            const response = await axios.get(`${API_URL}/shop/genres/`);
            console.log("%cGenres API Response:", "color: green;", response);
             if (!Array.isArray(response.data)) {
                console.error("API /shop/genres/ did not return an array:", response.data);
                throw new Error("Invalid data format received for genres");
            }
            const sortedGenres = response.data.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            console.log("%cProcessed Genres:", "color: purple;", sortedGenres);
            setGenres(sortedGenres);
        } catch (err) {
             console.error("Fetch genres error details:", err.response || err.message || err);
             if (!axios.isCancel(err)) {
                toast.error("Failed to load genres.", { position: "bottom-right" });
             }
            setGenres([]);
        }
    }, []);

    // Эффекты для вызова fetch'ей (без изменений)
    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    useEffect(() => {
        fetchGenres();
    }, [fetchGenres]);

    // Обработчики (без изменений)
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    };
    const addToFavorites = async (bookId) => { /* ... код без изменений ... */
        if (!token) { toast.info("Please log in to add favorites.", { position: "bottom-right" }); navigate("/login"); return; }
        try { await axios.post(`${API_URL}/shop/favorites/${bookId}`, {}, { headers: { Authorization: `Bearer ${token}` } }); setBooks(prevBooks => prevBooks.map(book => book.id === bookId ? { ...book, is_favorite: true } : book)); toast.success("Added to favorites!", { position: "bottom-right", autoClose: 2000 }); } catch (err) { const errorMsg = err.response?.data?.detail || "Failed to add to favorites"; toast.error(errorMsg, { position: "bottom-right" }); console.error("Add favorite error:", err.response || err); }
    };
    const removeFromFavorites = async (bookId) => { /* ... код без изменений ... */
        if (!token) { navigate("/login"); return; }
        try { await axios.delete(`${API_URL}/shop/favorites/${bookId}`, { headers: { Authorization: `Bearer ${token}` } }); setBooks(prevBooks => prevBooks.map(book => book.id === bookId ? { ...book, is_favorite: false } : book)); toast.success("Removed from favorites!", { position: "bottom-right", autoClose: 2000 }); } catch (err) { const errorMsg = err.response?.data?.detail || "Failed to remove favorite"; toast.error(errorMsg, { position: "bottom-right" }); console.error("Remove favorite error:", err.response || err); }
    };
    const handleAddToCart = async (bookId) => { /* ... код без изменений ... */
        if (!token) { toast.info("Please log in to add to cart.", { position: "bottom-right" }); navigate("/login"); return; } console.log(`Adding ${bookId} to cart...`); // setLoading(true); // Можно добавить индикатор для кнопки
        try { const response = await axios.post(`${API_URL}/shop/basket/${bookId}`, {}, { headers: { Authorization: `Bearer ${token}` } }); toast.success(response.data.message || "Added to cart!", { position: "bottom-right", autoClose: 2000 }); console.log("Add to cart response:", response.data); } catch (err) { const errorMsg = err.response?.data?.detail || "Failed to add to cart"; toast.error(errorMsg, { position: "bottom-right" }); console.error("Add to cart error:", err.response || err); } // finally { setLoading(false); }
    };

    // --- JSX Разметка с ДОПОЛНИТЕЛЬНЫМИ ЛОГАМИ ---
    // Добавим лог перед return
    console.log("%cRendering ShopPage. State:", "color: brown;", { loading, booksLength: books?.length, books: books, genresLength: genres?.length, isFilterPanelOpen });

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            <FilterPanel filters={filters} genres={genres} onFilterChange={handleFilterChange} isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} />
            <main className="flex-1 p-4 md:p-6">
                <div className="mb-4 text-right md:hidden">
                    <button type="button" onClick={() => setIsFilterPanelOpen(true)} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" aria-expanded={isFilterPanelOpen} aria-controls="filter-panel">
                        <FunnelIcon className="h-5 w-5 mr-2" aria-hidden="true" /> Filters
                    </button>
                </div>

                {/* Условия рендеринга */}
                {loading ? (
                     <div className="flex justify-center items-center pt-16"> <p className="text-gray-600 text-lg animate-pulse">Loading books...</p> </div>
                ) : !books || books.length === 0 ? ( // Проверяем books после загрузки
                     <div className="text-center py-10 px-4"> <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"> <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /> </svg> <h3 className="mt-2 text-lg font-medium text-gray-900">No books found</h3> <p className="mt-1 text-sm text-gray-500">No books matched your current filters. Try adjusting your search criteria.</p> </div>
                ) : (
                    // Сетка книг
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 md:gap-6">
                        {/* Лог перед началом цикла map */}
                        {console.log("%cMapping books to BookCard components...", "color: darkcyan;")}
                        {books.map((book, index) => {
                            // Лог для каждого элемента перед рендерингом карточки
                             console.log(`%c -> Mapping book index ${index}:`, "color: lightgray;", book);
                             // Проверка на наличие ID остается важной
                             return book && book.id ? (
                                 <BookCard
                                     key={book.id}
                                     book={book}
                                     token={token}
                                     onAddToFavorites={addToFavorites}
                                     onRemoveFromFavorites={removeFromFavorites}
                                     onAddToCart={handleAddToCart}
                                 />
                            ) : (
                                 console.warn(`%c --> Skipping render for book at index ${index} due to missing id:`, "color: red;", book),
                                 null // Явно возвращаем null, если пропускаем
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

// --- PropTypes (без изменений) ---
FilterPanel.propTypes = { /* ... */
    filters: PropTypes.shape({ genre_name: PropTypes.string, author_name: PropTypes.string, year: PropTypes.string, title: PropTypes.string, sort_by: PropTypes.string, }).isRequired, genres: PropTypes.arrayOf( PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), name: PropTypes.string, }) ).isRequired, onFilterChange: PropTypes.func.isRequired, isOpen: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired,
};
BookCard.propTypes = { /* ... */
    book: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, title: PropTypes.string.isRequired, img: PropTypes.string, author_name: PropTypes.string.isRequired, is_favorite: PropTypes.bool, }).isRequired, token: PropTypes.string, onAddToFavorites: PropTypes.func.isRequired, onRemoveFromFavorites: PropTypes.func.isRequired, onAddToCart: PropTypes.func.isRequired,
};

export default ShopPage;