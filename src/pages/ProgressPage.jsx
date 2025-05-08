import React, { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebase";
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

        // Фільтруємо лише активні та виконані цілі
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

  // Замість надання інформації про кількість цілей – мотиваційне повідомлення
  const motivation =
    percentage === 100
      ? "🎉 Всі цілі досягнуті! Відмінна робота!"
      : "Чудова робота! Продовжуйте рухатися вперед.";

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
    </section>
  );
};

export default Progress;
