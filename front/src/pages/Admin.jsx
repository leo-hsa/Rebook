import React, { useState } from 'react';
import axios from 'axios';

const Admin = () => {
  // Состояние для формы книги
  const [bookForm, setBookForm] = useState({
    id: '',
    title: '',
    description: '',
    author_name: '',
    genre_name: '',
    release_date: '',
    img: null,
  });

  // Состояние для формы жанра
  const [genreForm, setGenreForm] = useState({
    name: '',
    img: null,
  });

  // Состояние для формы автора
  const [authorForm, setAuthorForm] = useState({
    name: '',
    info: '',  // Добавлено поле info
  });

  // Состояние для сообщений
  const [message, setMessage] = useState('');

  // Обработка изменений в форме книги
  const handleBookChange = (e) => {
    const { name, value } = e.target;
    setBookForm({ ...bookForm, [name]: value });
  };

  const handleBookFileChange = (e) => {
    setBookForm({ ...bookForm, img: e.target.files[0] });
  };

  // Обработка изменений в форме жанра
  const handleGenreChange = (e) => {
    const { name, value } = e.target;
    setGenreForm({ ...genreForm, [name]: value });
  };

  const handleGenreFileChange = (e) => {
    setGenreForm({ ...genreForm, img: e.target.files[0] });
  };

  // Обработка изменений в форме автора
  const handleAuthorChange = (e) => {
    const { name, value } = e.target;
    setAuthorForm({ ...authorForm, [name]: value });
  };

  // Отправка формы книги
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('id', bookForm.id);
    formData.append('title', bookForm.title);
    formData.append('description', bookForm.description);
    formData.append('authorUbername', bookForm.author_name);
    if (bookForm.genre_name) formData.append('genre_name', bookForm.genre_name);
    if (bookForm.release_date) formData.append('release_date', bookForm.release_date);
    if (bookForm.img) formData.append('img', bookForm.img);

    try {
      const response = await axios.post('http://localhost:8000/admin/books/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(`Book created: ${response.data.title}`);
      setBookForm({ id: '', title: '', description: '', author_name: '', genre_name: '', release_date: '', img: null });
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.detail || 'Something went wrong'}`);
    }
  };

  // Отправка формы жанра
  const handleGenreSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', genreForm.name);
    if (genreForm.img) formData.append('img', genreForm.img);

    try {
      const response = await axios.post('http://localhost:8000/admin/genres/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(`Genre created: ${response.data.name}`);
      setGenreForm({ name: '', img: null });
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.detail || 'Something went wrong'}`);
    }
  };

  // Отправка формы автора
  const handleAuthorSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', authorForm.name);
    if (authorForm.info) formData.append('info', authorForm.info);  // Добавлено info

    try {
      const response = await axios.post('http://localhost:8000/admin/authors/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(`Author created: ${response.data.name}`);
      setAuthorForm({ name: '', info: '' });
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.detail || 'Something went wrong'}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Admin Panel</h1>
      {message && <p style={{ color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>}

      {/* Форма для создания книги */}
      <h2>Create Book</h2>
      <form onSubmit={handleBookSubmit} style={{ marginBottom: '40px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>ID:</label><br />
          <input
            type="text"
            name="id"
            value={bookForm.id}
            onChange={handleBookChange}
            required
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Title:</label><br />
          <input
            type="text"
            name="title"
            value={bookForm.title}
            onChange={handleBookChange}
            required
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Description:</label><br />
          <textarea
            name="description"
            value={bookForm.description}
            onChange={handleBookChange}
            required
            style={{ width: '100%', padding: '5px', minHeight: '100px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Author Name:</label><br />
          <input
            type="text"
            name="author_name"
            value={bookForm.author_name}
            onChange={handleBookChange}
            required
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Genre Name (optional):</label><br />
          <input
            type="text"
            name="genre_name"
            value={bookForm.genre_name}
            onChange={handleBookChange}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Release Date (optional):</label><br />
          <input
            type="date"
            name="release_date"
            value={bookForm.release_date}
            onChange={handleBookChange}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Image (optional):</label><br />
          <input
            type="file"
            name="img"
            onChange={handleBookFileChange}
            style={{ width: '100%' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>Create Book</button>
      </form>

      {/* Форма для создания жанра */}
      <h2>Create Genre</h2>
      <form onSubmit={handleGenreSubmit} style={{ marginBottom: '40px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Name:</label><br />
          <input
            type="text"
            name="name"
            value={genreForm.name}
            onChange={handleGenreChange}
            required
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Image (optional):</label><br />
          <input
            type="file"
            name="img"
            onChange={handleGenreFileChange}
            style={{ width: '100%' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>Create Genre</button>
      </form>

      {/* Форма для создания автора */}
      <h2>Create Author</h2>
      <form onSubmit={handleAuthorSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Name:</label><br />
          <input
            type="text"
            name="name"
            value={authorForm.name}
            onChange={handleAuthorChange}
            required
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Info (optional):</label><br />
          <textarea
            name="info"
            value={authorForm.info}
            onChange={handleAuthorChange}
            style={{ width: '100%', padding: '5px', minHeight: '100px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>Create Author</button>
      </form>
    </div>
  );
};

export default Admin;