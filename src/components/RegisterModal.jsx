import React, { useState } from 'react';
import '../CSS/modal.css';
import { Info, Eye, EyeOff } from 'lucide-react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { FcGoogle } from 'react-icons/fc';

const RegisterModal = ({ onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { label: 'Слабкий', color: 'red', value: 33 };
    if (score === 3 || score === 4) return { label: 'Середній', color: 'orange', value: 66 };
    return { label: 'Надійний', color: 'green', value: 100 };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Невірний формат email');
      return;
    }

    if (strength.value < 66) {
      setError('Пароль занадто слабкий');
      return;
    }

    if (password !== confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('Реєстрація успішна');
      setError('');
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleRegister = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log('Google реєстрація успішна');
      onClose();
    } catch (err) {
      setError('Помилка при вході через Google');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-window" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Реєстрація</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Ім’я
            <input
              type="text"
              placeholder="Введіть ім’я"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Пароль
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Введіть пароль"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {password && (
            <div className="password-strength-wrapper">
              <div className="password-strength-container">
                <div
                  className="password-strength-bar"
                  style={{ width: `${strength.value}%`, backgroundColor: strength.color }}
                ></div>
              </div>
              <div className="password-strength-info">
                <span className="password-strength-label">{strength.label}</span>
                <div className="tooltip">
                  <Info size={16} />
                  <span className="tooltip-text">
                    Надійний пароль має щонайменше 8 символів, велику літеру, цифру та спеціальний символ.
                  </span>
                </div>
              </div>
            </div>
          )}

          <label>
            Повтор паролю
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Повторіть пароль"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="modal-submit">Зареєструватися</button>
        </form>
        <hr />
        <div className="google-auth-wrapper">
          <div className="tooltip">
            <button className="google-icon-btn" onClick={handleGoogleRegister}>
              <FcGoogle size={24} />
            </button>
            <span className="tooltip-text">Реєстрація через Google</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
