import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  publishQuiz, fetchAllQuizzes,
  fetchQuizForEdit, toggleQuizPublished,
  fetchDailyAttemptsAll, fetchAllUserStats,
} from '../services/quizService';
import {
  LogIn, LogOut, Upload, Plus, Trash2, CheckCircle, AlertCircle,
  Loader2, ShieldAlert, Eye, EyeOff, Pencil, List, FilePlus, Download,
} from 'lucide-react';

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

const EMPTY_Q = { question: '', options: ['', '', '', ''], correct: 0 };

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseCsvOrJson(text) {
  try {
    const parsed = JSON.parse(text);
    const arr = Array.isArray(parsed) ? parsed : parsed.questions;
    if (!Array.isArray(arr)) throw new Error('JSON must be an array or { questions: [] }');
    return arr.map((q, i) => {
      if (!q.question) throw new Error(`Item ${i + 1}: missing "question"`);
      if (!Array.isArray(q.options) || q.options.length < 2) throw new Error(`Item ${i + 1}: "options" must have at least 2 items`);
      if (q.correct === undefined && q.answer === undefined) throw new Error(`Item ${i + 1}: missing "correct"`);
      return { question: q.question, options: q.options, correct: Number(q.correct ?? q.answer) };
    });
  } catch (jsonErr) {
    if (!text.includes(',')) throw new Error('Could not parse as JSON or CSV');
  }
  // RFC-4180 compliant parser — handles quoted fields with embedded newlines/commas
  const parseCSV = (raw) => {
    const rows = [];
    let col = '', cols = [], inQuote = false;
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (inQuote) {
        if (ch === '"' && raw[i + 1] === '"') { col += '"'; i++; }
        else if (ch === '"') inQuote = false;
        else col += ch;
      } else {
        if (ch === '"') { inQuote = true; }
        else if (ch === ',') { cols.push(col.trim()); col = ''; }
        else if (ch === '\n' || (ch === '\r' && raw[i + 1] === '\n')) {
          if (ch === '\r') i++;
          cols.push(col.trim()); col = '';
          if (cols.some(c => c !== '')) rows.push(cols);
          cols = [];
        } else col += ch;
      }
    }
    if (col || cols.length) { cols.push(col.trim()); if (cols.some(c => c !== '')) rows.push(cols); }
    return rows;
  };

  const rows = parseCSV(text);
  const start = rows[0]?.[0]?.toLowerCase().includes('question') ? 1 : 0;
  return rows.slice(start).map((cols, i) => {
    if (cols.length < 6) throw new Error(`CSV row ${i + 1 + start}: expected 6 columns, got ${cols.length}`);
    return { question: cols[0], options: [cols[1], cols[2], cols[3], cols[4]], correct: Number(cols[5]) };
  });
}

// ── Sub-components ───────────────────────────────────────────────────────────

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

// ── Main Component ───────────────────────────────────────────────────────────

export default function QuizAdmin() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // mode: 'create' | 'manage' | 'reports'
  const [mode, setMode] = useState('manage');

  // Create / Edit form state
  const [editingDate, setEditingDate] = useState(null); // null = creating new
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('General Studies');
  const [questions, setQuestions] = useState([{ ...EMPTY_Q, options: ['', '', '', ''] }]);

  // Manage list state
  const [quizList, setQuizList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [togglingDate, setTogglingDate] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(null);

  const [status, setStatus] = useState(null);
  const [publishing, setPublishing] = useState(false);

  // Reports state
  const [reportDate, setReportDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
  const [reportLoading, setReportLoading] = useState(null); // 'daily' | 'cumulative' | null

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAdmin(!!u && ADMIN_EMAILS.includes(u.email.toLowerCase()));
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Auto-load list when switching to manage mode
  useEffect(() => {
    if (mode === 'manage' && isAdmin) loadQuizList();
  }, [mode, isAdmin]);

  // ── Reports: Download CSV ──────────────────────────────────────────────────
  const downloadCSV = (filename, rows) => {
    const escape = (v) => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = rows.map(r => r.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = (filename, title, head, body) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text(title, 14, 15);
    autoTable(doc, {
      head: [head],
      body,
      startY: 22,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 255] },
    });
    doc.save(filename);
  };

  const handleDownloadDaily = async (format = 'csv') => {
    setReportLoading(`daily-${format}`);
    try {
      const attempts = await fetchDailyAttemptsAll(reportDate);
      if (!attempts.length) return setStatus({ type: 'error', msg: `No attempts found for ${reportDate}.` });
      const head = ['Rank', 'Name', 'Phone', 'Score', 'Correct', 'Incorrect', 'Skipped', 'Time (s)'];
      const body = attempts.map((a, i) => [i + 1, a.displayName, a.phone, a.score, a.correct, a.incorrect, a.skipped, a.timeTaken]);
      if (format === 'pdf') {
        const pdfHead = ['Rank', 'Name', 'Score', 'Correct', 'Incorrect', 'Skipped', 'Time (s)'];
        const pdfBody = attempts.map((a, i) => [i + 1, a.displayName, a.score, a.correct, a.incorrect, a.skipped, a.timeTaken]);
        downloadPDF(`leaderboard_${reportDate}.pdf`, `Daily Leaderboard — ${reportDate}`, pdfHead, pdfBody);
      } else {
        downloadCSV(`leaderboard_${reportDate}.csv`, [head, ...body]);
      }
      setStatus({ type: 'success', msg: `Downloaded ${attempts.length} entries for ${reportDate}.` });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setReportLoading(null);
    }
  };

  const handleDownloadCumulative = async (format = 'csv') => {
    setReportLoading(`cumulative-${format}`);
    try {
      const stats = await fetchAllUserStats();
      if (!stats.length) return setStatus({ type: 'error', msg: 'No cumulative data found.' });
      const head = ['Rank', 'Name', 'Phone', 'Total Score', 'Best Score', 'Quizzes Attempted', 'Last Attempt Date'];
      const body = stats.map((s, i) => [i + 1, s.displayName, s.phone, s.totalScore, s.bestScore, s.attemptCount, s.lastAttemptDate]);
      if (format === 'pdf') {
        const pdfHead = ['Rank', 'Name', 'Total Score', 'Best Score', 'Quizzes Attempted', 'Last Attempt Date'];
        const pdfBody = stats.map((s, i) => [i + 1, s.displayName, s.totalScore, s.bestScore, s.attemptCount, s.lastAttemptDate]);
        downloadPDF('cumulative_leaderboard.pdf', 'Cumulative Leaderboard — All Time', pdfHead, pdfBody);
      } else {
        downloadCSV('cumulative_leaderboard.csv', [head, ...body]);
      }
      setStatus({ type: 'success', msg: `Downloaded cumulative rankings for ${stats.length} students.` });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setReportLoading(null);
    }
  };

  const handleLogin = async () => {
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (e) { setStatus({ type: 'error', msg: e.message }); }
  };

  // ── Question CRUD ──────────────────────────────────────────────────────────
  const updateQuestion = (idx, field, value) =>
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  const addQuestion = () =>
    setQuestions(prev => [...prev, { ...EMPTY_Q, options: ['', '', '', ''] }]);
  const removeQuestion = (idx) =>
    setQuestions(prev => prev.filter((_, i) => i !== idx));

  // ── CSV / JSON upload ──────────────────────────────────────────────────────
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

  // ── Manage: Load all quizzes ───────────────────────────────────────────────
  const loadQuizList = async () => {
    setLoadingList(true);
    try {
      const list = await fetchAllQuizzes();
      setQuizList(list);
    } catch {
      setStatus({ type: 'error', msg: 'Failed to load quizzes.' });
    } finally {
      setLoadingList(false);
    }
  };

  // ── Manage: Toggle hide/show ───────────────────────────────────────────────
  const handleTogglePublish = async (date, current) => {
    setTogglingDate(date);
    try {
      await toggleQuizPublished(date, !current);
      setQuizList(prev => prev.map(q => q.date === date ? { ...q, published: !current } : q));
    } catch {
      setStatus({ type: 'error', msg: 'Failed to update quiz.' });
    } finally {
      setTogglingDate(null);
    }
  };

  // ── Manage: Load quiz into editor ──────────────────────────────────────────
  const handleEdit = async (quizDate) => {
    setLoadingEdit(quizDate);
    try {
      const data = await fetchQuizForEdit(quizDate);
      if (!data) return setStatus({ type: 'error', msg: 'Quiz not found.' });
      setDate(quizDate);
      setTitle(data.title || '');
      setSubject(data.subject || 'General Studies');
      setQuestions(data.questions);
      setEditingDate(quizDate);
      setStatus(null);
      setMode('create');
    } catch {
      setStatus({ type: 'error', msg: 'Failed to load quiz for editing.' });
    } finally {
      setLoadingEdit(null);
    }
  };

  // ── New quiz ───────────────────────────────────────────────────────────────
  const handleNewQuiz = () => {
    setEditingDate(null);
    setDate(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
    setTitle('');
    setSubject('General Studies');
    setQuestions([{ ...EMPTY_Q, options: ['', '', '', ''] }]);
    setStatus(null);
    setMode('create');
  };

  // ── Publish / Update ───────────────────────────────────────────────────────
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
      setStatus({ type: 'success', msg: `${editingDate ? 'Updated' : 'Published'} ${result.totalQuestions} questions for ${result.date}!` });
      setEditingDate(date);
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setPublishing(false);
    }
  };

  // ── Render: loading ────────────────────────────────────────────────────────
  if (authLoading) return (
    <div className="min-h-screen pt-28 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 size={36} className="animate-spin text-primary" />
    </div>
  );

  // ── Render: not logged in ──────────────────────────────────────────────────
  if (!user) return (
    <div className="min-h-screen pt-28 flex flex-col items-center justify-center gap-6 bg-slate-50 dark:bg-slate-950 p-4 text-center">
      <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
        <ShieldAlert size={28} className="text-white" />
      </div>
      <h1 className="text-2xl font-black text-slate-900 dark:text-white">Quiz Admin</h1>
      <p className="text-slate-500 max-w-xs text-sm">Sign in with your admin Google account to manage quizzes.</p>
      <button onClick={handleLogin} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 shadow-sm hover:shadow-md transition">
        <LogIn size={18} /> Sign in with Google
      </button>
      {status?.type === 'error' && <p className="text-red-500 text-sm">{status.msg}</p>}
    </div>
  );

  // ── Render: not admin ──────────────────────────────────────────────────────
  if (!isAdmin) return (
    <div className="min-h-screen pt-28 flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 text-center">
      <AlertCircle size={48} className="text-red-400" />
      <h2 className="text-xl font-black text-slate-800 dark:text-white">Access Denied</h2>
      <p className="text-slate-500 text-sm">{user.email} is not in the admin list.</p>
      <button onClick={() => signOut(auth)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-200 dark:bg-slate-800 rounded-xl font-bold text-sm">
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );

  // ── Render: admin panel ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="container mx-auto px-4 max-w-3xl">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Quiz Admin</h1>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          </div>
          <button onClick={() => signOut(auth)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-500 hover:text-red-500 border border-slate-200 dark:border-slate-700 rounded-xl transition">
            <LogOut size={15} /> Sign Out
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8">
          <button
            onClick={() => setMode('manage')}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${mode === 'manage' ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' : 'text-slate-400'}`}
          >
            <List size={13} /> Manage
          </button>
          <button
            onClick={handleNewQuiz}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${mode === 'create' ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' : 'text-slate-400'}`}
          >
            <FilePlus size={13} /> {editingDate ? 'Edit Quiz' : 'New Quiz'}
          </button>
          <button
            onClick={() => { setMode('reports'); setStatus(null); }}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${mode === 'reports' ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' : 'text-slate-400'}`}
          >
            <Download size={13} /> Reports
          </button>
        </div>

        {/* ── MANAGE MODE ─────────────────────────────────────────────────── */}
        {mode === 'manage' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-black text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">All Quizzes</h2>
              <button onClick={loadQuizList} disabled={loadingList} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary/50 hover:text-primary transition">
                {loadingList ? <Loader2 size={12} className="animate-spin" /> : '↻'} Refresh
              </button>
            </div>

            {loadingList ? (
              <div className="py-16 flex justify-center"><Loader2 size={28} className="animate-spin text-primary/40" /></div>
            ) : quizList.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-slate-400 font-medium">No quizzes found.</p>
                <button onClick={handleNewQuiz} className="mt-3 text-xs font-bold text-primary hover:underline">Create your first quiz →</button>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {quizList.map((quiz) => (
                  <div key={quiz.date} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{quiz.title || 'Untitled'}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {quiz.date} · {quiz.totalQuestions} questions · {quiz.subject}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(quiz.date)}
                        disabled={loadingEdit === quiz.date}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary/50 hover:text-primary transition"
                      >
                        {loadingEdit === quiz.date ? <Loader2 size={12} className="animate-spin" /> : <Pencil size={12} />}
                        Edit
                      </button>

                      {/* Hide / Show toggle */}
                      <button
                        onClick={() => handleTogglePublish(quiz.date, quiz.published)}
                        disabled={togglingDate === quiz.date}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition border ${
                          quiz.published
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                            : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                        }`}
                      >
                        {togglingDate === quiz.date
                          ? <Loader2 size={12} className="animate-spin" />
                          : quiz.published ? <><Eye size={12} /> Visible</> : <><EyeOff size={12} /> Hidden</>
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── REPORTS MODE ────────────────────────────────────────────────── */}
        {mode === 'reports' && (
          <div className="flex flex-col gap-5">

            {/* Status */}
            {status && (
              <div className={`flex items-center gap-2 p-4 rounded-xl text-sm font-medium border ${status.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 text-emerald-700' : 'bg-red-50 dark:bg-red-900/20 border-red-200 text-red-600'}`}>
                {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {status.msg}
              </div>
            )}

            {/* Daily leaderboard */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
              <h2 className="font-black text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider mb-1">Daily Leaderboard</h2>
              <p className="text-xs text-slate-400 mb-4">Download all students' results for a specific quiz date — Rank, Name, Phone, Score.</p>
              <div className="flex gap-3 items-end flex-wrap">
                <div className="flex-1 min-w-[160px]">
                  <label className="text-xs font-bold text-slate-400 mb-1 block">Quiz Date</label>
                  <input
                    type="date" value={reportDate}
                    onChange={e => setReportDate(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <button
                  onClick={() => handleDownloadDaily('csv')}
                  disabled={!!reportLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-primary text-white rounded-xl text-sm font-black shadow-sm disabled:opacity-60 transition"
                >
                  {reportLoading === 'daily-csv' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  CSV
                </button>
                <button
                  onClick={() => handleDownloadDaily('pdf')}
                  disabled={!!reportLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl text-sm font-black shadow-sm disabled:opacity-60 transition"
                >
                  {reportLoading === 'daily-pdf' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  PDF
                </button>
              </div>
            </div>

            {/* Cumulative leaderboard */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
              <h2 className="font-black text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider mb-1">Cumulative Leaderboard</h2>
              <p className="text-xs text-slate-400 mb-4">Download all-time rankings across every quiz — Rank, Name, Phone, Total Score, Best Score, Quizzes Attempted.</p>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => handleDownloadCumulative('csv')}
                  disabled={!!reportLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-black shadow-sm disabled:opacity-60 transition"
                >
                  {reportLoading === 'cumulative-csv' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  CSV
                </button>
                <button
                  onClick={() => handleDownloadCumulative('pdf')}
                  disabled={!!reportLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl text-sm font-black shadow-sm disabled:opacity-60 transition"
                >
                  {reportLoading === 'cumulative-pdf' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  PDF
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ── CREATE / EDIT MODE ──────────────────────────────────────────── */}
        {mode === 'create' && (
          <>
            {/* Edit banner */}
            {editingDate && (
              <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl mb-6 text-sm font-bold text-amber-700 dark:text-amber-400">
                <Pencil size={14} /> Editing quiz for {editingDate} — changes will overwrite the existing quiz.
              </div>
            )}

            {/* Meta */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-6 flex flex-col gap-4">
              <h2 className="font-black text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider">Quiz Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1 block">Date</label>
                  <input
                    type="date" value={date}
                    onChange={e => setDate(e.target.value)}
                    disabled={!!editingDate}
                    className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-800 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
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
              <span className="text-xs text-slate-400">or edit questions below</span>
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
              <div className={`flex items-center gap-2 p-4 rounded-xl mb-5 text-sm font-medium border ${status.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 text-emerald-700' : 'bg-red-50 dark:bg-red-900/20 border-red-200 text-red-600'}`}>
                {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                {status.msg}
              </div>
            )}

            {/* Publish / Update */}
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-black text-base shadow-lg shadow-purple-500/20 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {publishing
                ? <><Loader2 size={20} className="animate-spin" /> {editingDate ? 'Updating…' : 'Publishing…'}</>
                : <><Upload size={20} /> {editingDate ? 'Update Quiz' : 'Publish Quiz'}</>
              }
            </button>
          </>
        )}

      </div>
    </div>
  );
}
