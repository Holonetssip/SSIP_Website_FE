import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import Home from './pages/Home';
import Courses from './pages/Courses';
import About from './pages/About';
import Tests from './pages/Tests';
import Contact from './pages/Contact';
import CurrentAffairs from './pages/CurrentAffairs';
import ExamPage from './pages/ExamPage';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans text-slate-900 dark:text-slate-100 selection:bg-purple-200 selection:text-purple-900">
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/current-affairs" element={<CurrentAffairs />} />
          <Route path="/exams/:examName" element={<ExamPage />} />
        </Routes>
        <ChatBot />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
