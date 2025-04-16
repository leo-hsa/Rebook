// src/pages/InfoPage.jsx

import React from 'react'; // Необходим для JSX
import { Link } from 'react-router-dom'; // Для навигационных ссылок
import { InformationCircleIcon, BuildingLibraryIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'; // Иконки


const InfoPage = () => {
    return (
        <div className="flex flex-col min-h-screen"> {/* Обертка для прижатия футера */}
     

            {/* Основной контент страницы About Us */}
            <main className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-4xl"> {/* Ограничиваем ширину */}

                    {/* Заголовок страницы */}
                    <div className="text-center mb-12">
                        <InformationCircleIcon className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                            About Rebook
                        </h1>
                        <p className="mt-4 text-lg leading-7 text-gray-600">
                            Your gateway to a universe of stories.
                        </p>
                    </div>

                    {/* Секции с информацией */}
                    <div className="bg-white shadow-lg rounded-lg p-6 md:p-10 space-y-8">
                        {/* Секция Миссия */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                                <BuildingLibraryIcon className="h-6 w-6 mr-2 text-indigo-600" />
                                Our Mission
                            </h2>
                            <div className="prose prose-indigo max-w-none text-gray-700 space-y-4">
                                <p>
                                    At Rebook, we believe in the transformative power of reading. Our mission is to connect readers
                                    with the books they'll love, fostering a vibrant community around literature and knowledge.
                                    We aim to make discovering and acquiring books a seamless and enjoyable experience for everyone.
                                </p>
                                <p>
                                    Whether you're searching for the latest bestsellers, timeless classics, hidden gems by new authors,
                                    or specific academic texts, Rebook is designed to be your trusted companion in your reading journey.
                                </p>
                            </div>
                        </section>

                         {/* Секция Что мы предлагаем */}
                         <section className="pt-6 border-t border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                What We Offer
                            </h2>
                            <ul className="list-disc list-outside space-y-3 pl-5 text-gray-700">
                                <li>
                                    <span className="font-medium">A Vast Collection:</span> Explore thousands of titles across diverse genres, from fiction and fantasy to business and children's books.
                                </li>
                                <li>
                                    <span className="font-medium">Easy Discovery:</span> Find books by title, author, or genre with our intuitive search and filtering options.
                                </li>
                                <li>
                                    <span className="font-medium">Personalized Experience:</span> Log in to save your favorite books and manage your reading list easily.
                                </li>
                                <li>
                                    <span className="font-medium">Simple & Secure:</span> A straightforward platform to browse and learn more about the books that capture your interest. (Note: Actual purchase functionality depends on future implementation).
                                </li>
                            </ul>
                        </section>

                        {/* Секция Призыв к действию / Ссылки */}
                        <section className="pt-6 border-t border-gray-200">
                             <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                Start Exploring
                            </h2>
                            <p className="text-gray-700 mb-6">
                                Ready to find your next great read? Dive into our collection now!
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to="/" // Ссылка на главную (Shop)
                                    className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    Browse All Books
                                    <ArrowTopRightOnSquareIcon className="ml-2 h-4 w-4" />
                                </Link>
                                <Link
                                    to="/genres"
                                    className="inline-flex items-center px-5 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    Explore Genres
                                </Link>
                                <Link
                                    to="/authors"
                                    className="inline-flex items-center px-5 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    Discover Authors
                                </Link>
                            </div>
                        </section>
                    </div>

                </div>
            </main>

          
        </div>
    );
};

export default InfoPage;