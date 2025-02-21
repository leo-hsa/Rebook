import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Очищаем ошибку при изменении поля
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Простая валидация на стороне клиента
    if (!form.email || !form.password) {
      setError("Пожалуйста, заполните все поля.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        process.env.REACT_APP_API_URL + "/auth/login", // Используем переменную окружения
        {
          username: form.email,
          password: form.password,
        }
      );

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("nickname", response.data.nickname);
      navigate("/");
    } catch (err) {
      console.error("Ошибка входа:", err);
      let errorMessage = "Ошибка входа";

      if (err.response && err.response.data) {
        errorMessage = err.response.data.detail || "Неизвестная ошибка";
      } else if (err.request) {
        errorMessage = "Нет ответа от сервера.";
      } else {
        errorMessage = "Произошла ошибка при отправке запроса.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Вход</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
          required
          aria-label="Email"
        />
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
          required
          aria-label="Пароль"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? "Входим..." : "Войти"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;