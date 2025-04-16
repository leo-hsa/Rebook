// src/components/BasketPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
// Добавлены иконки PlusIcon, MinusIcon
import { TrashIcon, ShoppingBagIcon, ArrowLeftIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

// URL вашего API
const API_URL = "http://localhost:8000";

const BasketPage = () => {
  // --- Состояния ---
  const [basketItems, setBasketItems] = useState([]); // Товары в корзине
  const [loading, setLoading] = useState(true); // Глобальная загрузка страницы
  const [isPurchasing, setIsPurchasing] = useState(false); // Флаг процесса покупки
  const [error, setError] = useState(""); // Сообщение об ошибке
  // ID товара, количество которого сейчас обновляется (для блокировки кнопок +/-)
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // --- Функции ---

  // Функция для загрузки содержимого корзины
  const fetchBasketItems = useCallback(async () => {
    setError(""); // Сбрасываем ошибку при каждой загрузке
    // setLoading(true); // Убрано, чтобы избежать мигания при обновлении кол-ва
    try {
      const response = await axios.get(`${API_URL}/shop/basket/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) {
         setBasketItems(response.data);
      } else {
         console.error("API /shop/basket/ did not return an array:", response.data);
         setBasketItems([]);
         setError("Failed to load basket: Invalid data format.");
         toast.error("Failed to load basket: Invalid data format.");
      }
    } catch (err) {
      console.error("Error fetching basket:", err.response?.data || err.message);
      setError("Failed to load basket. Please try again later.");
      toast.error("Failed to load basket. Please try again later.");
      setBasketItems([]);
    } finally {
       // Устанавливаем loading в false только после первого запроса
       // subsequent calls (e.g., after delete) won't reset loading unnecessarily
       if (loading) {
           setLoading(false);
       }
    }
  }, [token, loading]); // Добавили loading в зависимости, чтобы setLoading(false) сработал

  // Функция обновления количества товара
  const updateQuantity = async (bookId, newQuantity) => {
    // Проверка: не обновляем если количество < 1 или уже идет обновление этого товара
    if (!token || newQuantity < 1 || updatingItemId === bookId) return;

    setUpdatingItemId(bookId); // Блокируем кнопки +/- для этого товара
    const previousBasketItems = JSON.parse(JSON.stringify(basketItems)); // Глубокое копирование для отката

    // Оптимистичное обновление UI
    setBasketItems(prev =>
        prev.map(item =>
            item.id === bookId ? { ...item, quantity: newQuantity } : item
        ).filter(item => item.quantity > 0) // Удаляем если количество стало 0 (хотя мы не даем нажать минус при 1)
    );

    try {
        // ИСПОЛЬЗУЕМ КОМБИНАЦИЮ DELETE + POST (Адаптируйте, если у вас есть PUT/PATCH)

        // Шаг 1 (опционально, но безопаснее): Удаляем старую запись
         try {
            await axios.delete(`${API_URL}/shop/basket/${bookId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(`Intermediate delete for ${bookId} successful (or item wasn't there)`);
         } catch (deleteError) {
            if (deleteError.response?.status !== 404) {
                 console.warn("Error during intermediate delete in updateQuantity:", deleteError);
                 // Если удаление не удалось по другой причине, возможно стоит прервать обновление
                 throw deleteError; // Перебрасываем ошибку, чтобы сработал внешний catch
            }
             console.log(`Intermediate delete for ${bookId} skipped (item likely already removed).`);
         }

        // Шаг 2: Добавляем товар с новым количеством (передаем quantity в ТЕЛЕ)
        await axios.post(
            `${API_URL}/shop/basket/${bookId}`,
            { quantity: newQuantity }, // Тело запроса с новым количеством
            { headers: { Authorization: `Bearer ${token}` } }
        );
        // Если дошли сюда, значит обновление на сервере успешно
        // Можно вывести тихое уведомление или ничего не делать
        console.log(`Quantity for ${bookId} updated to ${newQuantity} on server.`);
        // fetchBasketItems(); // Можно раскомментировать для полной синхронизации, но не обязательно

    } catch (err) {
        const errorMsg = err.response?.data?.detail || `Failed to update quantity for book ${bookId}.`;
        console.error("Error updating quantity:", err.response?.data || err.message);
        setError(errorMsg); // Показываем ошибку на странице
        toast.error(errorMsg); // И в уведомлении
        // Откатываем UI к предыдущему состоянию
        setBasketItems(previousBasketItems);
    } finally {
        setUpdatingItemId(null); // Разблокируем кнопки в любом случае
    }
  };


  // Функция для полного удаления товара из корзины
  const removeFromBasket = async (bookId) => {
    if (!token) return;
    const previousBasketItems = JSON.parse(JSON.stringify(basketItems)); // Для отката

    // Оптимистичное обновление UI
    setBasketItems(prev => prev.filter(item => item.id !== bookId));

    try {
      await axios.delete(`${API_URL}/shop/basket/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
        // Добавляем параметр hard_delete=true если ваше API его поддерживает
        // params: { hard_delete: true }
      });
      toast.success("Item removed from basket.", { autoClose: 2000 });
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Failed to remove item from basket.";
      console.error("Error removing from basket:", err.response?.data || err.message);
      setError(errorMsg);
      toast.error(errorMsg);
      // Откатываем UI
       setBasketItems(previousBasketItems);
    }
  };

  // Функция для оформления заказа
  const handlePurchase = async () => {
    if (!token || basketItems.length === 0 || isPurchasing) return; // Доп. проверка на isPurchasing
    setIsPurchasing(true);
    setError("");
    try {
      const response = await axios.post(
        `${API_URL}/shop/basket/purchase`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message || "Purchase completed successfully!", { autoClose: 3000 });
      setBasketItems([]); // Очищаем корзину
      // navigate('/order-history'); // Опциональный редирект
    } catch (err) {
       const errorMsg = err.response?.data?.detail || "Failed to complete purchase.";
       console.error("Error during purchase:", err.response?.data || err.message);
       setError(errorMsg);
       toast.error(errorMsg);
    } finally {
      setIsPurchasing(false);
    }
  };

  // Расчет общей суммы
  const totalPrice = useMemo(() => {
    return basketItems.reduce((sum, item) => {
        const price = typeof item.price === 'number' ? item.price : 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
        return sum + (price * quantity);
        }, 0);
  }, [basketItems]);

  // Форматирование цены (замените 'USD' на нужную валюту)
  const formatCurrency = (amount) => {
      return new Intl.NumberFormat('ru-KZ', { style: 'currency', currency: 'KZT' }).format(amount);
  }

  // --- Эффекты ---
  // Загрузка корзины при монтировании или изменении токена/функции fetch
  useEffect(() => {
    if (!token) {
      toast.info("Please log in to view your basket.");
      navigate("/login");
      return; // Прерываем, если нет токена
    }
    // Вызываем fetchBasketItems только если токен есть
    fetchBasketItems();
  }, [token, navigate, fetchBasketItems]); // Включаем fetchBasketItems в зависимости


  // --- JSX Рендеринг ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Заголовок и кнопка "Назад" */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
           <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
               <ShoppingBagIcon className="h-7 w-7 md:h-8 md:w-8 mr-3 text-indigo-600" /> My Shopping Basket
           </h1>
           <Link to="/" className="inline-flex items-center px-3 py-1 md:px-4 md:py-2 border border-gray-300 rounded-md shadow-sm text-xs md:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <ArrowLeftIcon className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" /> Back to Shop
           </Link>
        </div>

        {/* Сообщение об ошибке */}
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md relative mb-6 shadow-sm" role="alert">
                <div className="flex">
                    <div className="py-1"><svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg></div>
                    <div>
                        <p className="font-bold">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                     <button onClick={() => setError("")} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close error message">
                         <svg className="fill-current h-6 w-6 text-red-500 opacity-70 hover:opacity-100" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                    </button>
                </div>
            </div>
        )}

        {/* Состояния загрузки / пустой корзины / списка товаров */}
        {loading ? (
             <div className="text-center py-20">
                 {/* Можно добавить красивый спиннер */}
                 <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 <p className="text-gray-500 text-sm mt-4">Loading your basket...</p>
             </div>
        ) : basketItems.length === 0 ? (
             <div className="text-center py-16 bg-white rounded-lg shadow">
                 <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-300" />
                 <p className="mt-5 text-xl font-semibold text-gray-700">Your basket is empty</p>
                 <p className="mt-2 text-sm text-gray-500">Add some amazing books to get started.</p>
                 <Link to="/" className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                     Start Shopping
                </Link>
             </div>
        ) : (
          <div className="space-y-4 md:space-y-6"> {/* Отступы между карточками */}
            {/* Список товаров */}
            {basketItems.map((item) => (
              item && item.id ? ( // Доп. проверка на всякий случай
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200 gap-4">
                   {/* Изображение */}
                   <div className="w-24 h-36 md:w-28 md:h-40 flex-shrink-0 bg-gray-100 rounded overflow-hidden self-center sm:self-start">
                       <img
                           src={item.img ? (item.img.startsWith('http') ? item.img : `${API_URL}${item.img}`) : "https://via.placeholder.com/96x144?text=No+Cover"}
                           alt={`${item.title} cover`}
                           className="w-full h-full object-contain"
                           onError={(e) => { e.target.src = 'https://via.placeholder.com/96x144?text=No+Cover'; }}
                           loading="lazy"
                       />
                   </div>
                   {/* Информация и Счетчик */}
                   <div className="flex-grow w-full text-center sm:text-left">
                       <Link to={`/book/${item.id}`} className="text-lg font-semibold text-gray-800 hover:text-indigo-600 line-clamp-2 mb-1 block">
                           {item.title || "No Title"}
                        </Link>
                       <p className="text-sm text-gray-500 mb-2">{item.author_name || "Unknown Author"}</p>
                       {/* --- СЧЕТЧИК --- */}
                       <div className="flex items-center justify-center sm:justify-start space-x-3 my-2">
                           <button
                               onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                               disabled={item.quantity <= 1 || updatingItemId === item.id}
                               className={`p-1.5 rounded-full border transition-colors duration-150 ${
                                   item.quantity <= 1 || updatingItemId === item.id
                                   ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                   : 'border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-1'
                               }`}
                               aria-label="Decrease quantity"
                           >
                               <MinusIcon className="h-4 w-4" />
                           </button>
                           <span className="text-base font-medium text-gray-800 w-8 text-center tabular-nums">
                               {updatingItemId === item.id ? (
                                    <svg className="animate-spin h-4 w-4 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                     </svg>
                               ) : (item.quantity || 1)}
                           </span>
                           <button
                               onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                               disabled={updatingItemId === item.id}
                               className={`p-1.5 rounded-full border transition-colors duration-150 ${
                                   updatingItemId === item.id
                                   ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                   : 'border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-1'
                               }`}
                               aria-label="Increase quantity"
                           >
                               <PlusIcon className="h-4 w-4" />
                           </button>
                       </div>
                       {/* --- КОНЕЦ СЧЕТЧИКА --- */}
                   </div>
                   {/* Цена и Кнопка удаления */}
                   <div className="flex flex-col items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 sm:ml-4 self-center sm:self-end">
                       <p className="text-lg font-semibold text-gray-900 mb-1 text-right">
                           {formatCurrency(item.price * (item.quantity || 1))}
                       </p>
                       {item.quantity > 1 && (
                           <p className="text-xs text-gray-500 mb-2 text-right">
                               ({formatCurrency(item.price)} each)
                           </p>
                       )}
                       <button
                           onClick={() => removeFromBasket(item.id)}
                           className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 transition-colors"
                           aria-label={`Remove ${item.title} from basket`}
                           title="Remove item"
                       >
                           <TrashIcon className="h-5 w-5" />
                       </button>
                   </div>
                </div>
              ) : null
            ))}

            {/* Итого и кнопка покупки */}
            <div className="mt-8 pt-6 border-t border-gray-200 bg-white p-6 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
               <div className="text-center sm:text-left">
                   <span className="text-lg font-medium text-gray-500">Total Price:</span>
                   <span className="ml-2 text-2xl font-bold text-gray-900">{formatCurrency(totalPrice)}</span>
               </div>
               <button
                   onClick={handlePurchase}
                   disabled={isPurchasing || basketItems.length === 0}
                   className={`inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white transition-colors duration-200 ${
                       isPurchasing || basketItems.length === 0
                       ? 'bg-gray-400 cursor-not-allowed'
                       : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                   }`}
               >
                   {isPurchasing ? (
                       <>
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           Processing...
                       </>
                   ) : (
                       <>
                           Proceed to Checkout
                           <ShoppingBagIcon className="ml-3 -mr-1 h-5 w-5" aria-hidden="true" />
                       </>
                   )}
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasketPage;