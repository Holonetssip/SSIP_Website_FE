import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BrainCircuit, Sparkles, Calendar, BookOpen,
  ChevronRight, Loader2, Send, Trophy
} from 'lucide-react';
import { fetchRecentQuizzes, getTodayDate } from '../services/quizService';

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = getTodayDate();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchRecentQuizzes(30)
      .then(setQuizzes)
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-950 font-sans relative overflow-hidden">

      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 dark:bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 dark:bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold text-xs mb-5">
            <Sparkles size={13} className="animate-pulse" /> Daily Quiz Vault
          </div>

          <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <BrainCircuit size={30} className="text-white" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-3">
            Quiz <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Archive</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto text-sm md:text-base">
            Attempt daily quizzes curated for UPSC & PCS preparation. New quiz every day.
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 size={36} className="animate-spin text-primary" />
            <p className="text-slate-500 font-medium text-sm">Fetching quizzes…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && quizzes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 rounded-[2rem] p-10 text-center shadow-xl"
          >
            <Trophy size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h2 className="text-xl font-black text-slate-700 dark:text-slate-300 mb-2">No Quizzes Yet</h2>
            <p className="text-slate-500 text-sm mb-6">Quizzes will appear here once published. Stay tuned!</p>
            <a
              href="https://t.me/+U98qAhiBLLg3ZWRl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition"
            >
              <Send size={15} /> Get Notified on Telegram
            </a>
          </motion.div>
        )}

        {/* Quiz list */}
        {!loading && quizzes.length > 0 && (
          <div className="flex flex-col gap-4">
            {quizzes.map((quiz, idx) => {
              const isToday = quiz.date === today;
              return (
                <motion.div
                  key={quiz.date}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    to={`/quiz/attempt?date=${quiz.date}`}
                    className="group flex items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Left: date icon */}
                    <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm ${isToday ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      <Calendar size={20} />
                    </div>

                    {/* Center: info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-black text-slate-900 dark:text-white truncate">
                          {quiz.title}
                        </span>
                        {isToday && (
                          <span className="shrink-0 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full border border-primary/20">
                            TODAY
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} /> {quiz.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen size={11} /> {quiz.totalQuestions} Questions
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                          {quiz.subject}
                        </span>
                      </div>
                    </div>

                    {/* Right: arrow */}
                    <ChevronRight size={20} className="shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Telegram CTA */}
        {!loading && quizzes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 text-center"
          >
            <a
              href="https://t.me/+U98qAhiBLLg3ZWRl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition"
            >
              <Send size={15} /> Get Daily Quiz Alerts on Telegram
            </a>
          </motion.div>
        )}

      </div>
    </div>
  );
}
