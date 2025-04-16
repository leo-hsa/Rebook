import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
// Импортируем нужные иконки
import {
    Bars3Icon,
    XMarkIcon,
    HeartIcon, // Иконка избранного
    ShoppingCartIcon, // Иконка корзины
    UserCircleIcon // Иконка профиля (или UserIcon)
} from '@heroicons/react/24/outline';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Убираем состояния и логику, связанные с поиском
  // const [isSearchOpen, setIsSearchOpen] = useState(false);
  // const [searchQuery, setSearchQuery] = useState("");
  // const navigate = useNavigate(); // navigate больше не используется здесь
  const location = useLocation();

  // Убираем обработчик поиска handleSearch

  // Закрываем мобильное меню при изменении маршрута
  useEffect(() => {
    setIsMobileMenuOpen(false);
    // setIsSearchOpen(false); // Больше не нужно
  }, [location]);

  // Закрываем меню, если окно стало шире мобильного размера
  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth >= 768) { // Tailwind's md breakpoint
            setIsMobileMenuOpen(false);
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Массив для навигационных ссылок
  const navLinks = [
    { name: 'Shop', path: '/' },
    { name: 'Genres', path: '/genres' },
    { name: 'Authors', path: '/authors' },
    { name: 'About us', path: '/info' },
  ];

  return (
    <nav className="relative bg-white shadow p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">

        {/* Левая часть: Логотип */}
        <div className="flex-shrink-0">
          {/* Убираем закрытие поиска из onClick */}
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/img/logo.png" alt="BookVerse Logo" className="h-8 md:h-10 w-auto" /> {/* Немного увеличил высоту */}
          </Link>
        </div>

        {/* Центральная часть: Навигация для десктопа */}
        <div className="hidden md:flex space-x-4 lg:space-x-6"> {/* Уменьшил space-x для md */}
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                location.pathname === link.path
                  ? 'bg-indigo-100 text-indigo-700' // Стиль активной ссылки
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' // Стиль обычной ссылки
              }`}
              aria-current={location.pathname === link.path ? 'page' : undefined}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Правая часть: Иконки действий и мобильное меню */}
        <div className="flex items-center space-x-2 md:space-x-3">
          {/* Убираем иконку поиска */}

          {/* Иконки избранного, корзины, профиля - ЗАМЕНЯЕМ IMG НА ИКОНКИ */}
          <Link
            to="/favorites"
            aria-label="Favorites"
            className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-colors duration-200"
          >
            <HeartIcon className="h-6 w-6" />
          </Link>
          <Link
            to="/basket"
            aria-label="Shopping Cart"
            className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-colors duration-200"
           >
            <ShoppingCartIcon className="h-6 w-6" />
          </Link>
          <Link
             to="/profile"
             aria-label="Profile"
             className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-colors duration-200"
           >
            <UserCircleIcon className="h-6 w-6" />
          </Link>

          {/* Кнопка Гамбургера для мобильных */}
          <div className="md:hidden">
            <button
              onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                  // setIsSearchOpen(false); // Больше не нужно
              }}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Выпадающее Мобильное Меню */}
      <div
        id="mobile-menu"
        className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden transition-max-height duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96' : 'max-h-0' // Используем max-h-96 (или другое значение)
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
               className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                location.pathname === link.path
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              aria-current={location.pathname === link.path ? 'page' : undefined}
              // Закрытие меню обрабатывается через useEffect[location]
            >
              {link.name}
            </Link>
          ))}
        </div>
         {/* Можно добавить разделитель перед иконками в моб. меню */}
         {/* <div className="border-t border-gray-200 pt-4 pb-3">
             <div className="flex items-center px-5">
                <Link to="/favorites" ... >Favorites</Link> ... etc
             </div>
         </div> */}
      </div>

       {/* Убираем Панель Поиска */}
       {/* <div className={`absolute ... ${isSearchOpen ? ...}`}> ... </div> */}
    </nav>
  );
};

export default Header;