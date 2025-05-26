import React, { useEffect, useState} from 'react';
import { PlusCircle, Check, Trash } from 'lucide-react';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import '../CSS/myGoals.css';

const API_URL = 'http://localhost:5000/api/goals';

const ActiveGoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const getRemainingDays = (endDate) => {
    if (!endDate) return 0;
  
    let end;
  
    if (endDate?.toDate) {
      // Якщо Firebase Timestamp (має метод toDate)
      end = endDate.toDate();
    } else if (typeof endDate === 'string') {
      // Якщо рядок ISO
      end = new Date(endDate);
    } else if (endDate?._seconds) {
      // Якщо Firebase Timestamp у вигляді об'єкта з _seconds
      end = new Date(endDate._seconds * 1000);
    } else {
      // Якщо невідомий формат — повертаємо 0
      return 0;
    }
  
    if (isNaN(end.getTime())) return 0;
  
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  
    const diffTime = endDay - startOfToday;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    return diffDays < 0 ? 0 : diffDays;
  };
  

  

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
      const res = await fetch(`${API_URL}?status=active`, {
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

  const handleStatusUpdate = async (goalId, status) => {
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
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Не вдалося оновити статус цілі');
      // Видаляємо ціль з активних після оновлення статусу
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
      navigate('/completed');
    } catch (error) {
      setErrorMessage('Помилка при оновленні статусу');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!user || !newGoal.title || !newGoal.startDate || !newGoal.endDate) {
      setErrorMessage('Будь ласка, заповніть усі поля');
      return;
    }

    const start = new Date(newGoal.startDate);
    const end = new Date(newGoal.endDate);
    if (start >= end) {
      setErrorMessage('Дата завершення повинна бути після дати початку');
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const newGoalData = {
        title: newGoal.title,
        status: 'active',
        startDate: newGoal.startDate,
        endDate: newGoal.endDate,
        completedAt: null,
      };

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newGoalData)
      });

      if (!res.ok) throw new Error('Не вдалося створити ціль');
      const createdGoal = await res.json();

      setGoals((prev) => [...prev, createdGoal]);
      setShowModal(false);
      setNewGoal({ title: '', startDate: '', endDate: '' });
    } catch (error) {
      setErrorMessage('Помилка при створенні цілі');
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
        <button
          className="create-goal-btn"
          onClick={() => setShowModal(true)}
        >
          <PlusCircle size={20} />
          Створити ціль
        </button>
      </header>

      <section className="goals-list">
        {loading ? (
          <div className="loading-state">Завантаження...</div>
        ) : errorMessage ? (
          <div className="error-state">{errorMessage}</div>
        ) : goals.length === 0 ? (
          <div className="empty-state">У вас ще немає активних цілей</div>
        ) : (
          goals.map((goal) => {
            const daysLeft = getRemainingDays(goal.endDate);
            return (
              <div className="goal-card fade-in" key={goal.id}>
                <h3>{goal.title}</h3>
                <div className="goal-footer">
                  <div className="days-left">
                    <span
                      className={`days-count${
                        daysLeft <= 3
                          ? ' danger'
                          : daysLeft <= 7
                          ? ' warning'
                          : ' safe'
                      }`}
                    >
                      {daysLeft}
                    </span>
                    дн. до завершення
                  </div>
                  <div className="goal-actions">
                    <button
                      className="status-btn"
                      onClick={() => handleStatusUpdate(goal.id, 'completed')}
                    >
                      <Check size={20} color="#51b687" />
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
            );
          })
        )}
      </section>

      {showModal && (
        <div className="modal-backdrop fade-in">
          <div className="modal scale-in">
            <h2>Нова ціль</h2>
            <input
              type="text"
              placeholder="Опис цілі"
              value={newGoal.title}
              onChange={(e) =>
                setNewGoal({ ...newGoal, title: e.target.value })
              }
            />
            <div className="date-range">
              <input
                type="date"
                value={newGoal.startDate}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, startDate: e.target.value })
                }
              />
              <span className="date-separator">–</span>
              <input
                type="date"
                value={newGoal.endDate}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, endDate: e.target.value })
                }
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleCreateGoal}>Зберегти</button>
              <button
                className="danger"
                onClick={() => setShowModal(false)}
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveGoalsPage;
