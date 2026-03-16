import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BrainCircuit, Sparkles, Calendar, BookOpen,
  ChevronRight, Send, Trophy, Play, Target,
  History, Zap, ArrowDown, CheckCircle2, Clock, TrendingUp
} from 'lucide-react';
import { getTodayDate, fetchRecentQuizzes } from '../services/quizService'; 

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = getTodayDate();
  
  // Reference for the smooth scroll
  const quizSectionRef = useRef(null);

  const scrollToQuizzes = () => {
    quizSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch real data directly from Firebase
    fetchRecentQuizzes(30)
      .then(setQuizzes)
      .catch((err) => {
        console.error("Failed to fetch quizzes:", err);
        setQuizzes([]);
      })
      .finally(() => setLoading(false));

  }, []);

  const todayQuiz = quizzes.find(q => q.date === today);
  const pastQuizzes = quizzes.filter(q => q.date !== today);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16 bg-slate-50 dark:bg-slate-950 font-sans relative overflow-x-hidden">

      {/* --- CLEAN AMBIENT BACKGROUND --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-overlay"></div>
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[0%] left-[10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] transform-gpu" />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] transform-gpu" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">

        {/* --- CENTERED COMPACT HERO SECTION WITH FLOATING CARDS --- */}
        {/* OPTIMIZED: Changed backdrop-blur-xl to backdrop-blur-md and added transform-gpu to fix lagging */}
        <div className="flex flex-col items-center justify-center text-center mb-12 md:mb-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-[2rem] py-10 md:py-14 px-4 shadow-sm relative overflow-hidden transform-gpu">
          
          {/* LOGO WATERMARK */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 dark:opacity-[0.03] z-0">
            <img src="/logo.png" alt="watermark" className="w-64 md:w-80 lg:w-96 object-contain" />
          </div>

          {/* Inner glow for the hero box */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50%] h-[200px] bg-primary/5 dark:bg-primary/10 blur-[80px] rounded-full pointer-events-none z-0 transform-gpu"></div>

          {/* =========================================
              FLOATING ANIMATED ELEMENTS (Desktop Only) 
              ========================================= */}
          
          {/* 1. Exam Ready Card (Top Left) */}
          <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute hidden lg:flex top-12 left-10 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl shadow-xl items-center gap-3 transform-gpu -rotate-6">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 dark:text-white">Exam Ready</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Syllabus Aligned</p>
            </div>
          </motion.div>

          {/* 2. Global Rank Card (Top Right) */}
          <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute hidden lg:flex top-16 right-10 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl shadow-xl items-center gap-3 transform-gpu rotate-6">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg text-yellow-600 dark:text-yellow-500">
              <Trophy size={18} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 dark:text-white">Global Rank</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Live Leaderboard</p>
            </div>
          </motion.div>

          {/* 3. UPSC Standard Card (Bottom Left) */}
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute hidden lg:flex bottom-16 left-20 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl shadow-xl items-center gap-3 transform-gpu rotate-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
              <Target size={18} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 dark:text-white">UPSC Standard</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Detailed Explanations</p>
            </div>
          </motion.div>


          <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="relative z-20">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-bold text-[10px] md:text-xs mb-5 shadow-sm uppercase tracking-widest">
              <Sparkles size={12} className="animate-pulse" /> Precision Mock Tests
            </div>
            
            {/* Center Icon & Heading */}
            <div className="flex flex-col items-center justify-center gap-4 mb-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(124,58,237,0.3)] transform -rotate-6 transition-transform">
                 <BrainCircuit size={28} className="text-white transform rotate-6" />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight relative">
                {/* OPTIMIZED: Added py-1 and inline-block to prevent text clipping on mobile */}
                Quiz <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 inline-block py-1">Vault</span>
              </h1>
            </div>
            
            {/* Tighter Subtitle */}
            <p className="text-slate-600 dark:text-slate-400 font-medium max-w-xl mx-auto text-xs md:text-sm leading-relaxed px-4">
              Step into the arena. Sharpen your mind with daily curated mocks designed meticulously for UPSC & State PCS aspirants.
            </p>

            {/* Smaller Interactive Scroll Arrow */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              onClick={scrollToQuizzes}
              className="mt-8 flex flex-col items-center cursor-pointer group"
            >
              <p className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 group-hover:text-primary transition-colors">
                Explore Today's Tests
              </p>
              <motion.div 
                animate={{ y: [0, 8, 0] }} 
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-md text-primary group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all transform-gpu group-active:scale-95"
              >
                <ArrowDown size={20} className="md:w-5 md:h-5" />
              </motion.div>
            </motion.div>

          </motion.div>
        </div>

        {/* --- LOADING SKELETONS --- */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[1.5rem] p-5 border border-slate-200/50 dark:border-slate-800/50 animate-pulse shadow-sm">
                <div className="flex justify-between items-start mb-5">
                   <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                   <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                </div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-6"></div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- EMPTY STATE (Completely Empty Database) --- */}
        {!loading && quizzes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 text-center shadow-sm"
          >
            <Trophy size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">No Quizzes Available Yet</h2>
            <p className="text-slate-500 text-sm mb-5">We are preparing high-quality content. Join our Telegram to get notified instantly!</p>
            <a href="https://t.me/+U98qAhiBLLg3ZWRl" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95">
              <Send size={14} /> Notify Me
            </a>
          </motion.div>
        )}

        {/* --- MAIN QUIZ CONTENT --- */}
        <div ref={quizSectionRef} className="scroll-mt-24">
          {!loading && quizzes.length > 0 && (
            <motion.div variants={containerVariants} initial="hidden" animate="show">
              
              {/* DYNAMIC FEATURED CARD: Either LIVE TODAY or COMING SOON */}
              {todayQuiz ? (
                <motion.div variants={itemVariants} className="mb-10">
                  <Link to={`/quiz/attempt?date=${todayQuiz.date}`} className="block group">
                    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform-gpu group-hover:-translate-y-1 border border-emerald-400/50 dark:border-emerald-500/30">
                      
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-10 mix-blend-overlay"></div>
                      <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-md text-[9px] font-black uppercase tracking-widest mb-3 shadow-sm border border-white/30">
                            <Zap size={12} className="text-yellow-300" fill="currentColor" /> Live Today
                          </div>
                          <h2 className="text-2xl md:text-3xl font-black mb-2 leading-tight drop-shadow-sm">{todayQuiz.title}</h2>
                          
                          <div className="flex flex-wrap items-center gap-3 text-emerald-50 text-xs font-medium">
                            <span className="flex items-center gap-1.5 bg-black/10 px-2.5 py-1 rounded-md"><Calendar size={14}/> {todayQuiz.date}</span>
                            <span className="flex items-center gap-1.5 bg-black/10 px-2.5 py-1 rounded-md"><BookOpen size={14}/> {todayQuiz.totalQuestions} Questions</span>
                            <span className="flex items-center gap-1.5 bg-black/10 px-2.5 py-1 rounded-md"><BrainCircuit size={14}/> {todayQuiz.subject}</span>
                          </div>
                        </div>

                        <button className="shrink-0 w-full md:w-auto px-6 py-3 bg-white text-emerald-700 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-transform transform-gpu group-hover:scale-105 active:scale-95">
                          Attempt Quiz <Play size={16} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ) : (
                <motion.div variants={itemVariants} className="mb-10">
                  <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 dark:bg-slate-800/80 border border-slate-800 dark:border-slate-700 text-white shadow-lg">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-[0.05] mix-blend-overlay"></div>
                    <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                    <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 backdrop-blur-md rounded-md text-[9px] font-black uppercase tracking-widest mb-3 border border-slate-700 text-slate-300 shadow-sm">
                          <Clock size={12} className="text-indigo-400 animate-pulse" /> Upcoming
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black mb-2 leading-tight text-slate-100">Today's Mock is Brewing...</h2>
                        <p className="text-slate-400 text-xs md:text-sm font-medium max-w-lg">
                          Our experts are finalizing today's precision mock test. It will be unlocked soon. Join our Telegram to get notified the second it drops.
                        </p>
                      </div>

                      <a href="https://t.me/+U98qAhiBLLg3ZWRl" target="_blank" rel="noopener noreferrer" className="shrink-0 w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-colors active:scale-95">
                        Notify Me <Send size={16} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ARCHIVE GOOGLE-STYLE GLASSY GRID */}
              {pastQuizzes.length > 0 && (
                <>
                  <div className="flex items-center gap-3 mb-6 px-1 mt-4">
                    <History className="text-slate-400 dark:text-slate-500" size={20} />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Past Mocks</h3>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-800 ml-3"></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                    {pastQuizzes.map((quiz) => (
                      <motion.div key={quiz.date} variants={itemVariants}>
                        <Link
                          to={`/quiz/attempt?date=${quiz.date}`}
                          className="group flex flex-col h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/60 hover:border-primary/30 dark:hover:border-primary/40 rounded-[1.5rem] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] transition-all duration-400 transform-gpu hover:-translate-y-1 relative overflow-hidden"
                        >
                          {/* Inner Glassy Glow on Hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                          <div className="flex justify-between items-start mb-5 relative z-10">
                            {/* Google-style Icon Block */}
                            <div className="w-12 h-12 rounded-[1rem] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-blue-500/30 transition-all duration-300">
                              <BookOpen size={20} strokeWidth={2.5} />
                            </div>
                            
                            {/* Google-style Pill Badge */}
                            <span className="px-3 py-1 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-200/60 dark:border-slate-700/60 shadow-sm backdrop-blur-sm">
                              {quiz.subject || 'General'}
                            </span>
                          </div>

                          <div className="flex-1 relative z-10">
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {quiz.title}
                            </h3>
                          </div>

                          {/* Google-style Footer Divider & Action */}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60 relative z-10">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                               <Calendar size={14} className="text-slate-400" /> {quiz.date}
                            </div>
                            
                            {/* Sleek Text CTA */}
                            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-bold opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                              Practice <ChevronRight size={14} />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* --- BOTTOM CTAs --- */}
        {!loading && quizzes.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-16 text-center pb-8 flex flex-wrap justify-center gap-3">
            {/* Telegram */}
            <a href="https://t.me/+U98qAhiBLLg3ZWRl" target="_blank" rel="noopener noreferrer" className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs md:text-sm shadow-md overflow-hidden transition-transform transform-gpu active:scale-95">
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-slate-900/10 to-transparent skew-x-12 z-0" />
                <Send size={16} className="text-blue-400 dark:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 relative z-10" />
                <span className="relative z-10">Join Telegram for Updates</span>
              </div>
            </a>

            {/* Overall Leaderboard */}
            <Link to="/quiz/leaderboard" className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-xs md:text-sm shadow-md overflow-hidden transition-transform transform-gpu active:scale-95">
                <TrendingUp size={16} className="relative z-10" />
                <span className="relative z-10">Check Overall Ranking</span>
              </div>
            </Link>
          </motion.div>
        )}

      </div>
    </div>
  );
}