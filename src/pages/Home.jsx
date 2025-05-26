import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../CSS/home.css';
import GoalImage from '../Images/togoal.png';
import { motion } from 'framer-motion';
import { BarChart, LineChart, RefreshCw, Compass, Settings, Clock } from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import LoginModal from '../components/LoginModal';

const features = [
  {
    title: 'Інтуїтивна ієрархія',
    description:
      'Система чітко розділяє завдання за типами: разові для щоденних справ, регулярні — для формування звичок, без дати — для збереження ідей. Цілі ж допоможуть організувати довгострокові плани та досягти результату.',
    icon: <BarChart size={24} color="#D5F0D9" />,
  },
  {
    title: 'Статистика та прогрес',
    description:
      'Ви завжди бачите свою активність: щотижневий звіт, прогрес по цілях, частоту виконання завдань. Це дає мотивацію та дозволяє вчасно скоригувати стратегію досягнення цілей.',
    icon: <LineChart size={24} color="#D5F0D9" />,
  },
  {
    title: 'Синхронізація',
    description:
      'Ваші дані автоматично синхронізуються між усіма пристроями. Ви зможете працювати з планами на телефоні, планшеті чи комп’ютері без втрати актуальності й з максимальним комфортом.',
    icon: <RefreshCw size={24} color="#D5F0D9" />,
  },
  {
    title: 'Зручний інтерфейс',
    description:
      'Продуманий інтерфейс дозволяє швидко перемикатися між днями, тижнями та місяцями. Усе логічно структуровано, щоб користувач не витрачав час на пошук потрібного елементу.',
    icon: <Compass size={24} color="#D5F0D9" />,
  },
  {
    title: 'Легке управління',
    description:
      'Жодного перевантаження — лише те, що справді потрібно. Створюйте, редагуйте й виконуйте завдання в кілька кліків, не відволікаючись на зайві деталі й складні налаштування.',
    icon: <Settings size={24} color="#D5F0D9" />,
  },
  {
    title: 'Баланс дня',
    description:
      'Система допомагає знайти баланс між роботою та відпочинком. Візуальні підказки й індикатори завантаженості підкажуть, коли краще зробити паузу чи переглянути ритм дня.',
    icon: <Clock size={24} color="#D5F0D9" />,
  },
];

const Home = () => {
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  // Обробник кліку для CTA кнопки «Спробувати зараз»
  const handleCTAClick = (e) => {
    if (!user) {
      e.preventDefault();
      setShowLoginModal(true);
    }
  };

  return (
    <section id="home">
      <div className="home-container">
        <h1>Таск-менеджер для особистих завдань і цілей</h1>
        <h2>Маєш сміливі плани? Плануй з GoalMaster</h2>

        <div className="footer">
          <div className="footer-text">
            <span>100% безкоштовно</span>
            <span>розроблено в Україні</span>
            <span>без реклами</span>
          </div>
        </div>
      </div>

      <div className="home-image">
        <img src={GoalImage} alt="Планування цілей" />
      </div>

      <section className="features-section">
        <h2 className="features-title">Ефективність у простоті</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              className="feature-card"
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="feature-header">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
              </div>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
      <Link to="/goals" className="cta-button" onClick={handleCTAClick}>
        Спробувати зараз
      </Link>

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </section>
  );
};

export default Home;
