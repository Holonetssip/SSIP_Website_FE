import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Check, Award, AlertTriangle,
  User, Loader2, RotateCcw, Calculator,
} from 'lucide-react';
import {
  fetchAnswerKeys, calculateScore, saveUpscAttempt, PAPER_CONFIG,
} from '../services/upscService';

const SETS = ['A', 'B', 'C', 'D'];
const OPTIONS = ['A', 'B', 'C', 'D'];
const PAGE_SIZE = 20;

export default function UPSCCalculator() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [paper, setPaper] = useState('gs');
  const [set, setSet] = useState('A');
  const [answers, setAnswers] = useState([]);
  const [page, setPage] = useState(0);
  const [keys, setKeys] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const config = PAPER_CONFIG[paper];
  const totalQ = config.questions;
  const totalPages = Math.ceil(totalQ / PAGE_SIZE);
  const answered = answers.filter(a => a !== '').length;

  useEffect(() => {
    setAnswers(new Array(PAPER_CONFIG[paper].questions).fill(''));
  }, [paper]);

  const handleStart = async () => {
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!rollNo.trim()) { setError('Please enter your roll number.'); return; }
    setError('');
    setLoading(true);
    try {
      const fetched = await fetchAnswerKeys(paper, set);
      setKeys(fetched);
    } catch {
      setKeys([]);
    } finally {
      setAnswers(new Array(totalQ).fill(''));
      setPage(0);
      setStep(2);
      setLoading(false);
    }
  };

  const handleAnswer = (qi, opt) => {
    setAnswers(prev => {
      const next = [...prev];
      next[qi] = next[qi] === opt ? '' : opt;
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const coachingScores = {};
      const resultsArr = keys.map(key => {
        const r = calculateScore(answers, key.answers, paper);
        coachingScores[key.coachingName] = r;
        return { coachingName: key.coachingName, ...r };
      });
      resultsArr.sort((a, b) => b.score - a.score);
      setResults(resultsArr);
      await saveUpscAttempt(name, rollNo, paper, set, answers, coachingScores);
      setStep(3);
    } catch {
      setError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep(1);
    setResults([]);
    setAnswers([]);
    setError('');
  };

  const pageStart = page * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, totalQ);
  const pageQs = Array.from({ length: pageEnd - pageStart }, (_, i) => pageStart + i);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full text-sm font-medium mb-3">
            <Calculator size={15} /> UPSC Prelims 2026
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
            Marks Calculator
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Compare your score across multiple coaching institutes
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Your Info', 'Mark Answers', 'Results'].map((label, i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition ${step === i + 1 ? 'bg-indigo-600 text-white' : step > i + 1 ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                {step > i + 1 ? <Check size={12} /> : <span>{i + 1}</span>}
                {label}
              </div>
              {i < 2 && <div className="w-6 h-px bg-slate-300 dark:bg-slate-700" />}
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 1: Info ── */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 md:p-8 max-w-lg mx-auto"
          >
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <User size={18} className="text-indigo-500" /> Enter Your Details
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleStart()}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Roll Number</label>
                <input
                  value={rollNo} onChange={e => setRollNo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleStart()}
                  placeholder="Enter your roll number"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Paper</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'gs', label: 'GS Paper 1', sub: '100 Questions' },
                    { value: 'csat', label: 'CSAT Paper 2', sub: '80 Questions' },
                  ].map(p => (
                    <button key={p.value} onClick={() => setPaper(p.value)}
                      className={`p-3 rounded-xl border-2 text-left transition ${paper === p.value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}
                    >
                      <div className="font-bold text-sm text-slate-800 dark:text-white">{p.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{p.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Question Set</label>
                <div className="grid grid-cols-4 gap-2">
                  {SETS.map(s => (
                    <button key={s} onClick={() => setSet(s)}
                      className={`py-2.5 rounded-xl font-bold text-sm transition ${set === s ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'}`}
                    >
                      Set {s}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleStart} disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              >
                {loading
                  ? <><Loader2 size={17} className="animate-spin" /> Loading keys...</>
                  : <>Start Entering Answers <ChevronRight size={17} /></>
                }
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Answers ── */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* Header info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 mb-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Select the options (A/B/C/D) for each question
                </p>
                <span className="text-xs text-slate-500">{config.name} · Set {set}</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">Each set contains the same questions in a different order</p>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{answered} of {totalQ} questions answered</span>
                <span>{Math.round((answered / totalQ) * 100)}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${(answered / totalQ) * 100}%` }}
                />
              </div>
            </div>

            {/* No keys warning */}
            {keys.length === 0 && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl text-sm flex items-center gap-2">
                <AlertTriangle size={16} />
                No answer keys uploaded for {config.name} Set {set} yet. Fill your answers — scores will appear once admin uploads keys.
              </div>
            )}

            {/* Page tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {Array.from({ length: totalPages }, (_, i) => {
                const s = i * PAGE_SIZE;
                const e = Math.min(s + PAGE_SIZE, totalQ);
                const done = answers.slice(s, e).filter(a => a !== '').length === (e - s);
                return (
                  <button key={i} onClick={() => setPage(i)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition flex items-center gap-1 ${page === i ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-sm border border-slate-200 dark:border-slate-700'}`}
                  >
                    {s + 1}–{e}
                    {done && <Check size={12} className={page === i ? 'text-white' : 'text-green-500'} />}
                  </button>
                );
              })}
            </div>

            {/* Question grid — 2 columns */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {pageQs.map(qi => (
                  <div key={qi} className="flex items-center gap-3">
                    <span className="w-7 text-sm font-semibold text-slate-500 text-right shrink-0 tabular-nums">
                      {qi + 1}.
                    </span>
                    <div className="flex gap-2">
                      {OPTIONS.map(opt => (
                        <button key={opt} onClick={() => handleAnswer(qi, opt)}
                          className={`w-10 h-10 rounded-full font-bold text-sm transition-all border-2 ${answers[qi] === opt
                            ? 'bg-indigo-500 border-indigo-500 text-white shadow'
                            : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-500'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Nav buttons */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 transition"
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                <button onClick={() => setAnswers(new Array(totalQ).fill(''))}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition px-2 py-1 rounded-lg"
                >
                  <RotateCcw size={12} /> Clear all
                </button>

                {page < totalPages - 1 ? (
                  <button onClick={() => setPage(p => p + 1)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={submitting || keys.length === 0}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition disabled:opacity-50"
                  >
                    {submitting
                      ? <><Loader2 size={16} className="animate-spin" /> Calculating...</>
                      : <><Check size={16} /> Submit & Calculate</>
                    }
                  </button>
                )}
              </div>

              {error && (
                <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Results ── */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

            {/* Summary card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Award size={20} className="text-indigo-500" /> Your Results
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {name} · Roll {rollNo} · {config.name} · Set {set}
                  </p>
                </div>
                <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 px-3 py-1 rounded-full">
                  {results.length} key{results.length !== 1 ? 's' : ''} compared
                </span>
              </div>

              {/* CSAT qualifying banner */}
              {paper === 'csat' && results.length > 0 && (
                <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                  results[0].score >= 66.67
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                }`}>
                  {results[0].score >= 66.67
                    ? <><Check size={16} /> Likely QUALIFYING — best key score {results[0].score} ≥ 66.67</>
                    : <><AlertTriangle size={16} /> Likely NOT QUALIFYING — best key score {results[0].score} &lt; 66.67</>
                  }
                </div>
              )}

              {/* Comparison table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-2.5 px-3 text-slate-500 font-semibold text-xs uppercase tracking-wide">#</th>
                      <th className="text-left py-2.5 px-3 text-slate-500 font-semibold text-xs uppercase tracking-wide">Coaching</th>
                      <th className="text-right py-2.5 px-3 text-slate-500 font-semibold text-xs uppercase tracking-wide">Score</th>
                      <th className="text-right py-2.5 px-3 text-slate-500 font-semibold text-xs uppercase tracking-wide">Correct</th>
                      <th className="text-right py-2.5 px-3 text-slate-500 font-semibold text-xs uppercase tracking-wide">Wrong</th>
                      <th className="text-right py-2.5 px-3 text-slate-500 font-semibold text-xs uppercase tracking-wide">Skipped</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={r.coachingName}
                        className={`border-b border-slate-100 dark:border-slate-700/50 transition ${
                          i === 0 ? 'bg-green-50 dark:bg-green-900/10' :
                          i === results.length - 1 && results.length > 1 ? 'bg-red-50/50 dark:bg-red-900/5' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-bold text-slate-400 text-xs">{i + 1}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-800 dark:text-white">{r.coachingName}</span>
                          {i === 0 && results.length > 1 && (
                            <span className="ml-2 text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full">highest</span>
                          )}
                        </td>
                        <td className={`py-3 px-3 text-right font-bold text-base ${
                          i === 0 ? 'text-green-600 dark:text-green-400' :
                          i === results.length - 1 && results.length > 1 ? 'text-red-500' :
                          'text-slate-700 dark:text-slate-300'
                        }`}>
                          {r.score}
                        </td>
                        <td className="py-3 px-3 text-right text-green-600 dark:text-green-400 font-medium">{r.correct}</td>
                        <td className="py-3 px-3 text-right text-red-500 font-medium">{r.wrong}</td>
                        <td className="py-3 px-3 text-right text-slate-400">{r.skipped}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                Scoring: {paper === 'gs' ? '+2 correct, −0.67 wrong, 0 skipped' : '+2.5 correct, −0.83 wrong, 0 skipped'}
                {paper === 'csat' && ' · Qualifying mark: 66.67'}
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={reset}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition"
              >
                <RotateCcw size={16} /> Try Another Paper
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
