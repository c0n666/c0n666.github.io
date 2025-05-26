const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { db } = require('../firebaseAdmin');

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

router.get('/', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const { from, to } = req.query;

  try {
    let query = db.collection('goals')
      .where('userId', '==', userId)
      .where('status', '==', 'completed')
      // Виключаємо цілі без completedAt
      .where('completedAt', '!=', null);

    if (from) {
      const fromTimestamp = admin.firestore.Timestamp.fromDate(new Date(from));
      query = query.where('completedAt', '>=', fromTimestamp);
    }
    if (to) {
      const toTimestamp = admin.firestore.Timestamp.fromDate(new Date(to));
      query = query.where('completedAt', '<=', toTimestamp);
    }

    const snapshot = await query.get();
    const goals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Щоб клієнт отримував Date, а не Timestamp обʼєкт:
      completedAt: doc.data().completedAt.toDate(),
    }));

    res.json(goals);
  } catch (error) {
    console.error('Помилка отримання виконаних цілей:', error);
    res.status(500).json({ error: 'Помилка отримання виконаних цілей' });
  }
});

module.exports = router;
