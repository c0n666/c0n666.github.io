// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./users');
const goalRoutes = require('./routes/goals');
const completedGoalRoutes = require('./routes/completedGoals');

// Завантаження змінних середовища
dotenv.config();

// Ініціалізація додатку
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Простий маршрут для перевірки стану сервера
app.get('/ping', (req, res) => {
  res.send('Сервер працює!');
});

// Тестовий маршрут, що повертає статичні дані
app.get('/api/test-data', (req, res) => {
  res.json({
    message: 'Це тестові дані',
    success: true,
    items: [10, 20, 30]
  });
});

// Основні маршрути користувачів
app.use('/api/users', userRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/completed-goals', completedGoalRoutes);

// Порт
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Сервер запущено на порті ${PORT}`);
});
