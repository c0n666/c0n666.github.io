import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { FaStar, FaPaperPlane, FaTrash } from "react-icons/fa"; // додано FaTrash

import "../CSS/community.css";

// Компонент для вибору рейтингу
const StarRating = ({ rating, setRating }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          size={20}
          color={(hover || rating) >= star ? "#FFB300" : "#ccc"}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => setRating(star)}
          style={{ cursor: "pointer", marginRight: "5px" }}
        />
      ))}
    </div>
  );
};

const CommunityPage = () => {
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [user, setUser] = useState(null);

  // Підтягуємо поточного користувача з Firebase Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Завантаження відгуків з Firestore
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsQuery = query(
          collection(db, "reviews"),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(reviewsQuery);
        const reviewsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(reviewsData);
      } catch (error) {
        console.error("Помилка завантаження відгуків:", error);
      }
    };
    fetchReviews();
  }, []);

  // Додавання нового відгуку
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !message) return;
    try {
      await addDoc(collection(db, "reviews"), {
        name: user.displayName || "Анонімний користувач",
        userId: user.uid,
        message,
        rating,
        timestamp: new Date(),
      });
      setMessage("");
      setRating(5);
      alert("Ваш відгук додано!");
    } catch (error) {
      console.error("Помилка додавання відгуку:", error);
    }
  };

  // Видалення відгуку
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "reviews", id));
      setReviews((prevReviews) =>
        prevReviews.filter((review) => review.id !== id)
      );
    } catch (error) {
      console.error("Помилка видалення відгуку:", error);
    }
  };

  return (
    <div className="community-page">
      <h1 className="community-header">Залиште свій відгук про сайт</h1>

      {user ? (
        <form className="review-form" onSubmit={handleSubmit}>
          <textarea
            placeholder="Ваш відгук..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
          <div className="rating-send-row">
            <StarRating rating={rating} setRating={setRating} />
            <button type="submit" className="send-btn">
              <FaPaperPlane size={20} color="#fff" />
            </button>
          </div>
        </form>
      ) : (
        <p>Увійдіть у систему, щоб залишити відгук.</p>
      )}

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p>Ще немає відгуків. Будьте першим!</p>
        ) : (
          reviews.map((review) => (
            <div className="review-card" key={review.id}>
              <h3>{review.name}</h3>
              <p>{review.message}</p>
              <div className="review-rating">
                {[...Array(review.rating)].map((_, i) => (
                  <FaStar key={i} color="#FFB300" size={16} />
                ))}
                <span className="rating-text"> ({review.rating} ⭐)</span>
              </div>
              {user && user.uid === review.userId && (
  <button
    id="delete-btn"
    onClick={() => handleDelete(review.id)}
    title="Видалити відгук"
  >
    <FaTrash size={16} />
  </button>
)}

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
