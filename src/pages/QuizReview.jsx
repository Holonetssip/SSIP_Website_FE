import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, BookOpen, ChevronLeft, Loader2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { fetchQuiz } from '../services/quizService';

let devanagariFontBase64 = null;
async function loadDevanagariFont() {
  if (devanagariFontBase64) return devanagariFontBase64;
  const res = await fetch('/fonts/NotoSansDevanagari.ttf');
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  devanagariFontBase64 = btoa(binary);
  return devanagariFontBase64;
}

export default function QuizReview() {
  const [searchParams] = useSearchParams();
  const date = searchParams.get('date');

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!quiz || downloading) return;
    setDownloading(true);
    try {
      const fontBase64 = await loadDevanagariFont();

      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      doc.addFileToVFS('NotoSansDevanagari.ttf', fontBase64);
      doc.addFont('NotoSansDevanagari.ttf', 'Noto', 'normal');
      doc.addFont('NotoSansDevanagari.ttf', 'Noto', 'bold');
      doc.setFont('Noto', 'normal');

      const marginX = 15;
      const marginTop = 20;
      const marginBottom = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - marginX * 2;
      let y = marginTop;

      const ensureSpace = (needed) => {
        if (y + needed > pageHeight - marginBottom) {
          doc.addPage();
          y = marginTop;
        }
      };

      doc.setFont('Noto', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      const titleLines = doc.splitTextToSize(quiz.title, contentWidth);
      doc.text(titleLines, marginX, y);
      y += titleLines.length * 7 + 2;

      doc.setFont('Noto', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text(`${date} - ${quiz.questions.length} Questions`, marginX, y);
      y += 10;

      quiz.questions.forEach((q, idx) => {
        doc.setFont('Noto', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        const qLines = doc.splitTextToSize(`Q${idx + 1}. ${q.question}`, contentWidth);
        ensureSpace(qLines.length * 6 + 4);
        doc.text(qLines, marginX, y);
        y += qLines.length * 6 + 3;

        doc.setFont('Noto', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        q.options.forEach((opt, oi) => {
          const label = String.fromCharCode(65 + oi);
          const optLines = doc.splitTextToSize(`${label}) ${opt}`, contentWidth - 6);
          ensureSpace(optLines.length * 5.5 + 2);
          doc.text(optLines, marginX + 6, y);
          y += optLines.length * 5.5 + 2;
        });
        y += 6;
      });

      const safeTitle = (quiz.title || 'quiz').replace(/[^a-z0-9]+/gi, '_');
      doc.save(`${safeTitle}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchQuiz(date)
      .then(data => {
        if (!data) setError('Quiz not found.');
        else setQuiz(data);
      })
      .catch(() => setError('Failed to load quiz.'))
      .finally(() => setLoading(false));
  }, [date]);

  if (loading) return (
    <div className="min-h-screen pt-28 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen pt-28 flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950 px-4 text-center">
      <p className="text-slate-500 dark:text-slate-400 font-medium">{error}</p>
      <Link to="/quiz" className="text-xs font-bold text-primary hover:underline">← Back to Quiz Vault</Link>
    </div>
  );

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-950 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <Link to="/quiz" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-primary transition-colors">
            <ChevronLeft size={14} /> Back to Quiz Vault
          </Link>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50">
            {downloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            {downloading ? 'Preparing…' : 'PDF'}
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] uppercase tracking-widest mb-3">
            <BookOpen size={11} /> Answer Key
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{quiz.title}</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">{date} · {quiz.questions.length} Questions</p>
        </motion.div>

        <div className="flex flex-col gap-5">
          {quiz.questions.map((q, idx) => (
            <motion.div key={q.id || idx}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">

              <p className="text-[11px] font-black text-primary uppercase tracking-widest mb-2">Q{idx + 1}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4 leading-relaxed whitespace-pre-wrap">{q.question}</p>

              <div className="flex flex-col gap-2">
                {q.options.map((opt, oi) => {
                  const isCorrect = oi === q.correct;
                  return (
                    <div key={oi}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium ${
                        isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                      }`}>
                      {isCorrect
                        ? <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                        : <span className="w-[15px] h-[15px] rounded-full border-2 border-slate-300 dark:border-slate-600 shrink-0 inline-block" />
                      }
                      {opt}
                      {isCorrect && <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-emerald-500">Correct</span>}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
