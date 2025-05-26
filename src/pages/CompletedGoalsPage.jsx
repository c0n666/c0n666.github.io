import React, { useEffect, useState } from 'react';
import { RotateCcw, Trash } from 'lucide-react';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import '../CSS/myGoals.css';

const API_URL = 'http://localhost:5000/api/goals';

const CompletedGoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchGoals(currentUser);
      } else {
        setGoals([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchGoals = async (currentUser) => {
    if (!currentUser) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${API_URL}?status=completed`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Не вдалося завантажити цілі');
      const data = await res.json();
      setGoals(data);
    } catch (error) {
      setErrorMessage('Помилка при завантаженні цілей');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (goalId) => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/${goalId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Не вдалося видалити ціль');
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    } catch (error) {
      setErrorMessage('Помилка при видаленні цілі');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (goalId) => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'active' })
      });
      if (!res.ok) throw new Error('Не вдалося відновити ціль');
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
      navigate('/active');
    } catch (error) {
      setErrorMessage('Помилка при оновленні статусу');
      console.error(error);
    } finally {
      setLoading(false);
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
              <Link to="/deferred" className="nav-btn">Відкладені цілі</Link>
            </li>
            <li className="nav-item">
              <Link to="/calendar" className="nav-btn">Календар</Link>
            </li>
          </ul>
        </nav>
      </header>

      <section className="goals-list">
        {loading ? (
          <div className="loading-state">Завантаження...</div>
        ) : errorMessage ? (
          <div className="error-state">{errorMessage}</div>
        ) : goals.length === 0 ? (
          <div className="empty-state">Немає виконаних цілей</div>
        ) : (
          goals.map((goal) => (
            <div className="goal-card fade-in" key={goal.id}>
              <h3>{goal.title}</h3>
              <div className="goal-footer">
                <div className="goal-actions">
                  <button
                    className="status-btn"
                    onClick={() => handleRestore(goal.id)}
                  >
                    <RotateCcw size={20} color="#51b687" />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(goal.id)}
                  >
                    <Trash size={20} color="#51b687" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default CompletedGoalsPage;
