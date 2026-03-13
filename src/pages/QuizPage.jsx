import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BrainCircuit, Send, ArrowLeft, 
  Sparkles, Target, Award, Timer 
} from 'lucide-react';

// --- FLOATING ICON COMPONENT ---
const FloatingIcon = ({ icon: Icon, colorClass, delay, duration, className }) => (
  <motion.div
    animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
    transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    className={`absolute hidden md:flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 shadow-xl transform-gpu ${className}`}
  >
    <Icon className={colorClass} size={24} />
  </motion.div>
);

export default function QuizPage() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-32 md:pt-40 pb-20 bg-slate-50 dark:bg-slate-950 font-sans relative overflow-hidden w-full flex flex-col items-center justify-center">
      
      {/* --- AMBIENT BACKGROUND --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
        
        {/* Animated Glows */}
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[10%] left-[-10%] w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-blue-600/20 dark:bg-blue-500/10 rounded-full blur-[100px] transform-gpu" />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-[10%] right-[-10%] w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-purple-600/20 dark:bg-purple-500/10 rounded-full blur-[100px] transform-gpu" />
      </div>

      <div className="container mx-auto px-4 relative z-10 w-full max-w-3xl flex justify-center">
        
        {/* --- FLOATING ORNAMENTS (Desktop Only) --- */}
        <FloatingIcon icon={Target} colorClass="text-rose-500" delay={0} duration={6} className="-top-8 left-4 lg:-left-8" />
        <FloatingIcon icon={Award} colorClass="text-yellow-500" delay={1.5} duration={7} className="top-16 -right-2 lg:-right-10" />
        <FloatingIcon icon={Timer} colorClass="text-emerald-500" delay={3} duration={5} className="-bottom-8 left-12 lg:left-4" />

        {/* --- CENTRAL GLASSMORPHIC CARD --- */}
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-slate-700/60 shadow-2xl rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden"
        >
          {/* Shine effect across the card */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 pointer-events-none rounded-[2.5rem]"></div>

          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold text-[10px] sm:text-xs mb-6 shadow-sm relative z-10"
          >
            <Sparkles size={14} className="animate-pulse" /> Daily Quiz Vault
          </motion.div>

          {/* Main Icon */}
          <div className="relative w-20 sm:w-24 h-20 sm:h-24 mx-auto mb-6 relative z-10 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-[3px] border-dashed border-purple-400/50 dark:border-purple-500/50 rounded-full"
            />
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 sm:w-16 h-14 sm:h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30"
            >
              <BrainCircuit size={28} className="text-white sm:w-[32px] sm:h-[32px]" />
            </motion.div>
          </div>

          {/* Text Content */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter leading-tight relative z-10">
            Coming <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Soon</span>
          </h1>
          
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto font-medium mb-8 relative z-10 leading-relaxed">
            We are crafting highly curated, syllabus-aligned mock quizzes for your preparation. Stay tuned!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center relative z-10">
            {/* --- UPDATED TELEGRAM LINK HERE --- */}
            <a 
              href="https://t.me/+U98qAhiBLLg3ZWRl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-[0_8px_20px_rgba(124,58,237,0.25)] hover:shadow-[0_8px_25px_rgba(124,58,237,0.4)] transition-all flex items-center justify-center gap-2 transform-gpu active:scale-95 text-xs sm:text-sm"
            >
              <Send size={16} /> Notify Me on Telegram
            </a>
            
            <Link 
              to="/" 
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center justify-center gap-2 transform-gpu active:scale-95 text-xs sm:text-sm"
            >
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
}