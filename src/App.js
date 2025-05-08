import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './index.css'

import Home from './pages/Home';
import ProgressPage from './pages/ProgressPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';
import ActiveGoalsPage from './pages/ActiveGoalsPage.jsx';
import CompletedGoalsPage from './pages/CompletedGoalsPage';
import DeferredGoalsPage from './pages/DeferredGoalsPage';
import CalendarPage from './pages/CalendarPage';

import Header from './components/Header';
import Footer from './components/Footer';

// Модальні вікна
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <Router>
      <Header
        setShowLoginModal={setShowLoginModal}
        setShowRegisterModal={setShowRegisterModal}
      />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/goals" element={<ActiveGoalsPage />} />
          <Route path="/active" element={<ActiveGoalsPage />} />
          <Route path="/completed" element={<CompletedGoalsPage />}/>
          <Route path="/deferred" element={<DeferredGoalsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Routes>
      </main>

      <Footer />

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {showRegisterModal && <RegisterModal onClose={() => setShowRegisterModal(false)} />}
    </Router>
  );
}

export default App;
