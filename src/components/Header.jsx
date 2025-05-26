import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Використовуємо useNavigate замість useHistory
import '../CSS/header.css';
import logo from '../Images/GoalMaster.png';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { UserCircle, LogOut } from 'lucide-react';  // Додали LogOut

const Header = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [user, setUser] = useState(null);

  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');  // Перенаправлення на головну після виходу
    } catch (error) {
      console.error('Помилка при виході з системи:', error);
    }
  };

  // Обробник для "Мої цілі": якщо користувач не авторизований, показуємо модальне вікно авторизації
  const handleGoalsClick = (e) => {
    if (!user) {
      e.preventDefault();
      setShowLoginModal(true);
    }
  };

  // Новий обробник для "Прогрес": аналогічна логіка, як для "Мої цілі"
  const handleProgressClick = (e) => {
    if (!user) {
      e.preventDefault();
      setShowLoginModal(true);
    }
  };

  return (
    <header className="styled-header">
      <div className="header-container">
        <div className="logo-nav-wrapper">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo" />
          </div>

          <nav className={`nav-menu ${menuVisible ? 'visible' : ''}`}>
            <ul>
              <li>
                <Link to="/" className="menu-link">Головна</Link>
              </li>
              <li>
                <Link to="/goals" className="menu-link" onClick={handleGoalsClick}>
                  Мої цілі
                </Link>
              </li>
              <li>
                <Link to="/progress" className="menu-link" onClick={handleProgressClick}>
                  Прогрес
                </Link>
              </li>
              <li>
                <Link to="/community" className="menu-link">Спільнота</Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="actions">
          {user ? (
            <div className="profile-section">
              <Link to="/profile" className="profile-icon" title="Особистий кабінет">
                <UserCircle size={30} />
              </Link>
              <button 
                onClick={handleLogout} 
                className="logout-icon-button"
                title="Вийти"
              >
                <LogOut size={25} />
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => setShowLoginModal(true)} className="auth-button">Вхід</button>
              <button onClick={() => setShowRegisterModal(true)} className="auth-button register-btn">Реєстрація</button>
            </>
          )}

          <button id="toggle-menu" className="burger-button" onClick={toggleMenu}>☰</button>
        </div>
      </div>

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {showRegisterModal && <RegisterModal onClose={() => setShowRegisterModal(false)} />}
    </header>
  );
};

export default Header;
