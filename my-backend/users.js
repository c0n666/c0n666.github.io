const express = require('express');
const router = express.Router();
const admin = require('./firebaseAdmin');
const authMiddleware = require('./authMiddleware');

// Email та пароль прості перевірки
function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

// POST /register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!validateEmail(email) || !validatePassword(password)) {
    return res.status(400).json({ error: 'Невірна електронна пошта або пароль (мінімум 6 символів)' });
  }

  try {
    const userRecord = await admin.auth().createUser({ email, password });
    res.status(201).json({ uid: userRecord.uid, email: userRecord.email });
  } catch (error) {
    console.error('Помилка реєстрації:', error.message);
    res.status(500).json({ error: 'Помилка під час створення користувача', details: error.message });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!validateEmail(email) || !validatePassword(password)) {
    return res.status(400).json({ error: 'Невірна електронна пошта або пароль' });
  }

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    res.status(200).json({ uid: userRecord.uid, email: userRecord.email });
  } catch (error) {
    console.error('Помилка входу:', error.message);
    res.status(401).json({ error: 'Невірна електронна пошта або користувача не існує' });
  }
});

// GET /profile — захищений маршрут
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await admin.auth().getUser(req.user.uid);
    res.status(200).json({ email: user.email, uid: user.uid });
  } catch (error) {
    res.status(500).json({ error: 'Не вдалося отримати дані користувача' });
  }
});

// GET /completed-goals?from=2023-01-01&to=2023-02-01
router.get('/completed-goals', authMiddleware, async (req, res) => {
    const { from, to } = req.query;
  
    if (!from || !to) {
      return res.status(400).json({ error: 'Потрібні параметри from та to' });
    }
  
    try {
      // TODO: Замініть цей приклад на вашу логіку отримання цілей з бази даних
      // Наприклад, виклик Firestore, SQL тощо.
      // Тут повернемо мокові дані:
  
      const completedGoals = [
        { id: 1, title: 'Goal 1', completedAt: '2023-01-15' },
        { id: 2, title: 'Goal 2', completedAt: '2023-01-20' }
      ].filter(goal => goal.completedAt >= from && goal.completedAt <= to);
  
      res.json(completedGoals);
    } catch (error) {
      console.error('Помилка отримання завершених цілей:', error);
      res.status(500).json({ error: 'Внутрішня помилка сервера' });
    }
  });
  

module.exports = router;
