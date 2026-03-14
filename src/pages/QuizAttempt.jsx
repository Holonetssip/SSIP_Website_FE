import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Bookmark, Flag,
  CheckCircle2, XCircle, RotateCcw, Trophy, BrainCircuit,
  Loader2, AlertCircle, CalendarX, LogIn, Timer,
  Medal, User
} from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  fetchQuiz, getTodayDate,
  saveAttempt, fetchLeaderboard
} from '../services/quizService';

// ── Timer display ────────────────────────────────────────────────────────────
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Leaderboard section ──────────────────────────────────────────────────────
function Leaderboard({ date, currentUserId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard(date, 10)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [date]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
        <Loader2 size={18} className="animate-spin" /> Loading leaderboard…
      </div>
    );
  }

  if (entries.length === 0) {
    return <p className="text-center text-slate-400 text-sm py-6">No scores yet. Be the first!</p>;
  }

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="flex flex-col gap-2 mt-2">
      {entries.map((entry, i) => {
        const isMe = entry.userId === currentUserId;
        return (
          <div
            key={entry.userId}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
              isMe
                ? 'bg-primary/10 border-primary/30 dark:bg-primary/20'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50'
            }`}
          >
            <span className="text-lg w-6 text-center shrink-0">{medals[i] || `${i + 1}`}</span>
            {entry.photoURL ? (
              <img src={entry.photoURL} alt="" className="w-7 h-7 rounded-full shrink-0 object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <User size={14} className="text-slate-400" />
              </div>
            )}
            <span className={`flex-1 text-sm font-bold truncate ${isMe ? 'text-primary' : 'text-slate-800 dark:text-slate-200'}`}>
              {entry.displayName}{isMe && ' (You)'}
            </span>
            <span className="shrink-0 text-sm font-black text-slate-700 dark:text-slate-300">{entry.score}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function QuizAttempt() {
  const [searchParams] = useSearchParams();
  const date = searchParams.get('date') || getTodayDate();

  // Auth
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Quiz data
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Attempt
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scoreData, setScoreData] = useState({ total: 0, correct: 0, incorrect: 0, unattempted: 0, timeTaken: 0 });

  // Timer
  const startTimeRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Load quiz + start timer
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchQuiz(date)
      .then((data) => {
        if (!data) setError('no_quiz');
        else {
          setQuizData(data);
          // Start timer
          startTimeRef.current = Date.now();
          timerRef.current = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
          }, 1000);
        }
      })
      .catch(() => setError('fetch_failed'))
      .finally(() => setLoading(false));

    return () => clearInterval(timerRef.current);
  }, [date]);

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading || authLoading) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-slate-500 font-medium">Loading today's quiz…</p>
      </div>
    );
  }

  if (error === 'no_quiz') {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center gap-6 bg-slate-50 dark:bg-slate-950 p-4 text-center">
        <CalendarX size={48} className="text-slate-400" />
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">No Quiz for {date}</h2>
        <p className="text-slate-500 max-w-sm">Quiz for this date hasn't been published yet. Check back later!</p>
        <Link to="/quiz" className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-purple-700 transition">
          Back to Quiz
        </Link>
      </div>
    );
  }

  if (error === 'fetch_failed') {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center gap-6 bg-slate-50 dark:bg-slate-950 p-4 text-center">
        <AlertCircle size={48} className="text-red-400" />
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Something went wrong</h2>
        <p className="text-slate-500 max-w-sm">Could not load the quiz. Please check your connection and try again.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-purple-700 transition">
          Retry
        </button>
      </div>
    );
  }

  const quizQuestions = quizData.questions;

  // ── Handlers ────────────────────────────────────────────────────────────
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

  const handleNext = () => {
    if (currentIdx < quizQuestions.length - 1) setCurrentIdx(currentIdx + 1);
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const handleSubmit = () => {
    clearInterval(timerRef.current);
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

    let correct = 0, incorrect = 0, unattempted = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === undefined) unattempted++;
      else if (selectedAnswers[idx] === q.correct) correct++;
      else incorrect++;
    });

    const rawScore = (correct * 1.33) - (incorrect * 0.66);
    const finalScore = Math.max(0, parseFloat(rawScore.toFixed(2)));
    const result = { total: finalScore, correct, incorrect, unattempted, timeTaken };

    setScoreData(result);
    setIsSubmitted(true);
    window.scrollTo(0, 0);

    // Auto-save if logged in
    if (user) {
      setSaving(true);
      saveAttempt(
        user.uid, date,
        { score: finalScore, correct, incorrect, skipped: unattempted, timeTaken },
        { displayName: user.displayName, photoURL: user.photoURL }
      )
        .then(() => setSaved(true))
        .catch(console.error)
        .finally(() => setSaving(false));
    }
  };

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      // Save attempt after sign in
      setSaving(true);
      await saveAttempt(
        u.uid, date,
        { score: scoreData.total, correct: scoreData.correct, incorrect: scoreData.incorrect, skipped: scoreData.unattempted, timeTaken: scoreData.timeTaken },
        { displayName: u.displayName, photoURL: u.photoURL }
      );
      setSaved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setMarkedForReview(new Set());
    setCurrentIdx(0);
    setIsSubmitted(false);
    setSaved(false);
    startTimeRef.current = Date.now();
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const question = quizQuestions[currentIdx];

  // ── Result screen ────────────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-950 p-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">

          {/* Score card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-[2rem] p-8 md:p-10 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500" />

            <Trophy size={56} className="mx-auto text-yellow-500 mb-4" />
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">Quiz Completed!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex items-center justify-center gap-1">
              <Timer size={14} /> Time: {formatTime(scoreData.timeTaken)}
            </p>

            {/* Score */}
            <div className="flex justify-center mb-7">
              <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-3xl w-44 shadow-inner border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Score</span>
                <span className="text-4xl font-black text-primary block">{scoreData.total}</span>
                <span className="text-xs text-slate-500 block mt-1">out of {(quizQuestions.length * 1.33).toFixed(2)}</span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-3 gap-3 mb-7">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 p-3 rounded-2xl flex flex-col items-center">
                <CheckCircle2 className="text-emerald-500 mb-1.5" size={22} />
                <span className="text-xl font-bold text-slate-900 dark:text-white">{scoreData.correct}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Correct</span>
                <span className="text-[10px] text-slate-400 mt-0.5">+1.33 each</span>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 p-3 rounded-2xl flex flex-col items-center">
                <XCircle className="text-red-500 mb-1.5" size={22} />
                <span className="text-xl font-bold text-slate-900 dark:text-white">{scoreData.incorrect}</span>
                <span className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase">Incorrect</span>
                <span className="text-[10px] text-slate-400 mt-0.5">-0.66 each</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl flex flex-col items-center">
                <Bookmark className="text-slate-400 mb-1.5" size={22} />
                <span className="text-xl font-bold text-slate-900 dark:text-white">{scoreData.unattempted}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Skipped</span>
                <span className="text-[10px] text-slate-400 mt-0.5">0 marks</span>
              </div>
            </div>

            {/* Save score CTA */}
            {!user && !saved && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-5 text-center">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Sign in to save your score & appear on the leaderboard
                </p>
                <button
                  onClick={handleSignIn}
                  disabled={saving}
                  className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-200 shadow-sm hover:shadow-md transition disabled:opacity-60"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                  {saving ? 'Saving…' : 'Sign in with Google'}
                </button>
              </div>
            )}

            {saved && (
              <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-5">
                <CheckCircle2 size={18} /> Score saved to leaderboard!
              </div>
            )}

            {saving && !saved && (
              <div className="flex items-center justify-center gap-2 text-slate-400 text-sm mb-5">
                <Loader2 size={16} className="animate-spin" /> Saving score…
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={resetQuiz} className="px-7 py-3 bg-primary hover:bg-purple-700 text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2">
                <RotateCcw size={16} /> Retake
              </button>
              <Link to="/quiz" className="px-7 py-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold transition flex items-center justify-center">
                All Quizzes
              </Link>
              <Link to="/" className="px-7 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl font-bold shadow-md transition flex items-center justify-center">
                Home
              </Link>
            </div>
          </motion.div>

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Medal size={20} className="text-yellow-500" />
              <h3 className="font-black text-slate-900 dark:text-white text-lg">Leaderboard</h3>
              <span className="text-xs text-slate-400 font-medium ml-1">— {date}</span>
            </div>
            <Leaderboard date={date} currentUserId={user?.uid} />
          </motion.div>

        </div>
      </div>
    );
  }

  // ── Active quiz screen ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-20 bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="container mx-auto px-4 max-w-6xl flex flex-col lg:flex-row gap-8">

        {/* LEFT: Question area */}
        <div className="flex-1 flex flex-col">

          {/* Title + timer row */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-black text-slate-800 dark:text-white truncate flex-1 mr-4">
              {quizData.title}
            </h1>
            <div className="shrink-0 flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 shadow-sm">
              <Timer size={14} className="text-primary" />
              {formatTime(elapsed)}
            </div>
          </div>

          {/* Subject + question count */}
          <div className="flex justify-between items-center mb-6">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800">
              <BrainCircuit size={14} /> {question.category || quizData.subject || 'General Studies'}
            </div>
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Q {currentIdx + 1} / {quizQuestions.length}
            </div>
          </div>

          {/* Question card */}
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-[2rem] shadow-sm flex-1 mb-6"
          >
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed mb-8">
              <span className="text-primary mr-2">Q{currentIdx + 1}.</span> {question.question}
            </h2>

            <div className="flex flex-col gap-4">
              {question.options.map((opt, i) => {
                const isSelected = selectedAnswers[currentIdx] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(i)}
                    className={`text-left p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${
                      isSelected
                        ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-primary' : 'border-slate-300 dark:border-slate-600'}`}>
                      {isSelected && <div className="w-3 h-3 bg-primary rounded-full" />}
                    </div>
                    <span className={`text-sm md:text-base font-medium ${isSelected ? 'text-slate-900 dark:text-white font-semibold' : ''}`}>
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Nav controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="px-5 py-3 rounded-xl font-bold text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <ChevronLeft size={16} /> Prev
            </button>

            <button
              onClick={handleToggleReview}
              className={`px-5 py-3 rounded-xl font-bold text-sm border flex items-center gap-2 transition-colors ${
                markedForReview.has(currentIdx)
                  ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Flag size={16} className={markedForReview.has(currentIdx) ? 'fill-amber-500 text-amber-500' : ''} />
              {markedForReview.has(currentIdx) ? 'Marked' : 'Mark for Review'}
            </button>

            {currentIdx === quizQuestions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md transition-all flex items-center gap-2 active:scale-95"
              >
                Submit Quiz <CheckCircle2 size={16} />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-md transition-all flex items-center gap-2 active:scale-95"
              >
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: Palette */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm sticky top-32">
            <h3 className="font-black text-slate-900 dark:text-white mb-4">Question Palette</h3>

            <div className="grid grid-cols-5 gap-3 mb-6">
              {quizQuestions.map((_, i) => {
                const isAnswered = selectedAnswers[i] !== undefined;
                const isMarked = markedForReview.has(i);
                const isCurrent = currentIdx === i;

                let bgClass = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400";
                if (isMarked && isAnswered) bgClass = "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700";
                else if (isMarked) bgClass = "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700";
                else if (isAnswered) bgClass = "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700";
                if (isCurrent) bgClass += " ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-primary border-primary";

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm transition-all active:scale-90 ${bgClass}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6">
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300 dark:bg-emerald-900/50 dark:border-emerald-700" /> Answered</div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700" /> Not Answered</div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded bg-amber-100 border border-amber-300 dark:bg-amber-900/50 dark:border-amber-700" /> Marked for Review</div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded bg-purple-100 border border-purple-300 dark:bg-purple-900/50 dark:border-purple-700" /> Answered & Marked</div>
            </div>

            <button onClick={handleSubmit} className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-md hover:bg-primary dark:hover:bg-primary hover:text-white transition-colors">
              Submit Final Quiz
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
