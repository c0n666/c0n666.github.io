import React, { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebase";
import axios from "axios";
import "../CSS/progress.css";

const getProgressColor = (percentage) => {
  if (percentage < 30) return "#ff5959";
  if (percentage < 70) return "#f6c026";
  return "#4CAF50";
};

const Progress = () => {
  const [completedGoals, setCompletedGoals] = useState(0);
  const [totalGoals, setTotalGoals] = useState(0);
  const [user, setUser] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredCompletedGoals, setFilteredCompletedGoals] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchGoals = async () => {
      try {
        const goalsRef = collection(db, "goals");
        const q = query(goalsRef, where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const allGoals = snapshot.docs.map((doc) => doc.data());

        const filteredGoals = allGoals.filter(
          (goal) => goal.status === "active" || goal.status === "completed"
        );
        const completed = filteredGoals.filter(
          (goal) => goal.status === "completed"
        ).length;

        setCompletedGoals(completed);
        setTotalGoals(filteredGoals.length);
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    };

    fetchGoals();
  }, [user]);

  const percentage =
    totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const motivation =
    percentage === 100
      ? "🎉 Всі цілі досягнуті! Відмінна робота!"
      : "Чудова робота! Продовжуйте рухатися вперед.";

const fetchCompletedGoalsByDate = async () => {
  if (!user || !fromDate || !toDate) return;

  try {
    const token = await user.getIdToken();  // отримуємо актуальний токен

    const response = await axios.get("http://localhost:5000/api/completed-goals", {
      params: {
        userId: user.uid,
        from: fromDate,
        to: toDate
      },
      headers: {
        Authorization: `Bearer ${token}`  // передаємо токен у заголовках
      }
    });
    setFilteredCompletedGoals(response.data);
  } catch (error) {
    console.error("Помилка при отриманні фільтрованих цілей:", error);
  }
};


  return (
    <section className="progress-page">
      <h2 className="progress-title">Ваш прогрес</h2>

      <div className="progress-chart-container">
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          styles={buildStyles({
            textColor: "#1d1d1d",
            pathColor: getProgressColor(percentage),
            trailColor: "#dcdcdc",
            strokeLinecap: "round",
            pathTransitionDuration: 0.5,
          })}
        />
      </div>

      <p className="progress-motivation">{motivation}</p>

      <div className="date-filter">
  <h3>Фільтрувати завершені цілі:</h3>
  <div className="filters-row">
    <label>Від: </label>
    <input
      type="date"
      value={fromDate}
      onChange={(e) => setFromDate(e.target.value)}
    />
    <label>До: </label>
    <input
      type="date"
      value={toDate}
      onChange={(e) => setToDate(e.target.value)}
    />
    <button onClick={fetchCompletedGoalsByDate}>Застосувати фільтр</button>
  </div>
</div>


      {filteredCompletedGoals.length > 0 && (
        <div className="completed-list">
          <h3>Завершені цілі:</h3>
          <ul>
            {filteredCompletedGoals.map((goal) => (
              <li key={goal.id}>
                {goal.title} —{" "}
                {goal.completedAt
                  ? new Date(goal.completedAt).toLocaleDateString()
                  : "Без дати"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default Progress;
