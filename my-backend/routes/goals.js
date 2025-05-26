const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');
const admin = require('firebase-admin');


// Middleware для перевірки токена
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Функція перевірки валідності дати
function isValidDate(dateStr) {
  const d = new Date(dateStr);
  return !isNaN(d);
}

// GET /goals - отримати цілі користувача з фільтрами
router.get('/', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const { status, from, to } = req.query;

  // Перевірка дат
  if (from && !isValidDate(from)) {
    return res.status(400).json({ error: 'Невірний формат дати from' });
  }
  if (to && !isValidDate(to)) {
    return res.status(400).json({ error: 'Невірний формат дати to' });
  }

  try {
    let queryRef = db.collection('goals').where('userId', '==', userId);

    // Валідація і застосування статусу
    if (status) {
      const allowedStatuses = ['active', 'completed', 'postponed'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Невідомий статус' });
      }
      queryRef = queryRef.where('status', '==', status);
    }

    const snapshot = await queryRef.get();

    let goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (from || to) {
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;

      goals = goals.filter(goal => {
        if (!goal.completedAt) return false;
        const completedAt = goal.completedAt.toDate ? goal.completedAt.toDate() : new Date(goal.completedAt);

        if (fromDate && completedAt < fromDate) return false;
        if (toDate && completedAt > toDate) return false;

        return true;
      });
    }

    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Помилка отримання цілей' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const { title, status, completedAt, startDate, endDate } = req.body;

  if (!title || !status) {
    return res.status(400).json({ error: 'Відсутні обов\'язкові поля: title або status' });
  }

  const allowedStatuses = ['active', 'completed', 'postponed'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Невідомий статус' });
  }

  // Перевірка валідності дат (опційно)
  if ((startDate && isNaN(new Date(startDate))) || (endDate && isNaN(new Date(endDate)))) {
    return res.status(400).json({ error: 'Невірний формат дати startDate або endDate' });
  }

  try {
    const goalData = {
      userId,
      title,
      status,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      completedAt: status === 'completed'
        ? (completedAt ? new Date(completedAt) : new Date())
        : null,
    };

    const docRef = await db.collection('goals').add(goalData);
    res.status(201).json({ id: docRef.id, ...goalData });
  } catch (error) {
    console.error('Error adding goal:', error);
    res.status(500).json({ error: 'Помилка додавання цілі' });
  }
});

// PUT /goals/:id - оновити статус цілі (або інші поля)
router.put('/:id', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const goalId = req.params.id;
  const { status, title, startDate, endDate, completedAt } = req.body;

  const allowedStatuses = ['active', 'completed', 'postponed'];
  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Невідомий статус' });
  }

  try {
    const goalRef = db.collection('goals').doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      return res.status(404).json({ error: 'Ціль не знайдена' });
    }

    const goalData = goalDoc.data();

    // Перевіряємо, що ціль належить користувачу
    if (goalData.userId !== userId) {
      return res.status(403).json({ error: 'Доступ заборонено' });
    }

    // Формуємо оновлення
    const updateData = {};

    if (status) updateData.status = status;
    if (title) updateData.title = title;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (completedAt) updateData.completedAt = new Date(completedAt);

    // Якщо статус змінився на completed і completedAt не заданий, ставимо поточну дату
    if (status === 'completed' && !completedAt) {
      updateData.completedAt = new Date();
    }

    if (status) {
      updateData.status = status;
    
      if (status === 'completed') {
        updateData.completedAt = completedAt ? new Date(completedAt) : new Date();
      } else {
        updateData.completedAt = null;  // Очищуємо completedAt для не завершених цілей
      }
    }    

    await goalRef.update(updateData);

    const updatedGoalDoc = await goalRef.get();

    res.json({ id: updatedGoalDoc.id, ...updatedGoalDoc.data() });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Помилка оновлення цілі' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const goalId = req.params.id;

  try {
    const goalRef = db.collection('goals').doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      return res.status(404).json({ error: 'Ціль не знайдена' });
    }

    const goalData = goalDoc.data();

    // Перевірка, чи належить ціль користувачу
    if (goalData.userId !== userId) {
      return res.status(403).json({ error: 'Доступ заборонено' });
    }

    await goalRef.delete();

    res.json({ message: 'Ціль успішно видалено' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Помилка видалення цілі' });
  }
});


module.exports = router;