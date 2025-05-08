import React, { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { RotateCcw, Trash } from 'lucide-react'; // Імпортовані потрібні іконки
import '../CSS/myGoals.css'; // Використовуємо спільні стилі

const CompletedGoalsPage = () => {
  const [completedGoals, setCompletedGoals] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchCompletedGoals = useCallback(async () => {
    if (!user) return;
    try {
      const goalsQuery = query(
        collection(db, 'goals'),
        where('userId', '==', user.uid),
        where('status', '==', 'completed')
      );
      const querySnapshot = await getDocs(goalsQuery);
      const goalsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setCompletedGoals(goalsData);
    } catch (error) {
      console.error('Помилка при завантаженні виконаних цілей:', error);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCompletedGoals();
    }
  }, [user, fetchCompletedGoals]);

  const handleRestore = async (goalId) => {
    try {
      const goalRef = doc(db, 'goals', goalId);
      await updateDoc(goalRef, { status: 'active' });
      setCompletedGoals(prev => prev.filter(goal => goal.id !== goalId));
      navigate('/active');
    } catch (error) {
      console.error('Помилка при відновленні цілі:', error);
    }
  };

  const handleDelete = async (goalId) => {
    try {
      setCompletedGoals(prev => prev.filter(goal => goal.id !== goalId));
      await deleteDoc(doc(db, 'goals', goalId));
    } catch (error) {
      console.error('Помилка при видаленні виконаної цілі:', error);
      fetchCompletedGoals();
    }
  };

  return (
    <div className="my-goals-page">
      <header className="navigation-menu">
        <nav>
          <ul className="nav-list">
            <li className="nav-item"><Link to="/active" className="nav-btn">Активні цілі</Link></li>
            <li className="nav-item"><Link to="/completed" className="nav-btn">Виконані</Link></li>
            <li className="nav-item"><Link to="/deferred" className="nav-btn">Відкладені цілі</Link></li>
            <li className="nav-item"><Link to="/calendar" className="nav-btn">Календар</Link></li>
          </ul>
        </nav>
      </header>

      <section className="goals-list">
        {completedGoals.length === 0 ? (
          <div className="empty-state">Ви ще не завершили жодну ціль.</div>
        ) : (
          completedGoals.map(goal => (
            <div className="goal-card fade-in" key={goal.id}>
              <h3>{goal.title}</h3>
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
          ))
        )}
      </section>
    </div>
  );
};

export default CompletedGoalsPage;
