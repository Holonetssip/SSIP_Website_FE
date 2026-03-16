import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, TrendingUp, Loader2, Target } from 'lucide-react';
import { fetchCumulativeLeaderboard } from '../services/quizService';

const rankMedal = (i) => ['🥇', '🥈', '🥉'][i] ?? null;

export default function GlobalLeaderboard() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCumulativeLeaderboard(50).then(setList).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#f8fafc] dark:bg-slate-950 px-4">
      <div className="max-w-2xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] uppercase tracking-widest mb-4">
            <Star size={11} className="fill-primary" /> All-Time Rankings
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Overall Leaderboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Cumulative scores across all daily quizzes</p>
        </motion.div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary/40" />
          </div>
        )}

        {!loading && list.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-100 dark:border-slate-800">
            <Target size={32} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No data yet</p>
          </div>
        )}

        {!loading && list.length > 0 && (
          <>
            {/* Top 3 podium */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {list.slice(0, 3).map((entry, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className={`relative p-4 rounded-[2rem] border text-center overflow-hidden ${i === 0 ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105 z-10' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                  <div className="text-2xl mb-2">{rankMedal(i)}</div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black mx-auto mb-2 ${i === 0 ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-primary'}`}>
                    {entry.displayName.charAt(0).toUpperCase()}
                  </div>
                  <p className={`font-bold text-xs truncate mb-3 ${i === 0 ? 'text-white' : 'dark:text-white'}`}>{entry.displayName}</p>
                  <p className={`text-[9px] uppercase font-bold ${i === 0 ? 'text-white/60' : 'text-slate-400'}`}>Total</p>
                  <p className="text-xl font-black">{entry.totalScore}</p>
                  <p className={`text-[9px] mt-1 font-bold ${i === 0 ? 'text-white/50' : 'text-slate-400'}`}>{entry.attemptCount} quiz{entry.attemptCount !== 1 ? 'zes' : ''}</p>
                </motion.div>
              ))}
            </div>

            {/* Full list */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <TrendingUp size={12} className="text-primary" /> Full Rankings
                </p>
                <p className="text-[10px] text-slate-400 font-bold">{list.length} students</p>
              </div>
              {list.map((entry, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                  <div className="w-8 shrink-0 text-center">
                    {rankMedal(i) ? <span className="text-lg">{rankMedal(i)}</span> : <span className="text-[11px] font-black text-slate-300 dark:text-slate-600">#{i + 1}</span>}
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-500 shrink-0">
                    {entry.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[13px] dark:text-white truncate">{entry.displayName}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{entry.attemptCount} quiz{entry.attemptCount !== 1 ? 'zes' : ''} · Best {entry.bestScore}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <Zap size={10} className="text-amber-500 fill-amber-500" />
                      <span className="font-black text-[14px] dark:text-white">{entry.totalScore}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">total pts</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
