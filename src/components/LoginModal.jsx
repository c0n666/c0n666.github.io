import React, { useState } from 'react';
import '../CSS/modal.css';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '../firebase';
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff } from 'lucide-react';

const LoginModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const provider = new GoogleAuthProvider();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Вхід успішний');
      onClose();
    } catch (err) {
      setError('Невірний логін або пароль');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      console.log('Успішний вхід через Google');
      onClose();
    } catch (err) {
      console.error(err);
      setError('Помилка входу через Google');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault(); // Запобігаємо перезавантаженню сторінки
    if (!email) {
      setError('Будь ласка, введіть вашу електронну пошту для відновлення паролю.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setError('Лист для відновлення паролю надіслано. Перевірте вашу пошту!');
    } catch (err) {
      console.error(err);
      setError('Помилка при скиданні паролю. Спробуйте ще раз.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-window" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Вхід</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />
          </label>

          <label>
            Пароль
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Введіть пароль"
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

          {error && <p className="error">{error}</p>}

          {/* Блок для скидання паролю розташовано перед кнопкою "Увійти" */}
          <div className="password-reset">
            <small>
            <button type="button" className="reset-password-link" onClick={handleResetPassword}>
               Забули пароль?
            </button>
            </small>
            </div>
          <button type="submit" className="modal-submit">Увійти</button>
        </form>

        <hr />

        <div className="google-auth-wrapper">
          <div className="tooltip">
            <button className="google-icon-btn" onClick={handleGoogleLogin}>
              <FcGoogle size={24} />
            </button>
            <span className="tooltip-text">Вхід через Google</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginModal;
