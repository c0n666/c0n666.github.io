import React, { useEffect, useState, useCallback } from 'react';
import { PlusCircle, Check, Trash } from 'lucide-react'; // Додано Trash
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import '../CSS/myGoals.css';

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
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const goalsQuery = query(
        collection(db, 'goals'),
        where('userId', '==', user.uid),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(goalsQuery);
      const userGoals = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setGoals(userGoals);
    } catch (error) {
      setErrorMessage('Помилка при завантаженні цілей');
      console.error('Помилка при завантаженні цілей:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchGoals();
    } else {
      setGoals([]);
    }
  }, [user, fetchGoals]);

  const handleDelete = async (goalId) => {
    setLoading(true);
    try {
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
      await deleteDoc(doc(db, 'goals', goalId));
    } catch (error) {
      setErrorMessage('Помилка при видаленні цілі');
      console.error('Помилка при видаленні цілі:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (goalId, status) => {
    setLoading(true);
    try {
      const goalRef = doc(db, 'goals', goalId);
      await updateDoc(goalRef, { status });
      setGoals((prev) =>
        prev.filter((goal) => goal.id !== goalId)
      );
      navigate('/completed');
    } catch (error) {
      setErrorMessage('Помилка при оновленні статусу');
      console.error('Помилка при оновленні статусу:', error);
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

    try {
      const tempId = 'temp-' + Date.now();
      const newGoalData = {
        ...newGoal,
        userId: user.uid,
        status: 'active'
      };

      setGoals((prev) => [...prev, { id: tempId, ...newGoalData }]);
      const docRef = await addDoc(collection(db, 'goals'), newGoalData);

      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === tempId ? { ...goal, id: docRef.id } : goal
        )
      );

      setShowModal(false);
      setNewGoal({ title: '', startDate: '', endDate: '' });
    } catch (error) {
      setErrorMessage('Помилка при створенні цілі');
      console.error('Помилка при створенні цілі:', error);
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
