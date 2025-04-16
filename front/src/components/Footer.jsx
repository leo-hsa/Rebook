import React from "react"; // React импортирован, но не используется явно, можно убрать, если нет JSX
import { Link } from "react-router-dom"; // Link используется

const Footer = () => {
    return (
        // Используем стандартную толщину границы и более нейтральный цвет
        // Добавляем паддинги для общего вида
        <footer className="border-t border-gray-200 bg-white px-4 pt-12 pb-8">
            {/* Контейнер для центрирования и ограничения ширины */}
            <div className="container mx-auto">
                {/* Основной контент футера: колонки */}
                {/*
                    - flex-col: Стек колонок на мобильных
                    - md:flex-row: Горизонтальное расположение на средних экранах и выше
                    - md:justify-between: Распределение пространства между колонками на десктопе
                    - items-center: Центрируем контент по вертикали на мобильных
                    - md:items-start: Выравниваем по верху на десктопе
                    - gap-10: Отступы между колонками (вертикальные на мобильных, горизонтальные на десктопе)
                    - text-center: Центрируем текст на мобильных
                    - md:text-left: Выравниваем текст по левому краю на десктопе
                */}
                <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start gap-10 text-center md:text-left">

                    {/* Колонка 1: Лого и адрес */}
                    {/* Добавляем mb-6 md:mb-0 для отступа снизу только на мобильных */}
                    <div className="mb-6 md:mb-0">
                        {/* Логотип */}
                        <p className="text-3xl font-bold text-indigo-600">Rebook</p>
                        <p className="text-sm font-medium text-gray-700">Read more books</p>

                        {/* Адрес - убираем большой pt-16, добавляем адекватный отступ сверху */}
                        <p className="text-gray-500 text-sm mt-6"> {/* Уменьшил шрифт адреса */}
                            Satbayev University 1934<br />
                            Almaty<br />
                            Kazakhstan
                        </p>
                    </div>

                    {/* Колонка 2: Ссылки */}
                    {/* Добавляем mb-6 md:mb-0 */}
                    <div className="mb-6 md:mb-0">
                         {/* Заголовок колонки */}
                        <p className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Links</p> {/* Улучшил стиль заголовка */}
                        {/*
                           - Убрал flex-col, justify-center, items-center с ul
                           - Добавил space-y-3 для вертикальных отступов между ссылками
                        */}
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">Shop</Link></li>
                            <li><Link to="/genres" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">Genres</Link></li>
                            <li><Link to="/authors" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">Authors</Link></li>
                            <li><Link to="/info" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">About us</Link></li>
                        </ul>
                    </div>

                    {/* Колонка 3: Помощь */}
                    {/* Добавляем mb-6 md:mb-0 */}
                    <div className="mb-6 md:mb-0">
                        <p className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Help</p>
                        <ul className="space-y-3">
                            {/* Добавим ссылки на другие возможные страницы помощи */}
                            <li><Link to="/privacy" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">Privacy Policies</Link></li>
                            <li><Link to="/terms" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">Terms of Service</Link></li>
                            <li><Link to="/contact" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Можно добавить 4-ю колонку для соцсетей или рассылки */}
                    {/*
                    <div className="mb-6 md:mb-0">
                        <p className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Follow Us</p>
                         <div className="flex justify-center md:justify-start space-x-4">
                            <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-indigo-600"> <svg>...</svg> </a>
                            <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-indigo-600"> <svg>...</svg> </a>
                            <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-indigo-600"> <svg>...</svg> </a>
                         </div>
                    </div>
                    */}

                </div>

                {/* Нижняя строка с копирайтом */}
                {/*
                    - Убираем большой mx-20, используем внутренний контейнер
                    - Добавляем отступ сверху mt-10
                    - Текст центрируем на мобильных, выравниваем по левому краю на десктопе
                */}
                <div className="mt-10 pt-6 border-t border-gray-200 text-center md:text-left">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} Rebook. All rights reserved. {/* Динамический год */}
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;