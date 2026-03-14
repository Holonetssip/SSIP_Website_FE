import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { publishQuiz } from '../services/quizService';
import { LogIn, LogOut, Upload, Plus, Trash2, CheckCircle, AlertCircle, Loader2, ShieldAlert } from 'lucide-react';

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

const EMPTY_Q = { question: '', options: ['', '', '', ''], correct: 0 };

// ── Helpers ────────────────────────────────────────────────────────────────

function parseCsvOrJson(text) {
  // Try JSON first
  try {
    const parsed = JSON.parse(text);
    const arr = Array.isArray(parsed) ? parsed : parsed.questions;
    if (!Array.isArray(arr)) throw new Error('JSON must be an array or { questions: [] }');
    return arr.map((q, i) => {
      if (!q.question) throw new Error(`Item ${i + 1}: missing "question"`);
      if (!Array.isArray(q.options) || q.options.length < 2) throw new Error(`Item ${i + 1}: "options" must be an array with at least 2 items`);
      if (q.correct === undefined && q.answer === undefined) throw new Error(`Item ${i + 1}: missing "correct" (0-based index)`);
      return {
        question: q.question,
        options: q.options,
        correct: Number(q.correct ?? q.answer),
      };
    });
  } catch (jsonErr) {
    if (!text.includes(',')) throw new Error('Could not parse as JSON or CSV');
  }

  // Try CSV: question,opt1,opt2,opt3,opt4,correct_index
  const lines = text.trim().split('\n').filter(Boolean);
  // skip header if first line looks like a header
  const start = lines[0].toLowerCase().includes('question') ? 1 : 0;
  return lines.slice(start).map((line, i) => {
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 6) throw new Error(`CSV row ${i + 1 + start}: expected 6 columns (question, opt1, opt2, opt3, opt4, correct_index)`);
    return {
      question: cols[0],
      options: [cols[1], cols[2], cols[3], cols[4]],
      correct: Number(cols[5]),
    };
  });
}

// ── Sub-components ──────────────────────────────────────────────────────────

function QuestionEditor({ q, idx, onChange, onRemove, total }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Q{idx + 1}</span>
        {total > 1 && (
          <button onClick={() => onRemove(idx)} className="text-red-400 hover:text-red-600 transition">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <textarea
        rows={2}
        placeholder="Question text…"
        value={q.question}
        onChange={e => onChange(idx, 'question', e.target.value)}
        className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-800 dark:text-slate-200"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {q.options.map((opt, oi) => (
          <div key={oi} className="flex items-center gap-2">
            <input
              type="radio"
              name={`correct-${idx}`}
              checked={q.correct === oi}
              onChange={() => onChange(idx, 'correct', oi)}
              className="accent-primary shrink-0"
            />
            <input
              type="text"
              placeholder={`Option ${oi + 1}`}
              value={opt}
              onChange={e => {
                const opts = [...q.options];
                opts[oi] = e.target.value;
                onChange(idx, 'options', opts);
              }}
              className={`flex-1 text-sm rounded-xl border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 ${q.correct === oi ? 'border-primary/60 bg-primary/5' : 'border-slate-200 dark:border-slate-700'}`}
            />
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400">Select the radio button next to the correct answer.</p>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function QuizAdmin() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('General Studies');
  const [questions, setQuestions] = useState([{ ...EMPTY_Q, options: ['', '', '', ''] }]);

  const [status, setStatus] = useState(null); // { type: 'success'|'error', msg }
  const [publishing, setPublishing] = useState(false);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAdmin(!!u && ADMIN_EMAILS.includes(u.email.toLowerCase()));
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      setStatus({ type: 'error', msg: e.message });
    }
  };

  const handleLogout = () => signOut(auth);

  // Question CRUD
  const updateQuestion = (idx, field, value) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const addQuestion = () => setQuestions(prev => [...prev, { ...EMPTY_Q, options: ['', '', '', ''] }]);

  const removeQuestion = (idx) => setQuestions(prev => prev.filter((_, i) => i !== idx));

  // CSV/JSON upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseCsvOrJson(ev.target.result);
        setQuestions(parsed);
        setStatus({ type: 'success', msg: `Loaded ${parsed.length} questions from file.` });
      } catch (err) {
        setStatus({ type: 'error', msg: err.message });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Publish
  const handlePublish = async () => {
    if (!date) return setStatus({ type: 'error', msg: 'Please set a date.' });
    if (!title.trim()) return setStatus({ type: 'error', msg: 'Please set a quiz title.' });
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return setStatus({ type: 'error', msg: `Q${i + 1}: question text is empty.` });
      if (q.options.some(o => !o.trim())) return setStatus({ type: 'error', msg: `Q${i + 1}: all 4 options must be filled.` });
    }

    setPublishing(true);
    setStatus(null);
    try {
      const result = await publishQuiz(date, { title, subject }, questions);
      setStatus({ type: 'success', msg: `Published ${result.totalQuestions} questions for ${result.date}!` });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setPublishing(false);
    }
  };

  // ── Render: loading ──
  if (authLoading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 size={36} className="animate-spin text-primary" />
      </div>
    );
  }

  // ── Render: not logged in ──
  if (!user) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center gap-6 bg-slate-50 dark:bg-slate-950 p-4 text-center">
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <ShieldAlert size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Quiz Admin</h1>
        <p className="text-slate-500 max-w-xs text-sm">Sign in with your admin Google account to manage quizzes.</p>
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 shadow-sm hover:shadow-md transition"
        >
          <LogIn size={18} /> Sign in with Google
        </button>
        {status?.type === 'error' && <p className="text-red-500 text-sm">{status.msg}</p>}
      </div>
    );
  }

  // ── Render: not admin ──
  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 text-center">
        <AlertCircle size={48} className="text-red-400" />
        <h2 className="text-xl font-black text-slate-800 dark:text-white">Access Denied</h2>
        <p className="text-slate-500 text-sm">{user.email} is not in the admin list.</p>
        <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 bg-slate-200 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    );
  }

  // ── Render: admin panel ──
  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="container mx-auto px-4 max-w-3xl">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Quiz Admin</h1>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-500 hover:text-red-500 border border-slate-200 dark:border-slate-700 rounded-xl transition">
            <LogOut size={15} /> Sign Out
          </button>
        </div>

        {/* Meta */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-6 flex flex-col gap-4">
          <h2 className="font-black text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider">Quiz Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1 block">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-800 dark:text-slate-200" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1 block">Subject</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. General Studies"
                className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-800 dark:text-slate-200" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-400 mb-1 block">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={`Daily Quiz — ${date}`}
                className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-800 dark:text-slate-200" />
            </div>
          </div>
        </div>

        {/* Upload strip */}
        <div className="flex items-center gap-3 mb-5">
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-primary/50 transition shadow-sm">
            <Upload size={16} /> Upload CSV / JSON
            <input type="file" accept=".csv,.json,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
          <span className="text-xs text-slate-400">or add questions manually below</span>
        </div>

        {/* Questions */}
        <div className="flex flex-col gap-4 mb-6">
          {questions.map((q, idx) => (
            <QuestionEditor key={idx} q={q} idx={idx} onChange={updateQuestion} onRemove={removeQuestion} total={questions.length} />
          ))}
        </div>

        <button onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-500 hover:border-primary/50 hover:text-primary flex items-center justify-center gap-2 transition mb-8">
          <Plus size={16} /> Add Question
        </button>

        {/* Status */}
        {status && (
          <div className={`flex items-center gap-2 p-4 rounded-xl mb-5 text-sm font-medium border ${status.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'}`}>
            {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {status.msg}
          </div>
        )}

        {/* Publish */}
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-black text-base shadow-lg shadow-purple-500/20 transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {publishing ? <><Loader2 size={20} className="animate-spin" /> Publishing…</> : <><Upload size={20} /> Publish Quiz</>}
        </button>

      </div>
    </div>
  );
}
