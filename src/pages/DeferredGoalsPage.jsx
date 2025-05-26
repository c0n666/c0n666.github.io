import React, { useEffect, useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';
import '../CSS/myGoals.css';
import '../CSS/deferredGoals.css';

const DeferredGoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [user, setUser] = useState(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Встановлення користувача
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Завантаження цілей з API
  useEffect(() => {
    if (!user) return;

    const fetchGoals = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/goals?status=postponed`, {   // змінено статус на 'postponed'
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error('Не вдалося завантажити цілі');
        const data = await res.json();
        setGoals(data);
      } catch (error) {
        console.error(error);
        setErrorMessage('Помилка при завантаженні відкладених цілей');
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [user]);

  // Додавання нової цілі
  const handleCreateGoal = async () => {
    if (!newGoalTitle.trim() || !user) {
      setErrorMessage('Поле не може бути порожнім');
      return;
    }
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newGoalTitle,
          status: 'postponed'   // теж змінено на 'postponed'
        })
      });

      if (!res.ok) throw new Error('Не вдалося створити ціль');
      const newGoal = await res.json();
      setGoals((prev) => [...prev, newGoal]);
      setNewGoalTitle('');
    } catch (error) {
      console.error(error);
      setErrorMessage('Помилка при створенні цілі');
    }
  };

  // Видалення цілі
  const handleDeleteGoal = async (goalId) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Не вдалося видалити ціль');
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    } catch (error) {
      console.error(error);
      setErrorMessage('Помилка при видаленні цілі');
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