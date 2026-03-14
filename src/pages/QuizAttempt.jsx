import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, ChevronLeft, Bookmark, Flag, 
  CheckCircle2, XCircle, RotateCcw, Trophy, BrainCircuit,
  User, Mail, Phone, Play, Clock, Medal, Crown,
  ArrowLeft, ListChecks, Sparkles, LayoutGrid, X, AlertCircle
} from 'lucide-react';

// --- ENHANCED 10 UPSC QUESTIONS WITH EXPLANATIONS ---
const quizQuestions = [
  {
    id: 1, category: "Indian Economy",
    question: "With reference to the Indian economy, what is the primary purpose of the 'Marginal Standing Facility' (MSF)?",
    options: ["To provide long-term loans to corporate sectors.", "To allow banks to borrow money from RBI overnight.", "To regulate the foreign exchange reserves.", "To manage the printing of currency notes."],
    answerIndex: 1,
    explanation: "MSF is a window for banks to borrow from the Reserve Bank of India in an emergency situation when inter-bank liquidity dries up completely. It allows banks to borrow money overnight up to a certain limit against government securities."
  },
  {
    id: 2, category: "History",
    question: "The 'Harappan' civilization is closely associated with which of the following rivers?",
    options: ["Ganga and Yamuna", "Indus and Sarasvati", "Brahmaputra", "Narmada"],
    answerIndex: 1,
    explanation: "The Harappan (Indus Valley) Civilization primarily flourished in the basins of the Indus River and the Ghaggar-Hakra River (often identified with the mythological Sarasvati river) in what is now Pakistan and northwestern India."
  },
  {
    id: 3, category: "Polity",
    question: "Which Article of the Indian Constitution safeguards one's right to marry the person of one's choice?",
    options: ["Article 19", "Article 21", "Article 25", "Article 29"],
    answerIndex: 1,
    explanation: "The Supreme Court of India in the Hadiya case ruled that the right to marry a person of one's choice is integral to Article 21 (Right to Life and Personal Liberty) of the Constitution."
  },
  {
    id: 4, category: "Geography",
    question: "Which of the following ocean currents is a cold current?",
    options: ["Kuroshio Current", "Gulf Stream", "Agulhas Current", "Canary Current"],
    answerIndex: 3,
    explanation: "The Canary Current is a wind-driven surface ocean current that is part of the North Atlantic Gyre. It is a cold current that flows southward along the coast of North Africa."
  },
  {
    id: 5, category: "Environment",
    question: "Which national park is famous for being the natural habitat of the 'Great Indian One-Horned Rhinoceros'?",
    options: ["Kaziranga National Park", "Kanha National Park", "Gir National Park", "Ranthambore National Park"],
    answerIndex: 0,
    explanation: "Kaziranga National Park in Assam is a World Heritage Site and hosts two-thirds of the world's Great One-horned Rhinoceroses."
  },
  {
    id: 6, category: "Science & Tech",
    question: "What is the primary objective of NASA's 'James Webb Space Telescope'?",
    options: ["To study the surface of Mars.", "To observe the universe in infrared to see distant galaxies.", "To land a rover on Jupiter's moon Europa.", "To track near-Earth asteroids."],
    answerIndex: 1,
    explanation: "JWST is designed primarily to conduct infrared astronomy. Its high-resolution and high-sensitivity instruments allow it to view objects too old, distant, or faint for the Hubble Space Telescope."
  },
  {
    id: 7, category: "Polity",
    question: "Who among the following administers the oath of office to the President of India?",
    options: ["Prime Minister", "Vice President", "Chief Justice of India", "Speaker of the Lok Sabha"],
    answerIndex: 2,
    explanation: "According to Article 60 of the Indian Constitution, the oath of office to the President is administered by the Chief Justice of India, or in their absence, the senior-most Judge of the Supreme Court available."
  },
  {
    id: 8, category: "Modern History",
    question: "Who was the founder of the 'Ghadar Party' in San Francisco?",
    options: ["Lala Hardayal", "Bhagat Singh", "Subhash Chandra Bose", "Chandrashekhar Azad"],
    answerIndex: 0,
    explanation: "The Ghadar Party was an international political movement organized by Indians to overthrow British rule in India. It was founded by Lala Hardayal, Sohan Singh Bhakna, and others in 1913 in San Francisco."
  },
  {
    id: 9, category: "Economy",
    question: "Which of the following is NOT a function of the Reserve Bank of India (RBI)?",
    options: ["Regulating credit in the country.", "Acting as a banker to the government.", "Accepting deposits from the general public.", "Managing the foreign exchange reserves."],
    answerIndex: 2,
    explanation: "The RBI is the central bank of the country. It does not deal directly with the general public for accepting deposits or opening bank accounts; commercial banks perform this function."
  },
  {
    id: 10, category: "Current Affairs",
    question: "The 'G20' summit hosted by India in 2023 inducted which new permanent member into the group?",
    options: ["ASEAN", "African Union", "SAARC", "BIMSTEC"],
    answerIndex: 1,
    explanation: "During the 18th G20 Summit hosted in New Delhi in 2023, the African Union (AU) was formally inducted as a permanent member of the G20, elevating the group to effectively become G21."
  }
];

// --- MOCK LEADERBOARD DATA ---
const mockLeaderboard = [
  { rank: 1, name: "Siddharth IAS", score: 13.3, time: "4m 12s" },
  { rank: 2, name: "Priya Sharma", score: 11.97, time: "5m 01s" },
  { rank: 3, name: "Rahul Verma", score: 11.97, time: "6m 45s" },
  { rank: 4, name: "Anjali Gupta", score: 10.64, time: "5m 30s" },
  { rank: 5, name: "Amit Kumar", score: 9.31, time: "7m 10s" },
];

export default function QuizAttempt() {
  // APP STATE: 'register' | 'countdown' | 'quiz' | 'result' | 'review' | 'leaderboard'
  const [appState, setAppState] = useState('register');
  
  // User Data
  const [user, setUser] = useState({ name: '', email: '', phone: '' });
  
  // Quiz Data
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [scoreData, setScoreData] = useState({ total: 0, correct: 0, incorrect: 0, unattempted: 0 });
  const [combinedLeaderboard, setCombinedLeaderboard] = useState([]);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);

  // Time Management (Persistent per question)
  const QUESTION_TIME = 60; 
  const [timeData, setTimeData] = useState(() => Array(quizQuestions.length).fill(QUESTION_TIME));
  const [countdownNum, setCountdownNum] = useState(3);

  // 1. SCROLL TO TOP ON ANY STATE CHANGE
  useEffect(() => { 
    window.scrollTo(0, 0); 
  }, [appState]);

  // 2. COUNTDOWN TIMER LOGIC
  useEffect(() => {
    let cdTimer;
    if (appState === 'countdown') {
      setCountdownNum(3); 
      cdTimer = setInterval(() => {
        setCountdownNum((prev) => {
          if (prev <= 1) {
            clearInterval(cdTimer);
            setAppState('quiz'); 
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(cdTimer);
  }, [appState]);

  // 3. PERSISTENT PER-QUESTION TIMER LOGIC
  useEffect(() => {
    let timer;
    if (appState === 'quiz') {
      timer = setInterval(() => {
        setTimeData((prev) => {
          const newTimes = [...prev];
          if (newTimes[currentIdx] > 0) {
            newTimes[currentIdx] -= 1;
            
            // If time just hit 0 for this specific question, auto-advance
            if (newTimes[currentIdx] === 0) {
              setTimeout(() => handleNext(true), 0); 
            }
          }
          return newTimes;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [appState, currentIdx]);

  // --- HANDLERS ---
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (user.name && user.email && user.phone) setAppState('countdown');
  };

  const handleSelectOption = (optIndex) => {
    // Prevent answering if time is up for this question
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

  const handleNext = (isTimeout = false) => {
    if (currentIdx < quizQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else if (isTimeout) {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = () => {
    let correct = 0, incorrect = 0, unattempted = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === undefined) unattempted++;
      else if (selectedAnswers[idx] === q.answerIndex) correct++;
      else incorrect++;
    });

    const rawScore = (correct * 1.33) - (incorrect * 0.66);
    const finalScore = Math.max(0, parseFloat(rawScore.toFixed(2)));

    setScoreData({ total: finalScore, correct, incorrect, unattempted });
    
    const newUserEntry = { rank: 0, name: `${user.name} (You)`, score: finalScore, time: "Just Now", isUser: true };
    const newLeaderboard = [...mockLeaderboard, newUserEntry].sort((a, b) => b.score - a.score);
    newLeaderboard.forEach((item, index) => item.rank = index + 1);
    setCombinedLeaderboard(newLeaderboard);

    setAppState('result');
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setMarkedForReview(new Set());
    setCurrentIdx(0);
    setTimeData(Array(quizQuestions.length).fill(QUESTION_TIME));
    setAppState('countdown');
  };

  // --- REUSABLE PALETTE COMPONENT ---
  const QuestionPalette = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <ListChecks className="text-primary" size={16} /> Question Palette
        </h3>
        <button className="lg:hidden p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md" onClick={() => setIsMobilePaletteOpen(false)}>
          <X size={16} />
        </button>
      </div>
      
      <div className="grid grid-cols-5 gap-2 mb-6">
        {quizQuestions.map((_, i) => {
          const isAnswered = selectedAnswers[i] !== undefined;
          const isMarked = markedForReview.has(i);
          const isCurrent = currentIdx === i;
          const isTimeUp = timeData[i] <= 0;

          let bgClass = "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400";
          if (isMarked && isAnswered) bgClass = "bg-purple-500 text-white border-purple-600 shadow-sm";
          else if (isMarked) bgClass = "bg-amber-400 text-white border-amber-500 shadow-sm";
          else if (isAnswered) bgClass = "bg-emerald-500 text-white border-emerald-600 shadow-sm";
          // If the time ran out and the user didn't answer, mark it as RED
          else if (isTimeUp) bgClass = "bg-red-500 text-white border-red-600 shadow-sm";
          
          if (isCurrent) bgClass += " ring-2 ring-primary/50 border-primary scale-105 z-10 relative font-black";

          return (
            <button
              key={i}
              onClick={() => { setCurrentIdx(i); setIsMobilePaletteOpen(false); }}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center font-semibold text-xs transition-all transform-gpu active:scale-90 ${bgClass}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="space-y-3 text-[10px] md:text-xs font-semibold text-slate-600 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-sm border bg-emerald-500 border-emerald-600"></div> Answered</div>
        <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-sm border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"></div> Not Answered</div>
        <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-sm border bg-amber-400 border-amber-500"></div> Marked for Review</div>
        <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-sm border bg-purple-500 border-purple-600"></div> Answered & Marked</div>
        <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-sm border bg-red-500 border-red-600"></div> Missed / Time Up</div>
      </div>
    </>
  );


  // ==========================================
  // VIEW: REGISTRATION
  // ==========================================
  if (appState === 'register') {
    return (
      <div className="min-h-screen pt-32 md:pt-40 pb-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50 dark:bg-slate-950 flex justify-center items-center px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 md:p-8 rounded-3xl shadow-2xl border border-white/50 dark:border-slate-800 relative z-10">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg transform -rotate-6">
            <BrainCircuit size={24} className="text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-center text-slate-900 dark:text-white mb-2 tracking-tight">Ready to Test?</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-xs md:text-sm font-medium">Enter your details to generate your scorecard and secure your rank.</p>
          
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div className="relative">
              <User size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400" />
              <input type="text" required placeholder="Full Name" value={user.name} onChange={(e)=>setUser({...user, name: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs md:text-sm font-medium transition-all dark:text-white" />
            </div>
            <div className="relative">
              <Mail size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400" />
              <input type="email" required placeholder="Email Address" value={user.email} onChange={(e)=>setUser({...user, email: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs md:text-sm font-medium transition-all dark:text-white" />
            </div>
            <div className="relative">
              <Phone size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400" />
              <input type="tel" required placeholder="Mobile Number" value={user.phone} onChange={(e)=>setUser({...user, phone: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs md:text-sm font-medium transition-all dark:text-white" />
            </div>
            <button type="submit" className="w-full py-3 mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_8px_25px_rgba(124,58,237,0.5)] transition-all transform-gpu hover:-translate-y-0.5 active:scale-95">
              Start Quiz <Play size={14} fill="currentColor" />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // VIEW: FULL-SCREEN COUNTDOWN OVERLAY
  // ==========================================
  if (appState === 'countdown') {
    return (
      <div className="fixed inset-0 z-[99999] bg-slate-900 flex flex-col justify-center items-center overflow-hidden">
        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} className="absolute w-96 h-96 bg-primary/30 rounded-full blur-[100px] pointer-events-none"></motion.div>
        <AnimatePresence mode="wait">
          <motion.div key={countdownNum} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }} transition={{ duration: 0.5 }} className="relative z-10 text-[10rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]">
            {countdownNum}
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-20 md:bottom-32 text-white/50 font-bold tracking-widest uppercase text-xs animate-pulse">Get Ready</div>
      </div>
    );
  }

  // ==========================================
  // VIEW: FULL-SCREEN ACTIVE QUIZ (IMMERSIVE)
  // ==========================================
  if (appState === 'quiz') {
    const question = quizQuestions[currentIdx];
    const currentQuestionTimeLeft = timeData[currentIdx];
    const isTimeUp = currentQuestionTimeLeft <= 0;
    
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (currentQuestionTimeLeft / QUESTION_TIME) * circumference;

    return (
      <div className="fixed inset-0 z-[99999] bg-slate-50 dark:bg-slate-950 font-sans flex flex-col h-[100dvh] overflow-hidden">
        
        {/* Force hide standard chatbots during exam */}
        <style>{`
          #chat-widget, #chat-widget-container, .chat-widget, iframe[src*="chat"], iframe[name*="chat"], #zsiq_float, #zsiq_maintab {
            display: none !important;
          }
        `}</style>

        {/* --- TOP EXAM HEADER --- */}
        <header className="h-14 md:h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 md:px-6 shrink-0 relative z-20 shadow-sm">
          <div className="flex items-center gap-2 md:gap-3">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md flex items-center justify-center shadow-sm">
               <BrainCircuit className="text-white" size={18}/>
             </div>
             <div>
               <h1 className="font-bold text-slate-900 dark:text-white text-xs md:text-sm leading-none">UPSC Prelims Mock</h1>
               <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">General Studies I</p>
             </div>
          </div>

          {/* Central Animated Timer */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 md:gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 md:px-3 md:py-1 rounded-full shadow-inner">
            <Clock size={14} className={currentQuestionTimeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-primary'} />
            <span className={`font-black text-xs md:text-sm w-5 text-center ${currentQuestionTimeLeft <= 10 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>{currentQuestionTimeLeft}</span>
            <span className="text-[9px] font-bold uppercase text-slate-400 hidden sm:block tracking-widest">Secs Left</span>
          </div>

          <div className="flex items-center gap-2">
             <button onClick={() => setIsMobilePaletteOpen(true)} className="lg:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
               <LayoutGrid size={16} />
             </button>
             <button onClick={handleSubmit} className="hidden md:flex px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-md font-bold text-xs transition-colors items-center gap-1.5 shadow-sm">
               Submit Test
             </button>
          </div>
        </header>

        {/* --- MAIN EXAM BODY --- */}
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* LEFT AREA (Question & Options) */}
          <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-50 dark:bg-slate-950/50">
            
            {/* Scrollable Question Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
              {/* REMOVED mx-auto, INCREASED max-width to allow full left-aligned spread */}
              <div className="w-full max-w-5xl xl:max-w-6xl relative z-10">
                
                {/* Meta Info */}
                <div className="flex justify-between items-center mb-4">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-[10px] font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                    {question.category}
                  </span>
                  
                  <div className="flex items-center gap-4">
                    {isTimeUp && (
                      <span className="text-[10px] font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded flex items-center gap-1 border border-red-200 dark:border-red-800 animate-pulse">
                        <AlertCircle size={12} /> TIME UP
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      Q {currentIdx + 1} / {quizQuestions.length}
                    </span>
                  </div>
                </div>

                {/* Question Card */}
                <motion.div 
                  key={currentIdx}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}
                  className={`bg-white dark:bg-slate-900 border ${isTimeUp ? 'border-red-200 dark:border-red-900/50' : 'border-slate-200 dark:border-slate-800'} p-5 md:p-8 rounded-2xl shadow-sm relative overflow-hidden group`}
                >
                  {/* Colorful, Small Watermark Logo */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 dark:opacity-[0.05] transition-transform duration-1000 group-hover:scale-105 z-0">
                    <img src="/logo.png" alt="watermark" className="w-32 md:w-48 lg:w-56 object-contain" />
                  </div>

                  {/* The Question */}
                  <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-relaxed mb-6 relative z-10">
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600 mr-1 text-lg md:text-xl">Q.</span> 
                    {question.question}
                  </h2>

                  {/* The Options */}
                  <div className="flex flex-col gap-3 relative z-10">
                    {question.options.map((opt, i) => {
                      const isSelected = selectedAnswers[currentIdx] === i;
                      return (
                        <button
                          key={i}
                          onClick={() => handleSelectOption(i)}
                          disabled={isTimeUp}
                          className={`w-full text-left p-3 md:p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 group/btn ${
                            isTimeUp 
                              ? (isSelected ? 'border-primary bg-primary/5 dark:bg-primary/10 opacity-80 cursor-not-allowed' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 cursor-not-allowed')
                              : (isSelected 
                                ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm' 
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800/50 bg-white/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300')
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-primary bg-primary text-white' : (isTimeUp ? 'border-slate-200 dark:border-slate-700 text-slate-300' : 'border-slate-300 dark:border-slate-600 group-hover/btn:border-primary text-slate-500')}`}>
                             <span className="text-[10px] font-bold">{String.fromCharCode(65 + i)}</span>
                          </div>
                          <span className={`text-sm font-medium leading-snug ${isSelected ? 'text-slate-900 dark:text-white font-bold' : ''}`}>
                            {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="h-16 md:h-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-3 md:px-6 flex items-center justify-between shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.02)] z-20">
               <div className="flex gap-2 md:gap-3">
                 <button onClick={handlePrev} disabled={currentIdx === 0} className="px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-bold text-xs md:text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors">
                   <ChevronLeft size={16} /> <span className="hidden sm:inline">Prev</span>
                 </button>
                 <button onClick={handleToggleReview} className={`px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-bold text-xs md:text-sm border flex items-center gap-1.5 transition-colors ${markedForReview.has(currentIdx) ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                   <Flag size={14} className={markedForReview.has(currentIdx) ? 'fill-amber-500 text-amber-500' : ''} /> 
                   <span className="hidden sm:inline">{markedForReview.has(currentIdx) ? 'Marked' : 'Mark for Review'}</span>
                 </button>
               </div>
               
               <div className="flex gap-2 md:gap-3">
                 {currentIdx === quizQuestions.length - 1 ? (
                   <button onClick={handleSubmit} className="px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-bold text-xs md:text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md flex items-center gap-1.5 transform-gpu active:scale-95">
                     Submit <span className="hidden sm:inline">Test</span> <CheckCircle2 size={16} />
                   </button>
                 ) : (
                   <button onClick={() => handleNext(false)} className="px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-bold text-xs md:text-sm bg-primary hover:bg-purple-700 text-white shadow-md flex items-center gap-1.5 transform-gpu active:scale-95">
                     Next <ChevronRight size={16} />
                   </button>
                 )}
               </div>
            </div>
          </div>

          {/* RIGHT AREA (Desktop Palette) */}
          <div className="hidden lg:flex w-72 flex-col border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 h-full z-10 p-5 overflow-y-auto">
             <QuestionPalette />
             <button onClick={handleSubmit} className="w-full mt-auto py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold text-xs shadow-sm hover:shadow-md hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all transform-gpu active:scale-95 border border-transparent">
               Final Submit
             </button>
          </div>

          {/* MOBILE SLIDE-OUT PALETTE */}
          <AnimatePresence>
            {isMobilePaletteOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobilePaletteOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" />
                <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="absolute top-0 right-0 bottom-0 w-4/5 max-w-xs bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-5 flex flex-col overflow-y-auto lg:hidden">
                   <QuestionPalette />
                   <button onClick={handleSubmit} className="w-full mt-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold text-xs shadow-sm active:scale-95">
                     Final Submit
                   </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: RESULT SCREEN (Re-enters normal DOM flow)
  // ==========================================
  if (appState === 'result') {
    return (
      <div className="min-h-screen pt-32 md:pt-40 pb-20 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 overflow-x-hidden">
        {scoreData.total > 8 && <div className="absolute inset-0 bg-[url('https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDMyM2U0aWJtZHZ5MjV5Z2Y2Znd4ZjE4Z3YyZTRyd2E4NjA4dTVhayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKr3nzbh5WgCFxe/giphy.gif')] opacity-20 mix-blend-screen pointer-events-none z-0"></div>}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-6 md:p-10 w-full max-w-xl text-center relative z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
          
          <motion.div animate={{ rotateY: [0, 360] }} transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 2 }} className="mx-auto w-16 h-16 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/20">
            <Trophy size={32} className="text-yellow-500" />
          </motion.div>
          
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Test Completed!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm font-medium">Here is your performance breakdown, <span className="text-primary font-bold">{user.name}</span>.</p>

          <div className="flex justify-center items-center mb-8">
            <div className="bg-gradient-to-br from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 p-5 rounded-2xl w-48 shadow-inner border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
               <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
               <span className="text-[10px] uppercase font-bold text-slate-400 absolute top-3 left-0 right-0 text-center tracking-widest">Total Score</span>
               <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600 block mt-3 drop-shadow-sm">{scoreData.total}</span>
               <span className="text-[10px] text-slate-500 block mt-1 font-semibold">out of {(quizQuestions.length * 1.33).toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
             <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 p-3 rounded-xl flex flex-col items-center">
               <CheckCircle2 className="text-emerald-500 mb-1" size={20} />
               <span className="text-lg font-bold text-slate-900 dark:text-white">{scoreData.correct}</span>
               <span className="text-[9px] md:text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Correct</span>
             </div>
             <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 p-3 rounded-xl flex flex-col items-center">
               <XCircle className="text-red-500 mb-1" size={20} />
               <span className="text-lg font-bold text-slate-900 dark:text-white">{scoreData.incorrect}</span>
               <span className="text-[9px] md:text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Incorrect</span>
             </div>
             <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl flex flex-col items-center">
               <Bookmark className="text-slate-400 mb-1" size={20} />
               <span className="text-lg font-bold text-slate-900 dark:text-white">{scoreData.unattempted}</span>
               <span className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Skipped</span>
             </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 justify-center">
            <button onClick={() => setAppState('review')} className="w-full py-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary rounded-lg font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2">
              <ListChecks size={16} className="text-primary" /> Review Answers
            </button>
            <button onClick={() => setAppState('leaderboard')} className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 transform-gpu active:scale-95">
              <Crown size={16} /> View Leaderboard
            </button>
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-3">
             <button onClick={resetQuiz} className="text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5">
               <RotateCcw size={12} /> Retake Quiz
             </button>
             <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
             <Link to="/" className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">
               Return Home
             </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // VIEW: LEADERBOARD
  // ==========================================
  if (appState === 'leaderboard') {
    return (
      <div className="min-h-screen pt-28 md:pt-32 pb-20 bg-slate-50 dark:bg-slate-950 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 md:gap-3">
              <Crown className="text-yellow-500" size={24} /> Global Leaderboard
            </h2>
            <button onClick={() => setAppState('result')} className="px-3 py-1.5 md:px-4 md:py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 font-bold text-xs md:text-sm flex items-center gap-1.5 hover:bg-slate-50 text-slate-800 dark:text-white">
              <ArrowLeft size={14} /> Back
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-end justify-center gap-3 sm:gap-4 mb-8 mt-6">
             {/* 2nd Place */}
             <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full sm:w-1/3 order-2 sm:order-1 flex flex-col items-center">
                <div className="bg-slate-200 dark:bg-slate-700 p-1.5 rounded-full mb-2"><Medal className="text-slate-500" size={20} /></div>
                <div className="text-center mb-2">
                  <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{combinedLeaderboard[1]?.name}</p>
                  <p className="text-primary font-black text-sm">{combinedLeaderboard[1]?.score}</p>
                </div>
                <div className="w-full h-16 bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-t-xl border-t-4 border-slate-400 flex justify-center pt-2 text-slate-500 font-black text-lg">2</div>
             </motion.div>
             
             {/* 1st Place */}
             <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full sm:w-1/3 order-1 sm:order-2 flex flex-col items-center z-10 sm:-mb-2">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full mb-2 border-2 border-yellow-400 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm">👑</div>
                  <Trophy className="text-yellow-500" size={24} />
                </div>
                <div className="text-center mb-2">
                  <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{combinedLeaderboard[0]?.name}</p>
                  <p className="text-yellow-600 dark:text-yellow-400 font-black text-lg">{combinedLeaderboard[0]?.score}</p>
                </div>
                <div className="w-full h-24 bg-gradient-to-t from-yellow-300 to-yellow-100 dark:from-yellow-900/40 dark:to-yellow-800/40 rounded-t-xl border-t-4 border-yellow-400 flex justify-center pt-2 text-yellow-600 dark:text-yellow-500 font-black text-2xl shadow-[0_0_20px_rgba(234,179,8,0.2)]">1</div>
             </motion.div>

             {/* 3rd Place */}
             <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full sm:w-1/3 order-3 flex flex-col items-center">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-full mb-2"><Medal className="text-amber-600" size={20} /></div>
                <div className="text-center mb-2">
                  <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{combinedLeaderboard[2]?.name}</p>
                  <p className="text-primary font-black text-sm">{combinedLeaderboard[2]?.score}</p>
                </div>
                <div className="w-full h-12 bg-gradient-to-t from-amber-300/50 to-amber-200/50 dark:from-amber-900/30 dark:to-amber-800/30 rounded-t-xl border-t-4 border-amber-600/50 flex justify-center pt-2 text-amber-700/50 dark:text-amber-600/50 font-black text-lg">3</div>
             </motion.div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 gap-3 p-3 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/50">
               <div className="col-span-2 text-center">Rank</div>
               <div className="col-span-7">Candidate</div>
               <div className="col-span-3 text-right">Score</div>
            </div>
            {combinedLeaderboard.slice(3).map((item) => (
              <div key={item.rank} className={`grid grid-cols-12 gap-3 p-3 border-b border-slate-100 dark:border-slate-800/50 items-center transition-colors text-xs ${item.isUser ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                <div className="col-span-2 text-center font-bold text-slate-500">{item.rank}</div>
                <div className="col-span-7 flex items-center gap-2">
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${item.isUser ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}>
                     {item.name.charAt(0)}
                   </div>
                   <span className={`font-semibold line-clamp-1 ${item.isUser ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>{item.name}</span>
                </div>
                <div className="col-span-3 text-right font-black text-slate-900 dark:text-white">
                  {item.score}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: REVIEW ANSWERS
  // ==========================================
  if (appState === 'review') {
    return (
      <div className="min-h-screen pt-28 md:pt-32 pb-20 bg-slate-50 dark:bg-slate-950 px-4">
        <div className="w-full max-w-5xl xl:max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6 sticky top-20 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md py-3 z-20">
            <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ListChecks className="text-primary" size={20} /> Detailed Solutions
            </h2>
            <button onClick={() => setAppState('result')} className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 text-slate-800 dark:text-white">
              <ArrowLeft size={14} /> Back
            </button>
          </div>

          <div className="space-y-4">
            {quizQuestions.map((q, idx) => {
              const userAnswer = selectedAnswers[idx];
              const isCorrect = userAnswer === q.answerIndex;
              const isUnattempted = userAnswer === undefined;

              let statusBorder = "border-slate-200 dark:border-slate-800";
              let statusBadge = <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[9px] font-bold uppercase border border-slate-200 dark:border-slate-700">Skipped</span>;
              
              if (!isUnattempted) {
                statusBorder = isCorrect ? "border-emerald-500" : "border-red-500";
                statusBadge = isCorrect 
                  ? <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-[9px] font-bold uppercase flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"><CheckCircle2 size={10}/> Correct</span>
                  : <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-[9px] font-bold uppercase flex items-center gap-1 border border-red-200 dark:border-red-800"><XCircle size={10}/> Incorrect</span>;
              }

              return (
                <div key={idx} className={`bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 shadow-sm border-l-[4px] border-y border-r border-y-slate-200 border-r-slate-200 dark:border-y-slate-800 dark:border-r-slate-800 ${statusBorder}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-primary font-black text-sm">Q{idx + 1}.</span>
                    {statusBadge}
                  </div>
                  
                  <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white mb-4">{q.question}</h3>
                  
                  <div className="space-y-2 mb-4">
                    {q.options.map((opt, oIdx) => {
                      const isThisCorrect = q.answerIndex === oIdx;
                      const isThisSelected = userAnswer === oIdx;
                      
                      let bg = "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400";
                      if (isThisCorrect) bg = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500";
                      else if (isThisSelected && !isThisCorrect) bg = "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 font-semibold line-through opacity-70";

                      return (
                        <div key={oIdx} className={`p-3 rounded-xl border flex items-center gap-3 ${bg}`}>
                          <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 border border-current text-[9px] font-bold">
                             {String.fromCharCode(65 + oIdx)}
                          </div>
                          <span className="text-xs md:text-sm">{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl p-4">
                    <h4 className="flex items-center gap-1.5 text-blue-800 dark:text-blue-400 font-bold text-xs mb-1.5 uppercase tracking-wide">
                      <Sparkles size={12} /> Explanation
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 text-xs md:text-sm leading-relaxed font-medium">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}