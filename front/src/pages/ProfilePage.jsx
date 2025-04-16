import React, { useState, useEffect } from "react";
import axios from "axios";
// Импортируем Link для ссылки на админ-панель
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify"; // Для более приятных уведомлений об ошибках
// Иконки для кнопки админки и логаута
import { ArrowRightOnRectangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const API_URL = "http://localhost:8000";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  // Убираем adminData, так как будет ссылка на отдельную страницу
  // const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Начинаем с true
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Please log in to view your profile.");
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true); // Устанавливаем загрузку перед запросом
      setError(""); // Сбрасываем ошибку
      try {
        // Запрашиваем только данные пользователя
        const userResponse = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(userResponse.data);
        console.log("User data:", userResponse.data);

        // Убираем запрос /users/admin с этой страницы
        // if (userResponse.data.role_id === 1) { ... }

      } catch (err) {
        console.error("Profile fetch error:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          url: err.config?.url
        });
        const errorMessage = err.response?.data?.detail || "Failed to load profile information.";
        setError(errorMessage);
        toast.error(errorMessage); // Показываем ошибку через toast

        // Если ошибка авторизации/аутентификации, разлогиниваем и редиректим
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("nickname"); // Также убираем nickname
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]); // Зависимость только от navigate

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    // Добавляем try...catch и здесь на всякий случай
    try {
      // Опционально: сообщить бэкенду о выходе (если есть такой эндпоинт)
      // await axios.post(`${API_URL}/users/logout`, {}, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      console.log("Logging out...");
    } catch (err) {
      // Даже если запрос на бэкенд не удался, все равно чистим локально
      console.error("Logout API call failed (continuing local logout):", err);
    } finally {
      // Всегда чистим localStorage и перенаправляем
      localStorage.removeItem("token");
      localStorage.removeItem("nickname"); // Не забываем nickname
      toast.success("You have been logged out.");
      navigate("/login");
    }
  };

  // Улучшенное состояние загрузки
  if (loading) {
    return (
      <div className="flex min-h-screen justify-center items-center bg-gray-100">
         <div className="text-center">
             <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             <p className="text-gray-500 text-sm mt-4">Loading profile...</p>
         </div>
      </div>
    );
  }

  // Улучшенное состояние ошибки
  if (error && !userData) { // Показываем только если нет данных пользователя
    return (
      <div className="flex min-h-screen justify-center items-center bg-gray-100 p-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Profile</h2>
            <p className="text-red-500 mb-6">{error}</p>
            <button
                onClick={() => window.location.reload()} // Простая перезагрузка страницы
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-4"
            >
                Retry
            </button>
             <button
                 onClick={handleLogout} // Даем возможность выйти, если ошибка постоянная
                 className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
             >
                 Log Out
            </button>
        </div>
      </div>
    );
  }

  // Если нет userData после загрузки (маловероятно, но возможно)
  if (!userData) {
      return (
          <div className="flex min-h-screen justify-center items-center bg-gray-100">
              <p className="text-gray-500">Could not load user data.</p>
          </div>
      );
  }

  // --- Основная разметка страницы ---
  return (
    // Добавляем отступы и фон
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Центрированный контейнер с адаптивной шириной */}
      <div className="mx-auto w-full max-w-md md:max-w-lg">
        {/* Заголовок */}
        <h2 className="mb-8 text-center text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          Your Profile
        </h2>

        {/* Карточка профиля */}
        <div className="bg-white p-6 md:p-8 shadow-lg rounded-lg">
          <div className="space-y-4">
             {/* Используем более описательные лейблы и стили */}
            
             <div className="flex justify-between items-center border-b pb-2">
                 <span className="text-sm font-medium text-gray-500">Nickname</span>
                 <span className="text-base font-semibold text-gray-900">{userData.nickname}</span>
             </div>
             <div className="flex justify-between items-center border-b pb-2">
                 <span className="text-sm font-medium text-gray-500">Email</span>
                 <span className="text-base text-gray-900">{userData.email}</span>
            </div>
             <div className="flex justify-between items-center">
                 <span className="text-sm font-medium text-gray-500">Account Type</span>
                 {/* Отображаем роль более понятно */}
                 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                     userData.role_id === 1
                       ? 'bg-indigo-100 text-indigo-800'
                       : 'bg-green-100 text-green-800'
                 }`}>
                     {userData.role_id === 1 ? "Administrator" : "User"}
                 </span>
             </div>
          </div>

          {/* Убираем отображение adminData */}
          {/* {userData.role_id === 1 && adminData && ( ... )} */}

          {/* --- Ссылка на Админ Панель (условно) --- */}
          {userData.role_id === 1 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                to="/admin" // Укажите правильный путь к вашей админ-панели
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                 <Cog6ToothIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                 Go to Admin Panel
              </Link>
            </div>
          )}

          {/* Кнопка Выхода */}
          <div className="mt-8">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" aria-hidden="true" />
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;