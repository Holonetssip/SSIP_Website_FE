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
  saveAttempt, fetchLeaderboard
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
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);

  const QUESTION_TIME = 60; 
  const [timeData, setTimeData] = useState([]);
  const [countdownNum, setCountdownNum] = useState(3);
  const startTimeRef = useRef(null);

  // 1. Initial Load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchQuiz(date)
      .then((data) => {
        if (!data) setError('no_quiz');
        else {
          setQuizData(data);
          setTimeData(Array(data.questions.length).fill(QUESTION_TIME));
        }
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

  // 3. Question Timer Logic
  useEffect(() => {
    let timer;
    if (appState === 'quiz' && quizData) {
      timer = setInterval(() => {
        setTimeData((prev) => {
          const newTimes = [...prev];
          if (newTimes[currentIdx] > 0) {
            newTimes[currentIdx] -= 1;
            if (newTimes[currentIdx] === 0) {
              if (currentIdx < quizData.questions.length - 1) setCurrentIdx(p => p + 1);
              else handleSubmit();
            }
          }
          return newTimes;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [appState, currentIdx, quizData]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(userData.phone)) return alert("Please enter a valid 10-digit mobile number.");
    setAppState('countdown');
  };

  const handleSelectOption = (optIndex) => {
    if (timeData[currentIdx] <= 0) return;
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

    const finalScore = Math.max(0, parseFloat(((correct * 1.33) - (incorrect * 0.66)).toFixed(2)));
    setScoreData({ total: finalScore, correct, incorrect, unattempted, timeTaken });
    setAppState('result');
    setSaving(true);

    try {
      const userId = `u_${Date.now()}`;
      await saveAttempt(userId, date, 
        { score: finalScore, correct, incorrect, skipped: unattempted, timeTaken },
        { displayName: userData.name }
      );
      const lb = await fetchLeaderboard(date, 30);
      setDbLeaderboard(lb);
    } catch (err) { console.error(err); } 
    finally { setSaving(false); }
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setMarkedForReview(new Set());
    setCurrentIdx(0);
    setTimeData(Array(quizData.questions.length).fill(QUESTION_TIME));
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
    const timeLeft = timeData[currentIdx];

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
            <Clock size={14} className={timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-primary'} />
            <span className={`font-black text-xs ${timeLeft <= 10 ? 'text-red-500' : 'dark:text-white'}`}>{timeLeft}s</span>
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
                      <button key={i} onClick={() => handleSelectOption(i)} disabled={timeLeft <= 0}
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
          </div>
          <button onClick={() => currentIdx === quizData.questions.length-1 ? handleSubmit() : setCurrentIdx(currentIdx+1)} className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs flex items-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary/20">{currentIdx === quizData.questions.length-1 ? 'FINISH' : 'NEXT'} <ChevronRight size={16}/></button>
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
            <button onClick={() => setAppState('review')} className="py-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-2 hover:bg-slate-200"><ListChecks size={16} className="text-primary" /> REVIEW OMR</button>
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

  // 6. NEO-MODERN LEADERBOARD (STORY STYLE / RECENT UPDATES)
  if (appState === 'leaderboard') {
    const podium = dbLeaderboard.slice(0, 3);
    const others = dbLeaderboard.slice(3);

    return (
      <div className="min-h-screen pt-28 pb-20 bg-[#f8fafc] dark:bg-slate-950 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <TrendingUp size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-black dark:text-white leading-none">Global Rankings</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Updated Just Now • {date}</p>
              </div>
            </div>
            <button onClick={() => setAppState('result')} className="self-start px-4 py-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase dark:text-white hover:bg-slate-50 transition-colors">Return</button>
          </div>

          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {podium.map((entry, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`relative p-5 rounded-[2rem] border overflow-hidden ${
                  i === 0 ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105 z-10' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                {i === 0 && <div className="absolute top-2 right-4 text-2xl">👑</div>}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black mb-3 ${i === 0 ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-primary'}`}>
                  {entry.displayName.charAt(0)}
                </div>
                <h3 className={`font-bold text-sm truncate ${i === 0 ? 'text-white' : 'dark:text-white'}`}>{entry.displayName}</h3>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className={`text-[9px] uppercase font-bold ${i === 0 ? 'text-white/60' : 'text-slate-400'}`}>Score</p>
                    <p className="text-xl font-black">{entry.score}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[9px] uppercase font-bold ${i === 0 ? 'text-white/60' : 'text-slate-400'}`}>Rank</p>
                    <p className="text-xl font-black">#{i + 1}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Feed Style List */}
          <div className="space-y-3">
            {others.length > 0 ? others.map((entry, i) => (
              <motion.div 
                key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (i + 3) * 0.05 }}
                className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md ${
                  entry.displayName.includes('(You)') 
                  ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800' 
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                }`}
              >
                <div className="w-8 text-[11px] font-black text-slate-300 dark:text-slate-700 group-hover:text-primary transition-colors">#{i + 4}</div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center font-bold text-slate-400 dark:text-slate-600 border border-slate-100 dark:border-slate-700">
                  {entry.displayName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[12px] dark:text-white truncate flex items-center gap-2">
                    {entry.displayName}
                    {entry.displayName.includes('(You)') && <span className="text-[8px] bg-primary text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Current User</span>}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium">Verified Performance • {formatTime(entry.timeTaken)}s</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <Zap size={10} className="text-amber-500 fill-amber-500" />
                    <span className="font-black text-[13px] dark:text-white">{entry.score}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Aggr. Score</p>
                </div>
              </motion.div>
            )) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
                <Target size={32} className="mx-auto text-slate-200 mb-3 animate-pulse" />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Candidates...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}