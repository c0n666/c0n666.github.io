import React, { useEffect, useState, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../CSS/calendar.css";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Link } from "react-router-dom";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);


const CustomEvent = ({ event }) => {
  return (
    <div>
      <div style={{ fontWeight: "bold" }}>{event.title}</div>
    </div>
  );
};

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("active");
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    try {
      const goalsQuery = query(
        collection(db, "goals"),
        where("userId", "==", user.uid),
        where("status", "==", filter)
      );
      const querySnapshot = await getDocs(goalsQuery);
      const goalsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const eventsData = goalsData.map((goal) => ({
        id: goal.id,
        title: goal.title,
        start: new Date(goal.startDate),
        end: new Date(goal.endDate),
        status: goal.status,
      }));

      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  }, [user, filter]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user, fetchGoals]);

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

      <section className="calendar-content">

        <div className="filter-container">
          <select
            id="statusFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="active">Активні</option>
            <option value="completed">Виконані</option>
          </select>
        </div>

        <DnDCalendar
  localizer={localizer}
  events={events}
  startAccessor="start"
  endAccessor="end"
  date={currentDate}
  onNavigate={(newDate) => setCurrentDate(newDate)}
  style={{ height: 600, margin: "50px auto", width: "100%" }}
  view="month"
  views={["month"]}
  components={{ event: CustomEvent }}
/>

      </section>
    </div>
  );
};

export default CalendarPage;
