import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Bookmark, Flag,
  CheckCircle2, XCircle, RotateCcw, Trophy, BrainCircuit,
  User, Mail, Phone, Play, Clock, Medal, Crown,
  ArrowLeft, ListChecks, Sparkles, LayoutGrid, X, AlertCircle, 
  Loader2, CalendarX, TrendingUp, Zap, Target, Star
} from 'lucide-react';

// Firebase Services
import {
  fetchQuiz, getTodayDate,
  saveAttempt, fetchLeaderboard, fetchUserDailyRank,
  fetchCumulativeLeaderboard, fetchUserCumulativeRank,
  upsertUser, fetchUserAttempt,
} from '../services/quizService';

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function QuizAttempt() {
  const [searchParams] = useSearchParams();
  const date = searchParams.get('date') || getTodayDate();

  // App State: 'register' | 'countdown' | 'quiz' | 'result' | 'review' | 'leaderboard'
  const [appState, setAppState] = useState('register');
  const [userData, setUserData] = useState({ name: '', email: '', phone: '' });
  
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [scoreData, setScoreData] = useState({ total: 0, correct: 0, incorrect: 0, unattempted: 0, timeTaken: 0 });
  const [dbLeaderboard, setDbLeaderboard] = useState([]);
  const [cumulativeLeaderboard, setCumulativeLeaderboard] = useState([]);
  const [leaderboardTab, setLeaderboardTab] = useState('daily');
  const [userDailyRank, setUserDailyRank] = useState(null);   // { rank, total }
  const [userCumRank, setUserCumRank] = useState(null);       // { rank, total }
  const [myTotalScore, setMyTotalScore] = useState(0);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);

  const [overallTime, setOverallTime] = useState(0);
  const [countdownNum, setCountdownNum] = useState(3);
  const startTimeRef = useRef(null);

  // 1. Initial Load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchQuiz(date)
      .then((data) => {
        if (!data) setError('no_quiz');
        else setQuizData(data);
      })
      .catch(() => setError('fetch_failed'))
      .finally(() => setLoading(false));
  }, [date]);

  // 2. Countdown Logic
  useEffect(() => {
    let cdTimer;
    if (appState === 'countdown') {
      cdTimer = setInterval(() => {
        setCountdownNum((prev) => {
          if (prev <= 1) {
            clearInterval(cdTimer);
            setAppState('quiz');
            startTimeRef.current = Date.now();
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(cdTimer);
  }, [appState]);

  // 3. Initialize overall timer when quiz starts
  useEffect(() => {
    if (appState === 'quiz' && quizData && overallTime === 0) {
      setOverallTime(quizData.questions.length * 120); // 2 min per question
    }
  }, [appState, quizData]);

  // 4. Overall countdown timer
  useEffect(() => {
    if (appState !== 'quiz') return;
    const timer = setInterval(() => {
      setOverallTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [appState]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(userData.phone)) return alert("Please enter a valid 10-digit mobile number.");
    const normalizedName = userData.name.trim().replace(/\b\w/g, c => c.toUpperCase());
    setUserData(prev => ({ ...prev, name: normalizedName }));

    // Block re-attempt for same date
    try {
      const existing = await fetchUserAttempt(userData.phone, date);
      if (existing) {
        alert(`You have already attempted this quiz on ${date}. Each quiz can only be attempted once.`);
        return;
      }
    } catch (err) {
      console.error('Failed to check existing attempt:', err);
    }

    try {
      await upsertUser(userData.phone, normalizedName, userData.email);
    } catch (err) {
      console.error('Failed to save user profile:', err);
    }
    setAppState('countdown');
  };

  const handleSelectOption = (optIndex) => {
    setSelectedAnswers(prev => ({ ...prev, [currentIdx]: optIndex }));
  };

  const handleToggleReview = () => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentIdx)) newSet.delete(currentIdx);
      else newSet.add(currentIdx);
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (!quizData) return;
    const timeTaken = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
    let correct = 0, incorrect = 0, unattempted = 0;

    quizData.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === undefined) unattempted++;
      else if (selectedAnswers[idx] === q.correct) correct++;
      else incorrect++;
    });

    const finalScore = parseFloat(((correct * 2) - (incorrect * 0.66)).toFixed(2));
    setScoreData({ total: finalScore, correct, incorrect, unattempted, timeTaken });
    setAppState('result');
    setSaving(true);

    const userId = userData.phone;

    // Step 1: Save attempt — critical, must succeed
    let savedTotalScore = finalScore;
    try {
      const result = await saveAttempt(userId, date,
        { score: finalScore, correct, incorrect, skipped: unattempted, timeTaken },
        { displayName: userData.name, email: userData.email, phone: userData.phone }
      );
      savedTotalScore = result.totalScore;
      setMyTotalScore(savedTotalScore);
    } catch (err) {
      console.error('saveAttempt failed:', err);
    } finally {
      setSaving(false);
    }

    // Step 2: Show your rank immediately from local data (always works)
    setUserDailyRank({ rank: '...', total: '...' });
    setUserCumRank({ rank: '...', total: '...' });

    // Step 3: Fetch leaderboard + real ranks independently (may fail if index not ready)
    try {
      const [lb, dailyRank] = await Promise.all([
        fetchLeaderboard(date),
        fetchUserDailyRank(userId, date, finalScore, timeTaken),
      ]);
      setDbLeaderboard(lb);
      setUserDailyRank(dailyRank);
    } catch (err) {
      console.error('Daily leaderboard fetch failed (check Firestore index):', err);
    }

    try {
      const [clb, cumRank] = await Promise.all([
        fetchCumulativeLeaderboard(),
        fetchUserCumulativeRank(userId, savedTotalScore),
      ]);
      setCumulativeLeaderboard(clb);
      setUserCumRank(cumRank);
    } catch (err) {
      console.error('Cumulative leaderboard fetch failed:', err);
    }
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setMarkedForReview(new Set());
    setCurrentIdx(0);
    setOverallTime(0);
    setAppState('countdown');
  };

  // ── Sub-Components ─────────────────────────────────────────────────────────

  const QuestionPalette = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <ListChecks size={14} /> Question Navigator
        </h3>
        <button className="lg:hidden" onClick={() => setIsMobilePaletteOpen(false)}><X size={18} /></button>
      </div>
      <div className="grid grid-cols-5 gap-1.5 mb-6">
        {quizData.questions.map((_, i) => {
          const isAnswered = selectedAnswers[i] !== undefined;
          const isMarked = markedForReview.has(i);
          const isCurrent = currentIdx === i;
          
          let bgClass = "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700";
          if (isMarked && isAnswered) bgClass = "bg-indigo-500 text-white border-indigo-600";
          else if (isMarked) bgClass = "bg-amber-400 text-white border-amber-500";
          else if (isAnswered) bgClass = "bg-emerald-500 text-white border-emerald-600";
          
          if (isCurrent) bgClass += " ring-2 ring-primary ring-offset-1 dark:ring-offset-slate-900 border-primary font-black";
          
          return (
            <button key={i} onClick={() => { setCurrentIdx(i); setIsMobilePaletteOpen(false); }}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[10px] transition-all transform-gpu active:scale-90 ${bgClass}`}>
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-[9px] font-bold uppercase text-slate-400">
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-emerald-500" /> Attempted</div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-amber-400" /> Marked</div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-indigo-500" /> Marked & Ans.</div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-white dark:bg-slate-800 border" /> Unvisited</div>
      </div>
    </div>
  );

  // ── Render Views ───────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  // 1. REGISTRATION
  if (appState === 'register') {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50 dark:bg-slate-950 flex justify-center items-center px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-7 rounded-[2rem] shadow-2xl border border-white dark:border-slate-800 relative z-10">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-lg transform -rotate-3">
            <BrainCircuit size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-black text-center text-slate-900 dark:text-white mb-1">Aspirant Login</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-xs font-medium">Verify your profile to begin the OMR assessment.</p>
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="relative"><User size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400" /><input type="text" required placeholder="Display Name" value={userData.name} onChange={(e)=>setUserData({...userData, name: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs dark:text-white" /></div>
            <div className="relative"><Mail size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400" /><input type="email" required placeholder="Gmail ID" value={userData.email} onChange={(e)=>setUserData({...userData, email: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs dark:text-white" /></div>
            <div className="relative"><Phone size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400" /><input type="tel" required placeholder="Mobile Number" value={userData.phone} onChange={(e)=>setUserData({...userData, phone: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs dark:text-white" /></div>
            <button type="submit" className="w-full py-3.5 mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-xs shadow-lg active:scale-95 transition-all">Launch Exam <Play size={14} fill="currentColor" className="inline ml-1"/></button>
          </form>
        </motion.div>
      </div>
    );
  }

  // 2. COUNTDOWN
  if (appState === 'countdown') return (
    <div className="fixed inset-0 z-[600] bg-slate-950 flex flex-col justify-center items-center">
      <AnimatePresence mode="wait"><motion.div key={countdownNum} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }} className="text-[10rem] font-black text-white">{countdownNum}</motion.div></AnimatePresence>
      <p className="text-white/20 font-bold uppercase tracking-widest text-[10px]">Secure environment loading</p>
    </div>
  );

  // 3. IMMERSIVE QUIZ
  if (appState === 'quiz') {
    const question = quizData.questions[currentIdx];

    return (
      <div className="fixed inset-0 z-[700] bg-slate-50 dark:bg-slate-950 flex flex-col h-full overflow-hidden">
        <style>{`#chat-widget-container, .zsiq_float, .chat-widget { display: none !important; }`}</style>
        
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 z-[710] shadow-sm shrink-0">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white"><BrainCircuit size={18}/></div>
             <div className="leading-tight">
               <h1 className="font-bold text-[11px] md:text-[13px] dark:text-white truncate max-w-[150px] md:max-w-none">{quizData.title}</h1>
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{quizData.subject || "UPSC General Studies"}</p>
             </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            <Clock size={14} className={overallTime <= 60 ? 'text-red-500 animate-pulse' : 'text-primary'} />
            <span className={`font-black text-xs ${overallTime <= 60 ? 'text-red-500' : 'dark:text-white'}`}>{formatTime(overallTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMobilePaletteOpen(true)} className="lg:hidden p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"><LayoutGrid size={18} /></button>
            <button onClick={handleSubmit} className="hidden lg:block px-4 py-2 bg-rose-500 text-white rounded-lg font-bold text-[10px] active:scale-95 transition-transform uppercase tracking-wider">Submit Test</button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-white/30 dark:bg-slate-950/20">
            <div className="w-full max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded text-indigo-600 border border-indigo-100 dark:border-indigo-900/50">{question.category || "Section I"}</span>
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">Q {currentIdx + 1} / {quizData.questions.length}</span>
              </div>
              
              <motion.div key={currentIdx} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-[1.5rem] shadow-sm mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                <h2 className="text-sm md:text-base font-bold text-slate-800 dark:text-white leading-relaxed mb-8">
                  <span className="text-primary font-black mr-2">Q.</span>{question.question}
                </h2>
                
                <div className="grid gap-2.5">
                  {question.options.map((opt, i) => {
                    const isSelected = selectedAnswers[currentIdx] === i;
                    return (
                      <button key={i} onClick={() => handleSelectOption(i)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${isSelected ? 'border-primary bg-primary/5 dark:text-white ring-1 ring-primary/20' : 'border-slate-100 dark:border-slate-800 dark:text-slate-400 hover:border-slate-200 bg-slate-50/50 dark:bg-slate-900/50'}`}>
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-black ${isSelected ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30' : 'border-slate-300'}`}>{String.fromCharCode(65+i)}</div>
                        <span className="text-xs md:text-sm font-semibold">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </main>

          <aside className="hidden lg:flex w-64 flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shrink-0">
            <QuestionPalette />
            <button onClick={handleSubmit} className="mt-auto w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all border border-transparent hover:border-primary">Final Submission</button>
          </aside>
        </div>

        <footer className="h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between z-[710] shrink-0">
          <div className="flex gap-2">
            <button onClick={() => setCurrentIdx(Math.max(0, currentIdx-1))} disabled={currentIdx===0} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 disabled:opacity-30 hover:bg-slate-200"><ChevronLeft size={18}/></button>
            <button onClick={handleToggleReview} className={`px-4 py-2 rounded-xl border font-bold text-[10px] flex items-center gap-2 ${markedForReview.has(currentIdx) ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200'}`}><Flag size={14}/> {markedForReview.has(currentIdx) ? 'MARKED' : 'REVIEW'}</button>
            {selectedAnswers[currentIdx] !== undefined && (
              <button
                onClick={() => setSelectedAnswers(prev => { const n = {...prev}; delete n[currentIdx]; return n; })}
                className="px-4 py-2 rounded-xl border font-bold text-[10px] flex items-center gap-2 bg-red-50 border-red-200 text-red-500 hover:bg-red-100 transition">
                <X size={13}/> CLEAR
              </button>
            )}
          </div>
          <button onClick={() => setCurrentIdx((currentIdx + 1) % quizData.questions.length)} className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs flex items-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary/20">NEXT <ChevronRight size={16}/></button>
        </footer>

        <AnimatePresence>{isMobilePaletteOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[800] bg-white dark:bg-slate-900 p-8 flex flex-col lg:hidden">
            <QuestionPalette /><button onClick={handleSubmit} className="mt-auto w-full py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs">Complete Submission</button>
          </motion.div>
        )}</AnimatePresence>
      </div>
    );
  }

  // 4. RESULT VIEW
  if (appState === 'result') {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-slate-50 dark:bg-slate-950 flex flex-col items-center px-4 relative">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-[2.5rem] p-8 md:p-10 w-full max-w-xl text-center relative overflow-hidden">
          <Trophy size={48} className="mx-auto text-yellow-500 mb-4" />
          <h2 className="text-xl font-black dark:text-white mb-1">Results Declared</h2>
          <p className="text-slate-500 text-[9px] uppercase font-bold tracking-[0.2em] mb-8">{userData.name}</p>

          <div className="flex justify-center mb-8">
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[2rem] w-40 border border-slate-200 dark:border-slate-700 shadow-inner group">
               <span className="text-[9px] uppercase font-black text-slate-400 block tracking-widest mb-1">Final Score</span>
               <span className="text-3xl font-black text-primary block group-hover:scale-105 transition-transform">{scoreData.total}</span>
               <span className="text-[9px] text-slate-500 block mt-2 font-bold">{formatTime(scoreData.timeTaken)} Taken</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
             <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100">
               <CheckCircle2 className="text-emerald-500 mx-auto mb-1" size={18} />
               <span className="block text-lg font-black dark:text-white">{scoreData.correct}</span>
               <span className="text-[9px] font-bold text-emerald-600 uppercase">Correct</span>
             </div>
             <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100">
               <XCircle className="text-red-500 mx-auto mb-1" size={18} />
               <span className="block text-lg font-black dark:text-white">{scoreData.incorrect}</span>
               <span className="text-[9px] font-bold text-red-600 uppercase">Wrong</span>
             </div>
             <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200">
               <Bookmark className="text-slate-400 mx-auto mb-1" size={18} />
               <span className="block text-lg font-black dark:text-white">{scoreData.unattempted}</span>
               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Skipped</span>
             </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <button onClick={() => setAppState('review')} className="py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 animate-pulse hover:animate-none hover:from-emerald-600 hover:to-teal-600 transition-all"><ListChecks size={16} /> CHECK SOLUTION</button>
            <button onClick={() => setAppState('leaderboard')} className="py-3 bg-primary text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-2 shadow-xl hover:bg-purple-700 transition-all"><Crown size={16} /> BOARD RANKINGS</button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 5. REVIEW SOLUTIONS
  if (appState === 'review') {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-950 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8 sticky top-24 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md py-4 z-20 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-black dark:text-white flex items-center gap-2"><ListChecks className="text-primary" /> Answer Explanations</h2>
            <button onClick={() => setAppState('result')} className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 text-[10px] font-bold dark:text-white">Back</button>
          </div>
          <div className="space-y-6">
            {quizData.questions.map((q, idx) => {
              const userAnswer = selectedAnswers[idx];
              const isCorrect = userAnswer === q.correct;
              const isSkipped = userAnswer === undefined;
              return (
                <div key={idx} className={`bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border-l-4 ${isSkipped ? 'border-slate-300' : isCorrect ? 'border-emerald-500' : 'border-red-500'}`}>
                  <p className="text-primary font-black mb-2 text-[10px] uppercase">Record #{idx + 1}</p>
                  <h3 className="font-bold text-slate-800 dark:text-white mb-6 text-[13px] leading-relaxed">{q.question}</h3>
                  <div className="space-y-2 mb-6">
                    {q.options.map((opt, oIdx) => {
                      const isCorrectOpt = q.correct === oIdx;
                      const isSelectedOpt = userAnswer === oIdx;
                      let style = "bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-transparent";
                      if (isCorrectOpt) style = "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 text-emerald-700 font-bold";
                      else if (isSelectedOpt && !isCorrectOpt) style = "bg-red-50 dark:bg-red-900/10 border-red-200 text-red-700 line-through decoration-1";
                      return <div key={oIdx} className={`p-3 rounded-xl border text-[12px] flex items-center gap-3 ${style}`}>{opt}</div>;
                    })}
                  </div>
                  {q.explanation && (
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/20">
                      <h4 className="text-blue-700 dark:text-blue-400 font-black text-[9px] uppercase mb-2 tracking-widest flex items-center gap-2"><Sparkles size={14}/> Academic Insight</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 6. LEADERBOARD
  if (appState === 'leaderboard') {
    const activeList = leaderboardTab === 'daily' ? dbLeaderboard : cumulativeLeaderboard;
    const isCurrentUser = (entry) => entry.phone === userData.phone || entry.userId === userData.phone;
    const activeRank = leaderboardTab === 'daily' ? userDailyRank : userCumRank;
    const rankMedal = (i) => ['🥇','🥈','🥉'][i] ?? null;

    return (
      <div className="min-h-screen pt-28 pb-20 bg-[#f8fafc] dark:bg-slate-950 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <TrendingUp size={22} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-black dark:text-white leading-none">Leaderboard</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{date}</p>
              </div>
            </div>
            <button onClick={() => setAppState('result')} className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase dark:text-white">Return</button>
          </div>

          {/* Tab Toggle */}
          <div className="flex gap-1.5 mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => setLeaderboardTab('daily')}
              className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${leaderboardTab === 'daily' ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' : 'text-slate-400'}`}
            >
              Daily
            </button>
            <button
              onClick={() => setLeaderboardTab('cumulative')}
              className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${leaderboardTab === 'cumulative' ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' : 'text-slate-400'}`}
            >
              <Star size={11} /> All-Time
            </button>
          </div>

          {/* Top 10 flat list */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm mb-4">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Crown size={12} className="text-primary" /> Top 10
              </p>
              {activeRank && (
                <p className="text-[10px] font-bold text-slate-400">{activeRank.total} total participants</p>
              )}
            </div>

            {activeList.length === 0 ? (
              <div className="py-14 text-center">
                <Target size={28} className="mx-auto text-slate-200 mb-3 animate-pulse" />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Candidates...</p>
              </div>
            ) : (
              activeList.map((entry, i) => (
                <motion.div
                  key={`${leaderboardTab}-${i}`}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className={`flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 dark:border-slate-800/50 last:border-0 ${
                    isCurrentUser(entry) ? 'bg-primary/5 dark:bg-primary/10' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 shrink-0 text-center">
                    {rankMedal(i)
                      ? <span className="text-lg">{rankMedal(i)}</span>
                      : <span className="text-[11px] font-black text-slate-300 dark:text-slate-600">#{i + 1}</span>
                    }
                  </div>

                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${isCurrentUser(entry) ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {entry.displayName.charAt(0).toUpperCase()}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[13px] dark:text-white truncate flex items-center gap-1.5">
                      {entry.displayName}
                      {isCurrentUser(entry) && <span className="text-[8px] bg-primary text-white px-1.5 py-0.5 rounded-full font-black uppercase">You</span>}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {leaderboardTab === 'daily'
                        ? `${entry.correct} correct • ${formatTime(entry.timeTaken)}`
                        : `${entry.attemptCount} quiz${entry.attemptCount !== 1 ? 'zes' : ''} • Best ${entry.bestScore}`
                      }
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <p className={`text-base font-black ${isCurrentUser(entry) ? 'text-primary' : 'dark:text-white'}`}>
                      {leaderboardTab === 'daily' ? entry.score : entry.totalScore}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">pts</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Your Position Card — always shown */}
          {activeRank && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="p-5 rounded-3xl border-2 border-primary bg-white dark:bg-slate-900 shadow-lg shadow-primary/10"
            >
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Medal size={12} className="text-primary" /> Your Position
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex flex-col items-center justify-center shrink-0 border border-primary/20">
                  <span className="text-[9px] font-black text-primary/50 uppercase leading-none">Rank</span>
                  <span className="text-3xl font-black text-primary leading-tight">#{activeRank.rank}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-sm dark:text-white truncate">{userData.name}</h4>
                  <p className="text-[12px] text-slate-500 font-medium mt-1">
                    <span className="font-black text-primary">#{activeRank.rank}</span>
                    {' '}out of{' '}
                    <span className="font-black text-slate-700 dark:text-slate-200">{activeRank.total}</span>
                    {' '}{leaderboardTab === 'daily' ? 'students today' : 'registered students'}
                  </p>
                  {activeList.some(isCurrentUser) && (
                    <p className="text-[10px] text-emerald-600 font-black uppercase mt-1 flex items-center gap-1">
                      <Star size={9} className="fill-emerald-500 text-emerald-500" /> You're in Top 10!
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">{leaderboardTab === 'daily' ? 'Score' : 'Total'}</p>
                  <p className="text-2xl font-black text-primary">{leaderboardTab === 'daily' ? scoreData.total : myTotalScore}</p>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    );
  }

  return null;
}