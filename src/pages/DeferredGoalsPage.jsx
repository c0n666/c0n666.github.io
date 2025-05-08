import React, { useEffect, useState } from 'react';
import { PlusCircle, X } from 'lucide-react'; // Додали X
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link } from 'react-router-dom';
import '../CSS/myGoals.css';
import '../CSS/deferredGoals.css';

const DeferredGoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [user, setUser] = useState(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchGoals = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'goals'),
          where('userId', '==', user.uid),
          where('status', '==', 'deferred')
        );
        const snapshot = await getDocs(q);
        const fetchedGoals = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setGoals(fetchedGoals);
      } catch (error) {
        setErrorMessage('Помилка при завантаженні відкладених цілей');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, [user]);

  const handleCreateGoal = async () => {
    if (!newGoalTitle.trim() || !user) {
      setErrorMessage('Поле не може бути порожнім');
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'goals'), {
        title: newGoalTitle,
        userId: user.uid,
        status: 'deferred'
      });
      setGoals((prev) => [...prev, { id: docRef.id, title: newGoalTitle, status: 'deferred' }]);
      setNewGoalTitle('');
    } catch (error) {
      setErrorMessage('Помилка при створенні цілі');
      console.error(error);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await deleteDoc(doc(db, 'goals', goalId));
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    } catch (error) {
      setErrorMessage('Помилка при видаленні цілі');
      console.error(error);
    }
  };

  return (
    <div className="my-goals-page">
      <header className="navigation-menu">
        <nav>
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/active" className="nav-btn">Активні цілі</Link>
            </li>
            <li className="nav-item">
              <Link to="/completed" className="nav-btn">Виконані</Link>
            </li>
            <li className="nav-item">
              <Link to="/deferred" className="nav-btn active">Відкладені цілі</Link>
            </li>
            <li className="nav-item">
              <Link to="/calendar" className="nav-btn">Календар</Link>
            </li>
          </ul>
        </nav>
      </header>

      <div className="goal-input-container">
        <input
          type="text"
          placeholder="Нова відкладена ціль..."
          value={newGoalTitle}
          onChange={(e) => setNewGoalTitle(e.target.value)}
        />
        <button className="create-goal-btn" onClick={handleCreateGoal}>
          <PlusCircle size={20} />
          Додати
        </button>
      </div>

      <section className="goals-list column-layout">
        {loading ? (
          <div className="loading-state">Завантаження...</div>
        ) : errorMessage ? (
          <div className="error-state">{errorMessage}</div>
        ) : goals.length === 0 ? (
          <div className="empty-state">Немає відкладених цілей</div>
        ) : (
          goals.map((goal) => (
            <div className="goal-card fade-in" key={goal.id}>
              <div className="goal-header">
                <h3>{goal.title}</h3>
                <button
                  className="delete-icon-btn"
                  onClick={() => handleDeleteGoal(goal.id)}
                  title="Видалити"
                >
                  <X size={22} />
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default DeferredGoalsPage;
