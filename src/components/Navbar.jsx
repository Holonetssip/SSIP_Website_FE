import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, Sun, Moon,
  ChevronDown, BookOpen, Target, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ theme, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isExamHovered, setIsExamHovered] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sentence = "STUDY SMART IAS PCS";
  const letter = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  const examStreams = [
    { id: 'UPSC', link: '/exams/upsc', icon: <BookOpen size={18} />, desc: "Union Public Service Commission" },
    { id: 'UPPCS', link: '/exams/uppcs', icon: <Target size={18} />, desc: "Uttar Pradesh Provincial Civil Services" },
    { id: 'CSAT', link: '/exams/csat', icon: <Award size={18} />, desc: "Civil Services Aptitude Test" },
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
        className={`fixed z-50 transition-all duration-300 ease-in-out ${
          scrolled ? 'top-4 left-0 right-0 mx-4 md:mx-auto max-w-7xl rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-xl border border-white/40 dark:border-slate-700' 
                   : 'top-0 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-white/20 dark:border-slate-800'
        }`}
      >
        <div className={`mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`}>
          <div className="flex justify-between items-center">
            
            <div className="lg:hidden order-1 flex items-center">
              <button onClick={() => setIsOpen(!isOpen)} className="text-slate-700 dark:text-slate-200 p-2">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 order-2 lg:order-1 group min-w-0">
              <img src="/logo.png" alt="Study Smart Logo" className="h-8 md:h-10 w-auto object-contain group-hover:scale-105 transition-transform" />
              <motion.h1
                className="font-bold text-sm md:text-xl tracking-wide text-slate-800 dark:text-white whitespace-nowrap overflow-hidden hidden sm:block"
                initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
              >
                {sentence.split("").map((char, index) => (
                  <motion.span key={index} variants={letter} className="inline-block">{char === " " ? "\u00A0" : char}</motion.span>
                ))}
              </motion.h1>
            </Link>

            {/* Desktop Links (Home, Courses, Exams, About Us) */}
            <div className="hidden lg:flex order-2 flex-1 justify-center items-center space-x-2 font-medium text-slate-600 dark:text-slate-300">
              <Link to="/" className={`px-4 py-2 rounded-xl hover:text-primary dark:hover:text-white transition ${location.pathname === '/' ? 'text-primary font-bold' : ''}`}>Home</Link>
              <Link to="/courses" className={`px-4 py-2 rounded-xl hover:text-primary dark:hover:text-white transition ${location.pathname === '/courses' ? 'text-primary font-bold' : ''}`}>Courses</Link>
              
              {/* Exams Mega Menu */}
              <div className="relative group px-2 py-2" onMouseEnter={() => setIsExamHovered(true)} onMouseLeave={() => setIsExamHovered(false)}>
                <button className="flex items-center gap-1.5 px-2 py-2 rounded-xl hover:text-primary dark:hover:text-white transition font-medium focus:outline-none">
                  Exams <ChevronDown size={14} className={`transition-transform duration-300 ${isExamHovered ? 'rotate-180 text-primary' : ''}`} />
                </button>
                <AnimatePresence>
                  {isExamHovered && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden p-2"
                    >
                      <div className="flex flex-col gap-1">
                        {examStreams.map((exam) => (
                          <Link key={exam.id} to={exam.link} onClick={() => setIsExamHovered(false)} className="flex items-start gap-4 p-3 rounded-xl hover:bg-primary/10 dark:hover:bg-slate-800 transition text-left group">
                            <div className="mt-0.5 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-primary group-hover:bg-primary group-hover:text-white transition-colors">{exam.icon}</div>
                            <div>
                               <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary">{exam.id}</h4>
                               <p className="text-xs text-slate-500 line-clamp-1">{exam.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/about" className={`px-4 py-2 rounded-xl hover:text-primary dark:hover:text-white transition ${location.pathname === '/about' ? 'text-primary font-bold' : ''}`}>About Us</Link>
              <Link to="/contact" className={`px-4 py-2 rounded-xl hover:text-primary dark:hover:text-white transition ${location.pathname === '/contact' ? 'text-primary font-bold' : ''}`}>Contact</Link>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center order-3">
              <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 hover:bg-slate-200 transition">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-20 left-4 right-4 z-40 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 lg:hidden p-5 flex flex-col space-y-2 font-medium">
            <MobileLink to="/" onClick={() => setIsOpen(false)}>Home</MobileLink>
            <MobileLink to="/courses" onClick={() => setIsOpen(false)}>Courses</MobileLink>
            <div className="py-2 px-4"><p className="text-xs font-bold text-slate-400 uppercase mb-2">Exams</p>
              <div className="flex flex-col gap-2">
                 {examStreams.map(e => <Link key={e.id} to={e.link} onClick={() => setIsOpen(false)} className="text-primary font-bold bg-primary/10 p-2 rounded-lg text-sm">{e.id} Playlists</Link>)}
              </div>
            </div>
            <MobileLink to="/about" onClick={() => setIsOpen(false)}>About Us</MobileLink>
            <MobileLink to="/contact" onClick={() => setIsOpen(false)}>Contact</MobileLink>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const MobileLink = ({ to, onClick, children }) => (
  <Link to={to} onClick={onClick} className="px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition font-bold text-slate-700 dark:text-slate-200">{children}</Link>
);

export default Navbar;