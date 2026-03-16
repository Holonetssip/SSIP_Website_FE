import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, TrendingUp, Loader2, Target, Medal, Phone, User } from 'lucide-react';
import { fetchCumulativeLeaderboard, fetchUserCumulativeRank } from '../services/quizService';

const rankMedal = (i) => ['🥇', '🥈', '🥉'][i] ?? null;

export default function GlobalLeaderboard() {
  const [user, setUser] = useState(null);       // { name, phone }
  const [form, setForm] = useState({ name: '', phone: '' });

  const [list, setList] = useState([]);
  const [userRank, setUserRank] = useState(null); // { rank, total, totalScore }
  const [loading, setLoading] = useState(false);

  const isCurrentUser = (entry) => entry.phone === user?.phone;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.phone)) return alert('Please enter a valid 10-digit mobile number.');
    const normalizedName = form.name.trim().replace(/\b\w/g, c => c.toUpperCase());
    setLoading(true);
    try {
      const [lb, statsSnap] = await Promise.all([
        fetchCumulativeLeaderboard(50),
        import('firebase/firestore').then(({ getDoc, doc }) =>
          import('../services/firebase').then(({ db }) =>
            getDoc(doc(db, 'userStats', form.phone))
          )
        ),
      ]);
      setList(lb);
      const stats = statsSnap.exists() ? statsSnap.data() : null;
      const myTotalScore = stats?.totalScore ?? 0;
      const rank = await fetchUserCumulativeRank(form.phone, myTotalScore);
      setUserRank({ ...rank, totalScore: myTotalScore });
      setUser({ name: normalizedName, phone: form.phone });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50 dark:bg-slate-950 flex justify-center items-center px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-7 rounded-[2rem] shadow-2xl border border-white dark:border-slate-800 relative z-10">
          <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <TrendingUp size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-black text-center text-slate-900 dark:text-white mb-1">Overall Rankings</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-xs font-medium">Enter your details to see your rank among all students.</p>
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div className="relative">
              <User size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400" />
              <input type="text" required placeholder="Display Name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none text-xs dark:text-white" />
            </div>
            <div className="relative">
              <Phone size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400" />
              <input type="tel" required placeholder="Mobile Number" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none text-xs dark:text-white" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-xs shadow-lg active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><TrendingUp size={14} /> View My Ranking</>}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ── Leaderboard screen ──────────────────────────────────────────────────────
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

        {list.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-100 dark:border-slate-800">
            <Target size={32} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No data yet</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {list.slice(0, 3).map((entry, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className={`relative p-4 rounded-[2rem] border text-center overflow-hidden ${i === 0 ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105 z-10' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                  {isCurrentUser(entry) && (
                    <div className="absolute top-2 left-2 text-[8px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-black uppercase">You</div>
                  )}
                  <div className="text-2xl mb-2">{rankMedal(i)}</div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black mx-auto mb-2 ${isCurrentUser(entry) ? 'bg-white/30 ring-2 ring-white' : i === 0 ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-primary'}`}>
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
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm mb-4">
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <TrendingUp size={12} className="text-primary" /> Full Rankings
                </p>
                <p className="text-[10px] text-slate-400 font-bold">{userRank?.total ?? list.length} students</p>
              </div>
              {list.map((entry, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                  className={`flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 dark:border-slate-800/50 last:border-0 transition ${isCurrentUser(entry) ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
                  <div className="w-8 shrink-0 text-center">
                    {rankMedal(i) ? <span className="text-lg">{rankMedal(i)}</span> : <span className="text-[11px] font-black text-slate-300 dark:text-slate-600">#{i + 1}</span>}
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${isCurrentUser(entry) ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {entry.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[13px] dark:text-white truncate flex items-center gap-1.5">
                      {entry.displayName}
                      {isCurrentUser(entry) && <span className="text-[8px] bg-primary text-white px-1.5 py-0.5 rounded-full font-black uppercase">You</span>}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">{entry.attemptCount} quiz{entry.attemptCount !== 1 ? 'zes' : ''} · Best {entry.bestScore}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <Zap size={10} className="text-amber-500 fill-amber-500" />
                      <span className={`font-black text-[14px] ${isCurrentUser(entry) ? 'text-primary' : 'dark:text-white'}`}>{entry.totalScore}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">total pts</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Your Position card */}
            {userRank && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="p-5 rounded-3xl border-2 border-primary bg-white dark:bg-slate-900 shadow-lg shadow-primary/10">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <Medal size={12} className="text-primary" /> Your Position
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex flex-col items-center justify-center shrink-0 border border-primary/20">
                    <span className="text-[9px] font-black text-primary/50 uppercase leading-none">Rank</span>
                    <span className="text-3xl font-black text-primary leading-tight">#{userRank.rank}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-sm dark:text-white truncate">{user.name}</h4>
                    <p className="text-[12px] text-slate-500 font-medium mt-1">
                      <span className="font-black text-primary">#{userRank.rank}</span> out of <span className="font-black text-slate-700 dark:text-slate-200">{userRank.total}</span> registered students
                    </p>
                    {list.some(isCurrentUser) && (
                      <p className="text-[10px] text-emerald-600 font-black uppercase mt-1 flex items-center gap-1">
                        <Star size={9} className="fill-emerald-500 text-emerald-500" /> You're in Top {list.length}!
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Total</p>
                    <p className="text-2xl font-black text-primary">{userRank.totalScore}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
