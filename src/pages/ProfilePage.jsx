import React, { useEffect, useState } from "react";
import { getAuth, updateProfile, deleteUser, updatePassword, signOut } from "firebase/auth";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { User, Edit2, Settings, LogOut, Trash2, Key } from "lucide-react";
import "../CSS/profile.css";

const ProfilePage = () => {
  const auth = getAuth();
  const db = getFirestore();

  const [user, setUser] = useState(null);
  const [goalsCount, setGoalsCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const u = auth.currentUser;
    if (u) {
      setUser(u);
      setNewName(u.displayName || '');
    }
  }, [auth.currentUser]);

  // Запит для отримання кількості цілей із фільтрацією за статусом "active" або "completed"
  useEffect(() => {
    async function fetchGoalsCount() {
      if (user) {
        try {
          const goalsRef = collection(db, "goals");
          const q = query(goalsRef, where("userId", "==", user.uid));
          const snapshot = await getDocs(q);
          const allGoals = snapshot.docs.map(doc => doc.data());
          
          // Логування для відлагодження
          console.log("Всі документи для користувача:", allGoals);
          
          // Фільтруємо лише ті цілі, де статус - "active" або "completed"
          const filteredGoals = allGoals.filter(
            (goal) => goal.status === "active" || goal.status === "completed"
          );
          console.log("Після фільтрації:", filteredGoals);

          setGoalsCount(filteredGoals.length);
        } catch (error) {
          console.error("Помилка отримання кількості цілей:", error);
        }
      }
    }
    fetchGoalsCount();
  }, [user, db]);

  const handleProfileUpdate = async () => {
    if (!newName) return;
    await updateProfile(auth.currentUser, { displayName: newName });
    setUser({ ...auth.currentUser, displayName: newName });
    setShowEditModal(false);
  };

  const handlePasswordChange = async () => {
    if (!newPassword) return;
    await updatePassword(auth.currentUser, newPassword);
    alert('Пароль успішно змінено!');
    setShowPasswordModal(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  const handleDeleteAccount = async () => {
    await deleteUser(auth.currentUser);
    window.location.href = "/";
  };

  return (
    <div className="profile-page">
      {/* Блок: Особистий кабінет */}
      <div className="card">
        <div className="card-header">
          <h2>Особистий кабінет</h2>
        </div>
        <div className="card-body">
          <div className="name-block">
            <User size={24} />
            <span className="name">{user?.displayName || "Невідомо"}</span>
            <button className="icon-btn" onClick={() => setShowEditModal(true)}>
              <Edit2 size={16} />
            </button>
          </div>
          <p>
            <strong>Акаунт:</strong> {user?.email}
          </p>
          <p>
            <strong>Кількість цілей:</strong> {goalsCount}
          </p>
        </div>
      </div>

      {/* Блок: Налаштування */}
      <div className="card settings-card">
        <div className="card-header">
          <div className="settings-title">
            <Settings size={20} />
            <h2>Налаштування</h2>
          </div>
        </div>
        <ul className="settings-list">
          <li onClick={() => setShowPasswordModal(true)}>
            <Key size={18} />
            <span>Змінити пароль</span>
          </li>
          <li onClick={handleLogout}>
            <LogOut size={18} />
            <span>Вийти</span>
          </li>
          <li onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={18} />
            <span>Видалити акаунт</span>
          </li>
        </ul>
      </div>

      {/* Модальне вікно редагування імені */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Редагувати ім’я</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Нове ім’я"
            />
            <div className="modal-actions">
              <button onClick={handleProfileUpdate}>Зберегти</button>
              <button onClick={() => setShowEditModal(false)}>Скасувати</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальне вікно зміни паролю */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Змінити пароль</h3>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Новий пароль"
            />
            <div className="modal-actions">
              <button onClick={handlePasswordChange}>Зберегти</button>
              <button onClick={() => setShowPasswordModal(false)}>Скасувати</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальне підтвердження видалення */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Видалити акаунт?</h3>
            <p>Цю дію не можна відмінити.</p>
            <div className="modal-actions">
              <button onClick={handleDeleteAccount}>Так, видалити</button>
              <button onClick={() => setShowDeleteConfirm(false)}>Скасувати</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
